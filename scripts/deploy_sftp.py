#!/usr/bin/env python3
"""Deploy the verified release over SFTP; never operate outside named release dirs."""
import base64
import hashlib
import hmac
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
from zipfile import ZipFile
import paramiko

ROOT = Path(__file__).resolve().parents[1]
TARGET = 'psoydo'
MARKER = '.psoydo-release.json'


def release():
    manifest = json.loads((ROOT / 'dist/psoydo-manifest.json').read_text())
    data = (ROOT / 'dist/psoydo-upload.zip').read_bytes()
    if manifest['working_tree_modified'] or not re.fullmatch(r'[a-f0-9]{40}', manifest['source_commit']):
        raise ValueError('Deploy requires a clean, committed release')
    if hashlib.sha256(data).hexdigest() != manifest['archive_sha256']:
        raise ValueError('Archive checksum mismatch')
    with ZipFile(io.BytesIO(data)) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or set(names) != set(manifest['files']):
            raise ValueError('Archive/manifest file list mismatch')
        files = {}
        for name in names:
            if name.startswith('/') or '..' in PurePosixPath(name).parts or '\\' in name:
                raise ValueError('Unsafe release path')
            content = archive.read(name)
            if hashlib.sha256(content).hexdigest() != manifest['files'][name]:
                raise ValueError('File checksum mismatch')
            files[name] = content
    return manifest, files


class PinnedHost(paramiko.MissingHostKeyPolicy):
    def __init__(self, expected):
        self.expected = expected

    def missing_host_key(self, client, hostname, key):
        actual = 'SHA256:' + base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip('=')
        if not hmac.compare_digest(actual, self.expected):
            raise paramiko.SSHException('SFTP server fingerprint does not match the configured fingerprint')


def host_pin(host, port):
    pin = json.loads((ROOT / 'deployment/ud-host.json').read_text())
    if host != pin['host'] or port != pin['port']:
        raise ValueError('SFTP host/port does not match the committed host key')
    return pin['fingerprint']


def exists(sftp, path):
    try:
        return sftp.lstat(path)
    except FileNotFoundError:
        return None


def deploy(sftp, manifest, files, run_id):
    stage = f'psoydo-release-{run_id}'
    backup = f'psoydo-backup-{run_id}'
    for name in (stage, backup):
        if exists(sftp, name):
            raise ValueError('Release or backup directory already exists; inspect before retrying')
    old = exists(sftp, TARGET)
    if old:
        if not stat.S_ISDIR(old.st_mode):
            raise ValueError('Target must be a real directory, not a symlink')
        if sftp.listdir(TARGET):
            with sftp.open(TARGET + '/' + MARKER, 'r') as handle:
                previous = json.load(handle)
            if previous.get('site') != 'psoydo.com':
                raise ValueError('Refusing to replace a directory not managed by this deployment')
    sftp.mkdir(stage)
    dirs = {stage}
    for name, content in sorted(files.items()):
        path = stage + '/' + name
        parent = PurePosixPath(path).parent
        for directory in reversed([parent, *parent.parents]):
            directory = str(directory)
            if directory != '.' and directory not in dirs:
                sftp.mkdir(directory)
                dirs.add(directory)
        with sftp.open(path, 'wb') as handle:
            handle.write(content)
        sftp.chmod(path, 0o644)
        with sftp.open(path, 'rb') as handle:
            if hashlib.sha256(handle.read()).hexdigest() != manifest['files'][name]:
                raise ValueError('Remote upload checksum mismatch; current site unchanged')
    with sftp.open(stage + '/' + MARKER, 'w') as handle:
        handle.write(json.dumps({'site': 'psoydo.com', 'commit': manifest['source_commit']}))
    if old:
        sftp.rename(TARGET, backup)
    try:
        sftp.rename(stage, TARGET)
    except Exception:
        if old:
            sftp.rename(backup, TARGET)
        raise
    print(f'Uploaded and verified {len(files)} files in psoydo/.')
    if old:
        print(f'Previous release retained in {backup}/. No backups deleted.')


def main():
    values = {key: os.environ.get(key, '').strip() for key in ('UD_SFTP_HOST', 'UD_SFTP_USER')}
    password = os.environ.get('UD_SFTP_PASSWORD', '')
    if not all(values.values()) or not password:
        raise ValueError('Required repository secrets: UD_SFTP_HOST, UD_SFTP_USER, UD_SFTP_PASSWORD')
    port = int(os.environ.get('UD_SFTP_PORT') or '22')
    fingerprint = host_pin(values['UD_SFTP_HOST'], port)
    run_id = os.environ.get('GITHUB_RUN_ID', '') + '-' + os.environ.get('GITHUB_RUN_ATTEMPT', '')
    if not re.fullmatch(r'\d+-\d+', run_id):
        raise ValueError('Run this deployment through GitHub Actions')
    manifest, files = release()
    with paramiko.SSHClient() as client:
        client.set_missing_host_key_policy(PinnedHost(fingerprint))
        client.connect(values['UD_SFTP_HOST'], port=port, username=values['UD_SFTP_USER'],
                       password=password, allow_agent=False, look_for_keys=False,
                       timeout=30, auth_timeout=30, banner_timeout=30)
        with client.open_sftp() as sftp:
            deploy(sftp, manifest, files, run_id)


if __name__ == '__main__':
    main()

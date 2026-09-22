#!/usr/bin/env python3
"""Build a verified static upload archive. Does not connect to a hosting account."""
from __future__ import annotations
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ROOT_FILES = ['index.html', '404.html', 'styles.css', 'polish.css', 'v3.css',
              'insights.css', 'pricing.css', 'technology.css', 'app.js', 'favicon.svg', 'og-image.png',
              'robots.txt', 'sitemap.xml']

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if value and name in ('href', 'src', 'poster', 'data-lightbox-src'):
                self.refs.append(value)

def validate(files):
    allowed = {p.resolve() for p in files}
    for file in files:
        if file.is_symlink() or not file.is_file():
            raise ValueError(f'Not a regular release file: {file.relative_to(ROOT)}')
        if file.suffix not in ('.html', '.css'):
            continue
        content = file.read_text()
        refs = []
        if file.suffix == '.html':
            parser = References()
            parser.feed(content)
            refs = parser.refs
        else:
            refs = re.findall(r'url\([\s\'"]*([^\)\'"\s]+)', content)
        for ref in refs:
            parsed = urlsplit(ref)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            target = (ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/')
                      else file.parent / unquote(parsed.path))
            if parsed.path.endswith('/'):
                target /= 'index.html'
            if target.resolve() not in allowed:
                raise ValueError(f'{file.relative_to(ROOT)} references unpackaged file: {ref}')
    # The error page resolves its logo and styles in JS; these must remain present.
    for name in ['assets/web/psoydo-negative.webp', 'de/index.html', 'de/insights.html']:
        if (ROOT / name).resolve() not in allowed:
            raise ValueError(f'Missing dynamic/navigation dependency: {name}')

def main():
    files = [ROOT / name for name in ROOT_FILES]
    files += sorted((ROOT / 'de').glob('*.html'))
    files += sorted((ROOT / 'assets/web').glob('*.webp'))
    validate(files)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=normal'], cwd=ROOT, text=True).strip())
    manifest = {'source_commit': commit, 'working_tree_modified': dirty, 'files': {}}
    OUT.mkdir(exist_ok=True)
    archive = OUT / 'psoydo-upload.zip'
    with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as bundle:
        for file in sorted(files):
            name = file.relative_to(ROOT).as_posix()
            data = file.read_bytes()
            manifest['files'][name] = hashlib.sha256(data).hexdigest()
            item = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            item.compress_type = ZIP_DEFLATED
            item.external_attr = 0o100644 << 16
            bundle.writestr(item, data)
    # Verify the finished artifact rather than only the working directory.
    with ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise ValueError('Corrupt release archive')
        for name, digest in manifest['files'].items():
            if hashlib.sha256(bundle.read(name)).hexdigest() != digest:
                raise ValueError(f'Archive content mismatch: {name}')
            if '..' in PurePosixPath(name).parts or name.startswith('/'):
                raise ValueError(f'Unsafe archive path: {name}')
    manifest['archive_sha256'] = hashlib.sha256(archive.read_bytes()).hexdigest()
    (OUT / 'psoydo-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Created {archive.name}: {len(files)} files, {archive.stat().st_size:,} bytes.')
    print('All local HTML/CSS references resolve inside the upload package. Archive checksums verified.')
    print(f'Source commit: {commit}; working tree modified: {dirty}')

if __name__ == '__main__':
    main()

"""Exercise activation/rollback against a filesystem-backed SFTP stand-in."""
import hashlib
from pathlib import Path
import tempfile
import unittest
from deploy_sftp import deploy, PinnedHost, host_pin
import paramiko

class LocalSFTP:
    def __init__(self, root):
        self.root = root
        self.fail_activation = False
    def lstat(self, name): return (self.root / name).lstat()
    def listdir(self, name): return [p.name for p in (self.root / name).iterdir()]
    def mkdir(self, name): (self.root / name).mkdir()
    def open(self, name, mode): return (self.root / name).open(mode)
    def chmod(self, name, mode): (self.root / name).chmod(mode)
    def rename(self, src, dst):
        if self.fail_activation and src.startswith('psoydo-release-'):
            raise OSError('Simulated activation failure')
        (self.root / src).rename(self.root / dst)

class DeploymentTest(unittest.TestCase):
    def test_initial_update_and_rollback(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            unrelated = root / 'another-site.html'
            unrelated.write_text('keep')
            sftp = LocalSFTP(root)
            files = {'de/index.html': b'first'}
            manifest = {'source_commit': 'a'*40, 'files': {k: hashlib.sha256(v).hexdigest() for k,v in files.items()}}
            deploy(sftp, manifest, files, '1-1')
            files = {'de/index.html': b'second'}
            manifest['files'] = {k: hashlib.sha256(v).hexdigest() for k,v in files.items()}
            deploy(sftp, manifest, files, '2-1')
            self.assertEqual((root/'psoydo-backup-2-1/de/index.html').read_bytes(), b'first')
            sftp.fail_activation = True
            with self.assertRaises(OSError): deploy(sftp, manifest, files, '3-1')
            self.assertEqual((root/'psoydo/de/index.html').read_bytes(), b'second')
            self.assertEqual(unrelated.read_text(), 'keep')
    def test_unmanaged_target_untouched(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'psoydo').mkdir()
            (root/'psoydo/index.html').write_text('keep')
            with self.assertRaises(FileNotFoundError): deploy(LocalSFTP(root), {}, {}, '1-1')
            self.assertEqual((root/'psoydo/index.html').read_text(), 'keep')
            self.assertFalse((root/'psoydo-release-1-1').exists())
    def test_pin_bound_to_host_and_port(self):
        self.assertTrue(host_pin('access-5020757126.ud-webspace.de', 22).startswith('SHA256:'))
        for host, port in [('other.example', 22), ('access-5020757126.ud-webspace.de', 2222)]:
            with self.assertRaises(ValueError): host_pin(host, port)

    def test_wrong_host_rejected(self):
        key = paramiko.RSAKey.generate(2048)
        with self.assertRaises(paramiko.SSHException):
            PinnedHost('SHA256:'+'A'*43).missing_host_key(None, 'example.test', key)
        PinnedHost(key.fingerprint).missing_host_key(None, 'example.test', key)

if __name__ == '__main__': unittest.main()

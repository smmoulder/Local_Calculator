"""Verify the archived Store upload and its recovered runtime source; no installation."""
from pathlib import Path
import hashlib,json,sys,zipfile,xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
record=root/'docs/submissions/9NGJC64ZM2BP/1.0.0.0'
data=json.loads((record/'provenance.json').read_text(encoding='utf-8'))
package=Path(sys.argv[1]) if len(sys.argv)>1 else root/'release'/data['packageFile']
digest=hashlib.file_digest(package.open('rb'),'sha256').hexdigest()
assert digest==data['packageSha256'],'Upload SHA-256 mismatch'
assert package.stat().st_size==data['packageBytes'],'Upload size mismatch'
with zipfile.ZipFile(package) as z:
    assert z.testzip() is None,'ZIP integrity failure'
    assert z.read('AppxManifest.xml')==(record/'AppxManifest.xml').read_bytes(),'Manifest mismatch'
    assert hashlib.sha256(z.read('app/resources/app.asar')).hexdigest()==data['runtimeAsarSha256'],'Embedded runtime mismatch'
    assert 'AppxSignature.p7x' not in z.namelist(),'Expected original unsigned upload'
for item in data['embeddedRuntimeFiles']:
    if item['path']=='package.json':continue
    source=root/item['path']
    assert source.exists(),f'Missing source: {source}'
    assert hashlib.sha256(source.read_bytes()).hexdigest()==item['sha256'],f'Source changed: {source}'
source_metadata=json.loads((root/'package.json').read_text())
embedded_metadata=json.loads((record/'embedded-package.json').read_text())
assert all(source_metadata.get(k)==v for k,v in embedded_metadata.items()),'Runtime metadata mismatch'
print('Verified original unsigned APPX, manifest, embedded runtime hash, and all 14 runtime source/icon files.')
print('SHA-256:',digest)
print('Original historical producer commit: unavailable (the original build used an uncommitted tree).')
print('Recovered source commit:',data.get('recoveredSourceCommit'))

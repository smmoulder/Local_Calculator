const {test} = require('node:test');
const assert = require('node:assert/strict');
const {externalUrl} = require('./links.cjs');
const fs = require('node:fs');
const vm = require('node:vm');
test('confirmed Telemetry coffee button opens the correct destination', () => {
  const button = {hidden:true};
  vm.runInNewContext(fs.readFileSync('dist/support.js','utf8'), {URL, document:{getElementById:()=>button}});
  assert.equal(button.href, 'https://buymeacoffee.com/smmoulder');
  assert.equal(button.hidden, false);
  assert.equal(externalUrl(button.href), button.href);
});
test('only trusted HTTPS links can leave the desktop window', () => {
  assert.equal(externalUrl('https://huggingface.co/example/model'), 'https://huggingface.co/example/model');
  assert.equal(externalUrl('https://www.buymeacoffee.com/example'), 'https://www.buymeacoffee.com/example');
  for (const url of ['file:///C:/Windows/notepad.exe', 'javascript:alert(1)', 'http://github.com/', 'https://github.com.evil.example/', 'https://user:password@github.com/']) assert.equal(externalUrl(url), null);
});

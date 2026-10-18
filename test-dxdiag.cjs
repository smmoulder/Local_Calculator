const assert=require('node:assert/strict');
const {dxParse,dxDecode,dxSliderValue}=require('./dist/dxdiag.js');
const sample=`------------
Display Devices
------------
           Card name: Intel(R) UHD Graphics 770
    Dedicated Memory: 128 MB
        Shared Memory: 16288 MB
           Card name: NVIDIA GeForce RTX 4070
    Dedicated Memory: 12011 MB
        Shared Memory: 16288 MB
`;
const r=dxParse(sample);
assert.equal(r.name,'NVIDIA GeForce RTX 4070');
assert.equal(r.dedicatedMB,12011);
assert.equal(r.slider,12);
assert.equal(dxParse('no gpu here'),null);
assert.equal(dxSliderValue(23.75),24);
assert.equal(dxSliderValue(300),128);
assert.equal(dxSliderValue(0.1),2);
const utf16=Buffer.concat([Buffer.from([0xFF,0xFE]),Buffer.from(sample,'utf16le')]);
assert.equal(dxParse(dxDecode(utf16)).dedicatedMB,12011);
console.log('DxDiag parsing, UTF-16 decoding, and slider clamping checks passed');

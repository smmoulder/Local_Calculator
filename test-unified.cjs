const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {estimate,unifiedStartBudget}=require('./dist/engine.js');
const s={memoryType:'unified',unifiedTotal:32,modelBudget:8,vram:8,headroom:2,params:12,quant:'Q4_K_M',context:8192,layers:40,heads:8,dim:128,cache:2,overhead:.8,offload:100};
assert.equal(unifiedStartBudget(32),8);assert.equal(unifiedStartBudget(64),16);
assert.equal(estimate(s).total,estimate({...s,offload:0}).total);
assert.equal(estimate(s).band,'Over budget');assert.equal(estimate(s).ram,0);
const exact=estimate(s).total;assert.equal(estimate({...s,modelBudget:exact}).band,'Tight');assert.equal(estimate({...s,modelBudget:exact+2}).band,'Comfortable');
assert.equal(estimate({...s,modelBudget:12}).required,exact);
const e={},parents={},html=fs.readFileSync('dist/index.html','utf8');let saved;
for(const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){const id=m[1];parents[id]={hidden:false};e[id]={value:m[0].match(/value="([^"]*)"/)?.[1]||'',checkValidity:()=>true,closest:()=>parents[id],addEventListener(){},scrollIntoView(){},setAttribute(){},focus(){}}}
for(const [id,value] of Object.entries({quant:'Q4_K_M',context:'8192',cache:'2',hfSort:'fit'}))e[id].value=value;
const c={document:{getElementById:id=>e[id],querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem:(k,v)=>{if(k==='local-ai-setup')saved=v}},TextDecoder,Uint8Array,console,setTimeout:()=>0};vm.createContext(c);
for(const f of ['engine.js','catalog.js','spx.js','hf.js','app.js','dxdiag.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
e.memoryType.value='unified';vm.runInContext('render()',c);assert.equal(e.unifiedControls.hidden,false);assert.equal(parents.vram.hidden,true);assert.equal(parents.offload.hidden,true);assert.match(e.memoryUsageLabel.textContent,/model memory/);assert.match(e.verdict.textContent,/above your chosen/);
assert.equal(JSON.parse(saved).s.dedicatedVram,12);assert.equal(JSON.parse(saved).s.dedicatedHeadroom,2);
e.memoryType.value='dedicated';vm.runInContext('render()',c);assert.equal(parents.vram.hidden,false);assert.equal(e.vram.value,'12');assert.equal(e.headroom.value,'2');
const report=`<?xml version="1.0"?><plist><array><dict><key>_dataType</key><string>SPHardwareDataType</string><key>_items</key><array><dict><key>chip_type</key><string>Apple M4 Max</string><key>physical_memory</key><string>32 GB</string></dict></array></dict></array></plist>`;
(async()=>{const bytes=Buffer.from(report);await e.dxFile.onchange({target:{files:[{name:'Synthetic.spx',size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}],value:'test'}});assert.equal(e.memoryType.value,'unified');assert.equal(Number(e.unifiedTotal.value),32);assert.equal(Number(e.modelBudget.value),8);assert.match(e.dxStatus.textContent,/Apple M4 Max/);assert.match(e.dxStatus.textContent,/heuristic/);e.unifiedTotal.value=8;e.modelBudget.value=12;vm.runInContext('normalizeUnifiedBudget()',c);assert.equal(Number(e.modelBudget.value),6);console.log('Unified memory: full-pool accounting, budget bands, reserve preservation, mode labels, and synthetic SPX import passed');})().catch(error=>{console.error(error);process.exitCode=1});

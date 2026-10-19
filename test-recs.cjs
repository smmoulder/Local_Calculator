const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const c={module:{exports:{}},console,AbortSignal,fetch};vm.createContext(c);
for(const f of ['engine.js','hf.js','recs.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
(async()=>{await vm.runInContext('fetchStartingPoints()',c);const items=vm.runInContext('recItems',c);console.log(items.map(x=>({repo:x.repo,quant:x.quant,verified:x.verified,params:x.params})));assert(items.length>=5);
const s={vram:12,context:8192,headroom:2,offload:100,cache:2,overhead:.8,layers:40,heads:8,dim:128};
c.s=s;const picks=vm.runInContext('recPicks(recItems,s)',c);assert(picks.length>0);assert(picks.every(x=>x.band==='Comfortable'&&x.r.required<=12));
c.s={...s,vram:1};assert.equal(vm.runInContext('recPicks(recItems,s).length',c),0);
c.s={...s,vram:8,memoryType:'unified',modelBudget:8,unifiedTotal:32,headroom:0};assert(vm.runInContext('recPicks(recItems,s)',c).every(x=>x.r.total<=7.2));console.log('Live shortlist metadata, dedicated/unified fit, and empty-budget checks passed');})().catch(e=>{console.error(e);process.exitCode=1});

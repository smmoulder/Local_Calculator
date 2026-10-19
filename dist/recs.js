// A deliberately small, inspectable shortlist. Live file sizes and architecture
// use the same Hugging Face reader and estimator as search.
const STARTING_REPOS=[
 {repo:'bartowski/SmolLM2-1.7B-Instruct-GGUF',family:'smollm',purpose:'Very small starting point for short, simple chat; test accuracy carefully.'},
 {repo:'Qwen/Qwen3-4B-GGUF',family:'qwen',purpose:'Compact general-purpose option; reasoning mode and output length affect responsiveness.'},
 {repo:'Qwen/Qwen3-8B-GGUF',family:'qwen',purpose:'Mid-size general chat and reasoning option to compare on your own tasks.'},
 {repo:'Qwen/Qwen3-14B-GGUF',family:'qwen',purpose:'Larger general-purpose option when your budget has room.'},
 {repo:'bartowski/Qwen2.5-Coder-7B-Instruct-GGUF',family:'coder',purpose:'Coding-focused instruction model; compare with general chat models for non-code work.'},
 {repo:'bartowski/Qwen2.5-Coder-32B-Instruct-GGUF',family:'coder',purpose:'Larger coding-focused option for a generous memory budget.'},
 {repo:'Qwen/Qwen3-32B-GGUF',family:'qwen',purpose:'Larger general-purpose comparison for high-memory hardware.'}
];
let recTimer=null,recKey='',recItems=[],recPending=null,recLoaded=false,recFailed=0;
function recPicks(items,s){
 const ranked=items.map(m=>({m,...hfForecast(m,s)}))
  .filter(x=>x.band==='Comfortable'&&x.confidence==='Moderate'&&x.m.cap>=s.context)
  .sort((a,b)=>b.m.params-a.m.params||a.r.total-b.r.total);
 // One per use/family first, then fill remaining room. Avoid three quantizations
 // of one model, and never force a spill-prone suggestion into an empty shortlist.
 const picks=[],families=new Set();
 for(const x of ranked){if(families.has(x.m.family))continue;picks.push(x);families.add(x.m.family);if(picks.length===3)return picks}
 for(const x of ranked){if(picks.includes(x))continue;picks.push(x);if(picks.length===3)break}
 return picks;
}
async function fetchStartingPoints(){
 if(recPending)return recPending;
 recPending=(async()=>{const items=[];let failed=0;
  await Promise.all(STARTING_REPOS.map(async entry=>{try{
   const files=await hfRepoOptions(entry.repo);
   const m=files.find(m=>m.quant==='Q4_K_M');
   if(m)items.push({...m,...entry});else failed++;
  }catch{failed++}}));
  recItems=items;recFailed=failed;recLoaded=true;
 })().finally(()=>recPending=null);
 return recPending;
}
async function updateRecs(){
 const status=document.getElementById('recsStatus'),list=document.getElementById('recsList');
 if(!recLoaded){status.textContent='Reading shortlist file sizes and architecture from Hugging Face…';await fetchStartingPoints()}
 const s=state(),picks=recPicks(recItems,s);
 const budget=s.memoryType==='unified'?'chosen model budget':'VRAM';
 status.textContent=`${s.vram} GiB ${budget} · ${s.context/1024}K context · ${s.memoryType==='unified'?'10% budget margin':s.headroom+' GiB desired reserve'} · current cache, overhead, and offload settings. `+
  (picks.length?'Comfortable estimates with sourced cache dimensions; actual allocations and task quality still need testing.':'No shortlist models have a comfortable, supported estimate at these settings. Try less context, a larger budget, or explore search below.')+
  (recFailed?` ${recFailed} shortlist repositories could not provide usable files; refresh to retry.`:'');
 list.innerHTML=picks.map((x,i)=>`<article class="hf-file ok rec-card"><div class="hf-main"><div class="hf-title"><strong>${esc(x.m.repo)}</strong><span class="pill ok">Comfortable</span></div><p class="forecast-filename">${esc(x.m.name)}</p><p class="rec-purpose">${esc(x.m.purpose)}</p><div class="hf-meta"><span>${x.m.params}B</span><span>${esc(x.m.quant)}</span><span>Moderate confidence</span></div><a href="https://huggingface.co/${repoPath(x.m.repo)}" target="_blank" rel="noreferrer">Model card / license ↗</a></div><div class="hf-side"><span class="hf-vram">${x.r.total.toFixed(1)}<small> GiB estimated</small></span><span class="hf-free">${x.r.free.toFixed(1)} ${s.memoryType==='unified'?'budget free':'free'}</span><button type="button" data-rec="${i}">Load into calculator →</button></div></article>`).join('');
 list.onclick=e=>{const b=e.target.closest('[data-rec]');if(!b)return;const m=picks[Number(b.dataset.rec)]?.m;if(!m)return;let i=hfOptions.findIndex(x=>x.repo===m.repo&&x.name===m.name);if(i<0){i=hfOptions.length;hfOptions.push(m)}hfLoad(i)};
}
function scheduleRecs(){
 const s=state(),key=JSON.stringify([s.vram,s.memoryType,s.context,s.headroom,s.offload,s.cache,s.overhead,s.layers,s.heads,s.dim]);
 if(key===recKey)return;recKey=key;clearTimeout(recTimer);recTimer=setTimeout(updateRecs,250);
}
if(typeof document!=='undefined'&&document.getElementById('recs')){
 document.getElementById('recsRetry').onclick=()=>{recLoaded=false;updateRecs()};
 scheduleRecs();
}
if(typeof module!=='undefined')module.exports={recPicks,STARTING_REPOS};

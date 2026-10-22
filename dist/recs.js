// A deliberately small, inspectable shortlist. Live file sizes and architecture
// use the same Hugging Face reader and estimator as search.
const STARTING_REPOS=[
 {repo:'ggml-org/gemma-3-4b-it-GGUF',metadataRepo:'unsloth/gemma-3-4b-it',family:'gemma',purpose:'Gemma instruction model for text chat. Conservative full-context cache estimate; vision/projector memory is excluded.'},
 {repo:'bartowski/Llama-3.2-3B-Instruct-GGUF',metadataRepo:'unsloth/Llama-3.2-3B-Instruct',family:'llama',purpose:'Compact Llama instruction model for everyday text chat.'},
 {repo:'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF',metadataRepo:'unsloth/Meta-Llama-3.1-8B-Instruct',family:'llama',purpose:'Larger Llama instruction model to compare on your own chat and writing tasks.'},
 {repo:'bartowski/SmolLM2-1.7B-Instruct-GGUF',family:'smollm',purpose:'Very small starting point for short, simple chat; test accuracy carefully.'},
 {repo:'Qwen/Qwen3-4B-GGUF',family:'qwen',purpose:'Compact general-purpose option; reasoning mode and output length affect responsiveness.'},
 {repo:'Qwen/Qwen3-8B-GGUF',family:'qwen',purpose:'Mid-size general chat and reasoning option to compare on your own tasks.'},
 {repo:'Qwen/Qwen3-14B-GGUF',family:'qwen',purpose:'Larger general-purpose option when your budget has room.'},
 {repo:'bartowski/Qwen2.5-Coder-7B-Instruct-GGUF',family:'qwen',purpose:'Coding-focused instruction model; compare with general chat models for non-code work.'},
 {repo:'bartowski/Qwen2.5-Coder-32B-Instruct-GGUF',family:'qwen',purpose:'Larger coding-focused option for a generous memory budget.'},
 {repo:'Qwen/Qwen3-32B-GGUF',family:'qwen',purpose:'Larger general-purpose comparison for high-memory hardware.'}
];
let recTimer=null,recKey='',recItems=[],recPending=null,recLoaded=false,recFailed=0;
function recPicks(items,s){
 const ranked=items.map(m=>({m,...hfForecast(m,s)}))
  .filter(x=>x.band==='Comfortable'&&(x.confidence==='Moderate'||x.m.conservativeCache)&&x.m.cap>=s.context)
  .sort((a,b)=>b.m.params-a.m.params||a.r.total-b.r.total);
 // Reserve places for distinct families before offering specialist variants.
 const picks=[],families=new Set();
 for(const family of ['qwen','gemma','llama','smollm']){
  const x=ranked.find(x=>x.m.family===family);if(x){picks.push(x);families.add(family)}
 }
 const coder=ranked.find(x=>x.m.repo.includes('Coder')&&!picks.includes(x));
 if(coder)picks.push(coder);
 return picks;
}
async function fetchStartingPoints(){
 if(recPending)return recPending;
 recPending=(async()=>{const items=[];let failed=0;
  await Promise.all(STARTING_REPOS.map(async entry=>{try{
   const files=await hfRepoOptions(entry.repo);
   const m=files.find(m=>m.quant==='Q4_K_M');
   if(!m){failed++;return}
   if(!m.verified&&entry.metadataRepo){
    const {data}=await hfJSON(`https://huggingface.co/${repoPath(entry.metadataRepo)}/resolve/main/config.json`);
    const c=data.text_config||data,layers=Number(c.num_hidden_layers),heads=Number(c.num_key_value_heads??c.num_attention_heads),dim=Number(c.head_dim||c.hidden_size/c.num_attention_heads);
    const profile=hfArchitecture(c,c.model_type,layers,heads,dim);
    const conservativeCache=entry.family==='gemma'&&[layers,heads,dim].every(n=>Number.isFinite(n)&&n>0);
    if(profile.verified||conservativeCache)Object.assign(m,{layers,heads,dim,verified:profile.verified,conservativeCache,configSource:entry.metadataRepo,cap:Number(c.max_position_embeddings)||m.cap,profileReason:conservativeCache?'Conservative text-only estimate: all layers cache the full active context instead of modeling Gemma’s sliding-window cache. Runtime allocation varies; vision/projector memory is excluded.':'Full-attention cache dimensions from a public base-model config mirror; runtime allocations remain approximate.'});
   }
   items.push({...m,...entry});
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
  (picks.length?'A mix of families that fit on paper; Gemma uses a conservative cache estimate labeled low confidence. Actual allocations and task quality still need testing.':'No shortlist models have a comfortable, supported estimate at these settings. Try less context, a larger budget, or explore search below.')+
  (recFailed?` ${recFailed} shortlist repositories could not provide usable files; refresh to retry.`:'');
 list.innerHTML=picks.map((x,i)=>`<article class="hf-file ok rec-card"><div class="hf-main"><div class="hf-title"><strong>${esc(x.m.repo)}</strong><span class="pill ok">${x.confidence==='Low'?'Likely comfortable':'Comfortable'}</span></div><p class="forecast-filename">${esc(x.m.name)}</p><p class="rec-purpose">${esc(x.m.purpose)}</p>${x.confidence==='Low'?`<p class="note">${esc(x.reason)}</p>`:''}<div class="hf-meta"><span>${x.m.params}B</span><span>${esc(x.m.quant)}</span><span>${esc(x.confidence)} confidence</span></div><a href="https://huggingface.co/${repoPath(x.m.repo)}" target="_blank" rel="noreferrer">Model card / license ↗</a></div><div class="hf-side"><span class="hf-vram">${x.r.total.toFixed(1)}<small> GiB estimated</small></span><span class="hf-free">${x.r.free.toFixed(1)} ${s.memoryType==='unified'?'budget free':'free'}</span><button type="button" data-rec="${i}">Load into calculator →</button></div></article>`).join('');
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

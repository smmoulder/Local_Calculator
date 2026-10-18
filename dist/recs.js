// Recommendations: after a DxDiag import or GPU memory change, sample popular
// GGUF repositories and bubble up the three best comfortable fits.
let recGeneration=0,recTimer=null,recRepoCache=null;
async function recRepos(){
 if(recRepoCache)return recRepoCache;
 const {data}=await hfJSON('https://huggingface.co/api/models?filter=gguf&pipeline_tag=text-generation&sort=downloads&direction=-1&limit=12');
 if(!Array.isArray(data))throw Error('Unexpected search response.');
 recRepoCache=data.map(m=>m.id);
 return recRepoCache;
}
async function updateRecs(){
 const box=document.getElementById('recs');if(!box)return;
 const generation=++recGeneration;
 const s=state();
 box.hidden=false;
 document.getElementById('recsStatus').textContent=`Finding comfortable fits for ${s.vram} GiB…`;
 document.getElementById('recsList').innerHTML='';
 try{
  const repos=await recRepos();
  const options=[],seen=new Set();let cursor=0;
  async function worker(){while(cursor<repos.length&&generation===recGeneration){const repo=repos[cursor++];try{const items=await hfRepoOptions(repo);if(generation!==recGeneration)return;for(const m of items){const key=m.repo+'|'+m.name;if(!seen.has(key)){seen.add(key);options.push(m)}}}catch{}}}
  await Promise.all([worker(),worker(),worker()]);
  if(generation!==recGeneration)return;
  const ranked=options.map(m=>({m,...hfForecast(m,s)}))
   .filter(x=>x.band==='Comfortable')
   .sort((a,b)=>((b.m.params??-1)-(a.m.params??-1))||a.r.total-b.r.total);
  const picks=[],usedRepos=new Set();
  for(const x of ranked){if(picks.length>=3)break;if(usedRepos.has(x.m.repo))continue;usedRepos.add(x.m.repo);picks.push(x)}
  if(!picks.length){document.getElementById('recsStatus').textContent='No comfortable fits found among popular repositories at these settings. Try lowering context or reserve.';return}
  document.getElementById('recsStatus').textContent=`Three comfortable fits for ${s.vram} GiB at ${(s.context/1024).toFixed(0)}K context, sampled from popular repositories. Estimates, not quality rankings.`;
  document.getElementById('recsList').innerHTML=picks.map((x,i)=>{const pct=Math.min(100,x.r.total/s.vram*100);return `<article class="hf-file rec-card"><div class="hf-main"><div class="hf-title"><strong>${esc(x.m.repo)}</strong><span class="pill ok">Comfortable</span></div><p class="forecast-filename">${esc(x.m.name)}</p><div class="hf-meta"><span>${x.m.params===null?'? params':x.m.params+'B'}</span><span>${esc(x.m.quantLabel||x.m.quant)}</span><span>${(x.m.bytes/2**30).toFixed(2)} GiB file</span></div><div class="hf-meter" title="${x.r.total.toFixed(1)} of ${s.vram} GiB"><i style="width:${pct}%"></i></div></div><div class="hf-side"><span class="hf-vram">${x.r.total.toFixed(1)}<small> GiB</small></span><span class="hf-free">${x.r.free.toFixed(1)} free</span><button data-rec="${i}">Load →</button></div></article>`}).join('');
  document.getElementById('recsList').onclick=e=>{const b=e.target.closest('[data-rec]');if(!b)return;const m=picks[Number(b.dataset.rec)].m;hfOptions.push(m);hfLoad(hfOptions.length-1)};
 }catch(e){if(generation===recGeneration)document.getElementById('recsStatus').textContent=`Recommendations unavailable: ${e.message} The search below still works.`}
}
function scheduleRecs(){clearTimeout(recTimer);recTimer=setTimeout(updateRecs,600)}
if(typeof document!=='undefined'&&document.getElementById('recs')){
 document.getElementById('vram').addEventListener('change',scheduleRecs);
 document.getElementById('dxFile').addEventListener('change',()=>setTimeout(scheduleRecs,100));
 document.getElementById('recsDismiss').onclick=()=>{recGeneration++;document.getElementById('recs').hidden=true};
}

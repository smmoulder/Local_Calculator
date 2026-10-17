const $=id=>document.getElementById(id),ids=['vram','params','quant','context','offload','headroom','layers','heads','dim','cache','overhead'];
let mode='model';const defaults=Object.fromEntries(ids.map(id=>[id,$(id).value]));
function state(){return Object.fromEntries(ids.map(id=>[id,id==='quant'?$(id).value:Number($(id).value)]))}
const fmt=n=>n.toFixed(1),colors=['#285d4a','#84a47c','#d4b77a','#d3dccd'];
function render(){const s=state();if(ids.some(id=>id!=='quant'&&(!$(id).checkValidity()||$(id).value===''))){$('verdict').textContent='Enter valid values in the advanced assumptions to update the estimate.';return}const r=estimate(s);
 $('vramO').textContent=s.vram+' GiB';$('paramsO').textContent=s.params+'B';$('offloadO').textContent=s.offload+'%';$('headroomO').textContent=s.headroom+' GiB';
 $('total').textContent=fmt(r.total);$('required').textContent=fmt(r.required)+' GiB including desired reserve';$('badge').textContent=r.band;$('badge').className=r.band==='Tight'?'tight':r.band==='Spill likely'?'spill':'';
 const parts=[r.gpuWeights,r.gpuKV,s.overhead,Math.max(0,r.free)],labels=['Model weights','KV cache','Runtime / buffers','Free memory'];const scale=Math.max(s.vram,r.total);
 $('bar').innerHTML=parts.map((v,i)=>`<div title="${labels[i]}: ${fmt(v)} GiB" style="width:${v/scale*100}%;background:${colors[i]}"></div>`).join('');
 $('legend').innerHTML=parts.map((v,i)=>`<span><i style="background:${colors[i]}"></i>${labels[i]} <b>${fmt(v)} GiB</b></span>`).join('');
 $('free').textContent=fmt(r.free)+' GiB';$('ram').textContent=fmt(r.ram)+' GiB';
 $('verdict').textContent=r.band==='Comfortable'?`Room to breathe. This estimate leaves ${fmt(r.free)} GiB free, meeting your ${s.headroom} GiB reserve.`:r.band==='Tight'?`It fits on paper, but leaves only ${fmt(r.free)} GiB free. Reduce context or precision, or use a smaller model to restore your reserve.`:`About ${fmt(-r.free)} GiB over capacity. Reduce model size, context, precision, or GPU offload. Spill can sharply slow responses; loading may fail.`;
 $('quality').textContent=`${s.params}B describes learned capacity, not an intelligence score. ${s.quant} ${s.quant==='FP16'?'retains the baseline storage precision.':'compresses the learned weights; lower precision can lose detail and reasoning accuracy.'} Compare quality within model families and test your own tasks.`;
 $('memory').textContent=`${(s.context/1024).toFixed(0)}K tokens is room for instructions, conversation, documents, and output together. At the assumed architecture, its full KV cache is ${fmt(r.kv)} GiB before offload. More context keeps more material in view; it does not increase intelligence.`;
 $('speed').textContent=`${s.offload<100?'Some computation moves to the CPU, often reducing speed.':'Full GPU offload avoids CPU layer work if the allocation fits.'} Longer active prompts take more processing and attention work. Quantization can help speed through lower memory traffic, but kernels and hardware matter. No tokens/sec prediction is implied.`;
 $('recommendations').hidden=mode!=='gpu';if(mode==='gpu')renderRanges(s);
 try{localStorage.setItem('local-ai-setup',JSON.stringify({s,mode}))}catch{}
}
function renderRanges(s){let rows=[];for(const q of ['Q4_K_M','Q5_K_M','Q8_0'])for(const context of [4096,8192,32768]){let max=0;for(let p=1;p<=72;p+=.5)if(estimate({...s,params:p,quant:q,context,offload:100}).band==='Comfortable')max=p;rows.push(`<tr><td>${q}</td><td>${context/1024}K</td><td>${max?`1–${max}B`:'No fit ≥1B'}</td><td>${max?`<button data-p="${max}" data-q="${q}" data-c="${context}">Try ${max}B ↗</button>`:'—'}</td></tr>`)}$('ranges').innerHTML='<table><thead><tr><th>Precision</th><th>Context</th><th>Comfortable range</th><th>Explore</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>'}
ids.forEach(id=>$(id).addEventListener('input',render));
function setMode(m){mode=m;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===m);b.setAttribute('aria-pressed',b.dataset.mode===m)});render()}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{$('vram').value=b.dataset.v;render()});
document.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{if(b.dataset.exp==='context'){$('context').value=$('context').value==='131072'?'8192':'131072';b.textContent=$('context').value==='131072'?'Return to 8K context ↙':'8K → 128K context ↗'}if(b.dataset.exp==='quant'){$('quant').value=$('quant').value==='Q8_0'?'Q4_K_M':'Q8_0';b.textContent=$('quant').value==='Q8_0'?'Return to Q4 precision ↙':'Q4 → Q8 precision ↗'}if(b.dataset.exp==='offload'){$('offload').value=$('offload').value==='50'?'100':'50'}render()});
 $('ranges').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;$('params').value=b.dataset.p;$('quant').value=b.dataset.q;$('context').value=b.dataset.c;$('offload').value=100;render();$('params').focus()};
 $('reset').onclick=()=>{ids.forEach(id=>$(id).value=defaults[id]);setMode('model')};
try{const saved=JSON.parse(localStorage.getItem('local-ai-setup'));if(saved){ids.forEach(id=>{if(saved.s[id]!==undefined)$(id).value=saved.s[id]});mode=saved.mode==='gpu'?'gpu':'model'}}catch{}setMode(mode);

// DxDiag import: reads a saved DxDiag.txt in the browser and sets GPU memory.
function dxDecode(bytes){
 const u=new Uint8Array(bytes);
 if(u[0]===0xFF&&u[1]===0xFE)return new TextDecoder('utf-16le').decode(u);
 if(u[0]===0xFE&&u[1]===0xFF)return new TextDecoder('utf-16be').decode(u);
 // UTF-16 without BOM: many zero bytes in odd positions
 let z=0;for(let i=1;i<Math.min(u.length,400);i+=2)if(u[i]===0)z++;
 if(z>100)return new TextDecoder('utf-16le').decode(u);
 return new TextDecoder('utf-8').decode(u);
}
function dxParse(text){
 const cards=[];let cur=null;
 for(const raw of String(text).split(/\r?\n/)){
  const line=raw.trim();
  const name=line.match(/^Card name:\s*(.+)$/i);
  if(name){cur={name:name[1].trim(),dedicatedMB:null};cards.push(cur);continue}
  const ded=line.match(/^Dedicated Memory:\s*([\d.,]+)\s*MB/i);
  if(ded&&cur&&cur.dedicatedMB===null)cur.dedicatedMB=Number(ded[1].replace(/,/g,''));
 }
 const valid=cards.filter(c=>Number.isFinite(c.dedicatedMB)&&c.dedicatedMB>0);
 if(!valid.length)return null;
 const best=valid.reduce((a,b)=>b.dedicatedMB>a.dedicatedMB?b:a);
 const gib=best.dedicatedMB/1024;
 return {name:best.name,dedicatedMB:best.dedicatedMB,gib,slider:dxSliderValue(gib),cards:valid};
}
function dxSliderValue(gib){return Math.max(2,Math.min(128,Math.round(gib/2)*2))}

if(typeof document!=='undefined'&&document.getElementById('dxFile')){
 const g=id=>document.getElementById(id);
 async function importReport(f){
  if(!f)return;
  if(!/\.(txt|spx)$/i.test(f.name)){g('dxStatus').textContent='Choose a Windows .txt report or Mac .spx system report.';return}
  if(f.size>25*1024*1024){g('dxStatus').textContent='That report exceeds the 25 MB limit. Save a smaller system report.';return}
  try{
   const bytes=await f.arrayBuffer();const text=dxDecode(bytes);
   if(new Uint8Array(bytes).slice(0,6).every((v,i)=>v===[98,112,108,105,115,116][i])&&bytes.byteLength>=6)throw Error('Binary plist reports are not supported yet. Please export an XML system report.');
   const isMac=/\.spx$/i.test(f.name)||/<plist[\s>]/i.test(text);
   const r=isMac?spxParse(text):dxParse(text);
   if(r?.unified){g('dxStatus').textContent='Apple silicon unified memory detected. It is shared system memory, not dedicated VRAM. Your GPU setting has not changed; unified-memory support will be added separately.';return}
   if(!r){g('dxStatus').textContent='No dedicated GPU memory found. Use a DxDiag “Save All Information” .txt or System Information .spx report. Your GPU setting has not changed.';return}
   const slider=dxSliderValue(r.gib);g('vram').value=slider;render();
   const others=r.cards.length>1?` ${r.cards.length} GPUs with reported dedicated memory found; using the one with the most memory.`:'';
   const rounded=Math.abs(slider-r.gib)>.01?` Rounded/clamped to the slider’s 2 GiB steps and 2–128 GiB range; reported memory is ${r.gib.toFixed(2)} GiB.`:'';
   g('dxStatus').textContent=`Found ${r.name} · ${r.gib.toFixed(1)} GiB dedicated. GPU memory set to ${slider} GiB.${others}${rounded}`;
   if(g('setupBody').hidden)g('setupSummary').innerHTML=summary();
  }catch(err){g('dxStatus').textContent='Could not read that report: '+err.message+' GPU setting unchanged.'}
 }
 g('dxFile').onchange=async e=>{await importReport(e.target.files?.[0]);e.target.value=''};
 const drop=g('hardwareDrop');
 if(drop){drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragging')});drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));drop.addEventListener('drop',async e=>{e.preventDefault();drop.classList.remove('dragging');if(e.dataTransfer.files.length!==1){g('dxStatus').textContent='Drop one hardware report at a time.';return}await importReport(e.dataTransfer.files[0])});}
 // Collapsible setup
 const qLabel=()=>g('quant').value==='FILE'?'file size':g('quant').value;
  function summary(){return `<span class="sum-item"><b>${g('vram').value} GiB</b> GPU</span><span class="sum-edit">Edit setup ✎</span>`}
  function setCollapsed(c){g('setupBody').hidden=c;g('setupSummary').hidden=!c;g('setupToggle').textContent=c?'Show setup ▼':'Hide setup ▲';g('setupToggle').setAttribute('aria-expanded',String(!c));if(c)g('setupSummary').innerHTML=summary();try{localStorage.setItem('local-ai-setup-collapsed',c?'1':'')}catch{}}
 g('setupToggle').onclick=()=>setCollapsed(!g('setupBody').hidden);
 g('setupSummary').onclick=()=>setCollapsed(false);
 const refresh=()=>{if(g('setupBody').hidden)g('setupSummary').innerHTML=summary()};
 document.addEventListener('input',refresh);document.addEventListener('change',refresh);
 g('hfResults').addEventListener('click',()=>setTimeout(refresh));
 const autoCollapse=()=>{if(!g('setupBody').hidden)setCollapsed(true)};
 g('hfForm').addEventListener('submit',autoCollapse);
 ['hfFamily','hfAuthor'].forEach(id=>g(id).addEventListener('change',autoCollapse));
 try{if(localStorage.getItem('local-ai-setup-collapsed'))setCollapsed(true)}catch{}
}
if(typeof module!=='undefined')module.exports={dxParse,dxDecode,dxSliderValue};

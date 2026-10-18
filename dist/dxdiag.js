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
 g('dxFile').onchange=async e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;
  try{
   const r=dxParse(dxDecode(await f.arrayBuffer()));
   if(!r){g('dxStatus').textContent='No graphics card memory found in that file. Make sure it is the DxDiag “Save All Information” text file.';return}
   g('vram').value=r.slider;render();
   const others=r.cards.length>1?` ${r.cards.length} display devices found; using the one with the most dedicated memory.`:'';
   const low=r.gib<1?' This looks like integrated graphics, which shares system memory; the estimate may not apply.':'';
   g('dxStatus').textContent=`Found ${r.name} · ${r.dedicatedMB.toLocaleString()} MB dedicated (${r.gib.toFixed(1)} GiB). GPU memory set to ${r.slider} GiB.${others}${low}`;
  }catch(err){g('dxStatus').textContent='Could not read that file: '+err.message}
  e.target.value='';
 };
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

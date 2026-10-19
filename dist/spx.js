// Read the XML property-list subset used by System Information. Never fetch DTDs.
function spxPlist(text){
 if(/<!ENTITY|<!DOCTYPE[^>]*\[/i.test(text))throw Error('Unsupported XML entity declarations.');
 const clean=text.replace(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>/g,'');
 const tokens=clean.match(/<[^>]+>|[^<]+/g)||[];let i=0;
 const decode=s=>s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_,v)=>v[0]==='#'?String.fromCodePoint(v[1].toLowerCase()==='x'?parseInt(v.slice(2),16):Number(v.slice(1))):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[v]));
 function skip(){while(i<tokens.length&&!tokens[i].trim())i++}
 function read(depth=0){if(depth>100)throw Error('Report nesting is too deep.');skip();const open=tokens[i++];if(!open)throw Error('Incomplete system report.');const m=open.match(/^<(plist|array|dict|key|string|integer|real|true|false|date|data)(?:\s[^>]*)?\s*(\/?)>$/);if(!m)throw Error('Not a supported XML system report.');const tag=m[1];if(m[2])return tag==='true'?true:tag==='false'?false:tag==='array'?[]:tag==='dict'?Object.create(null):'';
 if(['plist','array','dict'].includes(tag)){const values=[];while(true){skip();if(tokens[i]===`</${tag}>`){i++;break}if(i>=tokens.length)throw Error('Incomplete system report.');values.push(read(depth+1))}if(tag==='plist')return values[0];if(tag==='array')return values;if(values.length%2)throw Error('Invalid report dictionary.');const o=Object.create(null);for(let j=0;j<values.length;j+=2)o[values[j]]=values[j+1];return o}
 let value='';while(i<tokens.length&&tokens[i]!==`</${tag}>`){if(tokens[i].startsWith('<'))throw Error('Invalid XML value.');value+=tokens[i++]}if(i>=tokens.length)throw Error('Incomplete system report.');i++;return ['integer','real'].includes(tag)?Number(value):decode(value);
 }return read();
}
function spxParse(text){
 const report=spxPlist(text),sections=Array.isArray(report)?report:[report];
 const displays=sections.filter(s=>s?._dataType==='SPDisplaysDataType').flatMap(s=>s._items||[]);
 const hardware=sections.filter(s=>s?._dataType==='SPHardwareDataType').flatMap(s=>s._items||[]);
 const apple=hardware.some(h=>/Apple\s+M\d/i.test(String(h.chip_type||h.cpu_type||'')))||displays.some(d=>/^Apple\s+M\d/i.test(String(d.sppci_model||d._name||'')));
 if(apple){const h=hardware[0]||{},raw=String(h.physical_memory||'');const match=raw.match(/^\s*([\d.,]+)\s*(GB|TB|MB|GiB|TiB|MiB)\s*$/i);let totalGiB=null;if(match){const n=Number(match[1].replace(/,/g,''));totalGiB=/^T/i.test(match[2])?n*1024:/^M/i.test(match[2])?n/1024:n;}return {unified:true,totalGiB,name:String(h.chip_type||h.cpu_type||displays[0]?.sppci_model||displays[0]?._name||'Apple silicon')};}
 const cards=displays.map(d=>{const raw=String(d.spdisplays_vram||d._spdisplays_vram||'');const m=raw.match(/^\s*([\d.,]+)\s*(GB|MB|GiB|MiB)\s*$/i);if(!m)return null;const value=Number(m[1].replace(/,/g,'')),gib=/^G/i.test(m[2])?value:value/1024;return {name:String(d.sppci_model||d._name||'Mac GPU'),gib,dedicatedMB:gib*1024}}).filter(c=>c&&Number.isFinite(c.gib)&&c.gib>0);
 if(!cards.length)return null;const best=cards.reduce((a,b)=>b.gib>a.gib?b:a);return {...best,cards,source:'Mac System Report'};
}
if(typeof module!=='undefined')module.exports={spxPlist,spxParse};

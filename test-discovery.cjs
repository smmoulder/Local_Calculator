const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8'),elements={};
for(const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g))elements[m[1]]={value:m[0].match(/value="([^"]*)"/)?.[1]||'',checkValidity:()=>true,scrollIntoView(){},focus(){},addEventListener(){}};
for(const [id,value] of Object.entries({quant:'Q4_K_M',context:'8192',cache:'2',hfSort:'fit'}))elements[id].value=value;
const context={document:{getElementById:id=>elements[id],querySelectorAll:()=>[]},localStorage:{getItem:()=>null,setItem(){}},AbortSignal:{timeout:()=>null},console,
 fetch:async url=>({ok:true,headers:{get:()=>null},json:async()=>url.includes('/config.json')?{model_type:'llama',num_hidden_layers:32,num_key_value_heads:8,num_attention_heads:32,hidden_size:4096,max_position_embeddings:8192}:url.includes('?blobs')?{gguf:{total:8e9},siblings:[{rfilename:'model-Q4_K_M.gguf',size:5e9},{rfilename:'model-Q8_0.gguf',size:9e9}]}:[{id:'example/model'}]})};
vm.createContext(context);for(const f of ['engine.js','catalog.js','hf.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),context);
(async()=>{
 await vm.runInContext('hfSearch()',context);
 assert.match(elements.hfResults.innerHTML,/Comfortable/);
 assert.match(elements.hfResults.innerHTML,/model-Q4_K_M/);
 assert.match(elements.hfResults.innerHTML,/model-Q8_0/);
 assert.match(elements.hfResults.innerHTML,/8B/);
 elements.vram.value=2;vm.runInContext('render()',context);assert.match(elements.hfResults.innerHTML,/Spill likely/);
 elements.vram.value=12;elements.context.value=16384;vm.runInContext('render()',context);assert.match(elements.hfResults.innerHTML,/Uncertain fit/);
 elements.context.value=8192;elements.hfSort.value='params';elements.hfSort.onchange();assert.match(elements.hfResults.innerHTML,/4–8B/);
 elements.hfResults.onclick({target:{closest:()=>({dataset:{hffile:'0'}})}});assert.match(elements.forecastModel.innerHTML,/model-Q4_K_M/);assert.equal(Number(elements.vram.value),12);
 vm.runInContext(`const testS=state();const base=hfOptions[0];const big={...base,params:16};const small={...base,params:4};const unknown={...base,verified:false};const sorted=hfSorted([small,unknown,big],testS,'fit');if(sorted[0].m.params!==16||sorted[2].band!=='Uncertain fit')throw Error('fit order failed');const bySize=hfSorted([big,small],testS,'params');if(bySize[0].m.params!==4)throw Error('size order failed');`,context);
 console.log('Discovery: automatic file expansion, live fit updates, uncertainty, sorting, grouping, and selection passed');
})().catch(error=>{console.error(error);process.exitCode=1});

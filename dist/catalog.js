// Static, reviewed catalog. Decimal GB from converter cards, not runtime VRAM.
const CATALOG=[
 {size:7,params:7.62,layers:28,heads:4,dim:128,files:{Q4_K_M:4.68,Q8_0:8.10}},
 {size:14,params:14.77,layers:48,heads:8,dim:128,files:{Q4_K_M:8.99,Q8_0:15.70}},
 {size:32,params:32.76,layers:64,heads:8,dim:128,files:{Q4_K_M:19.85,Q8_0:34.82}}
].flatMap(m=>Object.entries(m.files).map(([quant,gb])=>({...m,quant,gb,id:`qwen-${m.size}-${quant}`,name:`Qwen2.5-${m.size}B-Instruct`,maxContext:32768,source:`https://huggingface.co/Qwen/Qwen2.5-${m.size}B-Instruct`,download:`https://huggingface.co/bartowski/Qwen2.5-${m.size}B-Instruct-GGUF/blob/main/Qwen2.5-${m.size}B-Instruct-${quant}.gguf`})));
function catalogConfig(s,m){return {...s,params:m.params,quant:m.quant,layers:m.layers,heads:m.heads,dim:m.dim,weightGiB:m.gb*1e9/2**30}}
if(typeof module!=='undefined')module.exports={CATALOG,catalogConfig};

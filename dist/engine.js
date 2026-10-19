const QUANTS={FILE:16,Q3_K_M:3.9,Q4_0:4.5,Q4_K_M:4.85,Q5_K_M:5.7,Q6_K:6.6,Q8_0:8.5,FP16:16};
function estimate(s){
 const unified=s.memoryType==='unified',f=unified?1:s.offload/100,weights=s.weightGiB??s.params*1e9*QUANTS[s.quant]/8/2**30;
 const kv=2*s.layers*s.heads*s.dim*s.context*s.cache/2**30;
 const gpuWeights=weights*f,gpuKV=kv*f,total=gpuWeights+gpuKV+s.overhead;
 const capacity=unified?s.modelBudget:s.vram;
 const free=capacity-total,band=free<0?(unified?'Over budget':'Spill likely'):free<(unified?capacity*.1:s.headroom)?'Tight':'Comfortable';
 return {weights,kv,gpuWeights,gpuKV,total,free,band,ram:(weights+kv)*(1-f),required:total+(unified?0:s.headroom),capacity,unified};
}
function unifiedStartBudget(total){return Math.max(.5,Math.min(total/4,total-2))}
if(typeof module!=='undefined')module.exports={estimate,QUANTS,unifiedStartBudget};

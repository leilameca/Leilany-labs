import { numeric } from "../numbers.ts";
// ENERGY STAR room AC guidance, checked 2026-09-29. Upper endpoints inclusive.
export const coolingBands = [[150,5000],[250,6000],[300,7000],[350,8000],[400,9000],[450,10000],[550,12000],[700,14000],[1000,18000],[1200,21000],[1400,23000],[1500,24000],[2000,30000],[2500,34000]] as const;
export const climateExample={length:"5",width:"4",people:"2"};
export type Exposure="shade"|"normal"|"sun";
export function calculateClimate(input:typeof climateExample,exposure:Exposure,kitchen:boolean){
 const length=numeric(input.length,1,100),width=numeric(input.width,1,100),people=numeric(input.people,0,100,true);
 const area=length*width,ft2=area/0.09290304;
 if(ft2<100||ft2>2500)throw new RangeError('Area outside source chart');
 const base=coolingBands.find(([max])=>ft2<=max)![1],solar=base*(exposure==='sun'?.1:exposure==='shade'?-.1:0),occupancy=Math.max(0,people-2)*600,kitchenLoad=kitchen?4000:0;
 return {area,ft2,base,solar,occupancy,kitchenLoad,total:base+solar+occupancy+kitchenLoad};
}

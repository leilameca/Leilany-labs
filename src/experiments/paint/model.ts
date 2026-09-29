import { numeric } from "../numbers.ts";
export const paintExample={length:"5",width:"4",height:"2.8",openings:"4",coats:"2",coverage:"10",waste:"10",container:"3.785"};
export function calculatePaint(input:typeof paintExample,ceiling:boolean){
 const length=numeric(input.length,.1,1000),width=numeric(input.width,.1,1000),height=numeric(input.height,.1,100);
 const openings=numeric(input.openings,0,100000),coats=numeric(input.coats,1,10,true),coverage=numeric(input.coverage,.1,100),waste=numeric(input.waste,0,100),container=numeric(input.container,.1,100);
 const wallArea=2*(length+width)*height;
 if(openings>=wallArea)throw new RangeError('Openings exceed walls');
 const ceilingArea=ceiling?length*width:0,area=wallArea-openings+ceilingArea,liters=area*coats/coverage*(1+waste/100),cans=Math.ceil(liters/container);
 return {wallArea,ceilingArea,area,liters,cans,purchaseLiters:cans*container};
}

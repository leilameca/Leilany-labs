import { numeric } from "../numbers.ts";
export const constructionExample = { length:"5", width:"4", thickness:"12", height:"2.8", openings:"2", blockLength:"40", blockHeight:"20", waste:"10" };
export type ConstructionMode = "slab" | "wall";
export function calculateConstruction(input: typeof constructionExample, mode: ConstructionMode) {
  const length=numeric(input.length,.1,1000), waste=numeric(input.waste,0,100);
  if(mode === "slab") {
    const width=numeric(input.width,.1,1000), thickness=numeric(input.thickness,.1,1000);
    const area=length*width, volume=area*thickness/100;
    return { area, netArea:area, volume, quantity:volume*(1+waste/100), baseQuantity:volume, waste };
  }
  const height=numeric(input.height,.1,100), openings=numeric(input.openings,0,100000);
  const blockLength=numeric(input.blockLength,1,200), blockHeight=numeric(input.blockHeight,1,200);
  const area=length*height;
  if(openings>=area) throw new RangeError("Openings exceed wall area");
  const netArea=area-openings, baseQuantity=netArea/(blockLength*blockHeight/10000);
  return {area, netArea, volume:0, baseQuantity, quantity:Math.ceil(baseQuantity*(1+waste/100)), waste};
}

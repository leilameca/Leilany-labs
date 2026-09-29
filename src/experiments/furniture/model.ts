import {numeric} from "../numbers.ts";
export type MaterialKind='material'|'hardware'|'finish';
export type FurnitureItem={id:string;name:string;kind:MaterialKind;quantity:string;price:string};
export const furnitureExample:FurnitureItem[]=[{id:'1',name:'Top panel',kind:'material',quantity:'1',price:'2200'},{id:'2',name:'Leg',kind:'material',quantity:'4',price:'350'},{id:'3',name:'Hardware kit',kind:'hardware',quantity:'1',price:'500'},{id:'4',name:'Finish',kind:'finish',quantity:'1',price:'650'}];
export const furnitureOptions={hours:'8',rate:'400',waste:'10',overhead:'10',markup:'20'};
export function calculateFurniture(items:FurnitureItem[],input:typeof furnitureOptions){
 if(!items.length||items.length>100)throw new RangeError('Add 1–100 parts');
 const groups={material:0,hardware:0,finish:0};
 const rows=items.map(item=>{if(!(item.kind in groups))throw new RangeError('Unknown category');const quantity=numeric(item.quantity,.001,10000),price=Math.round(numeric(item.price,0,1000000)*100)/100;const cents=Math.round(quantity*price*100);groups[item.kind]+=cents;return {...item,quantity,price,cents};});
 const waste=Math.round(groups.material*numeric(input.waste,0,100)/100),labor=Math.round(numeric(input.hours,0,100000)*numeric(input.rate,0,1000000)*100);
 const direct=groups.material+groups.hardware+groups.finish+waste+labor,overhead=Math.round(direct*numeric(input.overhead,0,100)/100),cost=direct+overhead,markup=Math.round(cost*numeric(input.markup,0,1000)/100);
 return {rows,groups,waste,labor,overhead,cost,markup,price:cost+markup};
}

import {numeric} from "../numbers.ts";
export type QuoteItem={id:string;name:string;quantity:string;price:string};
export const quoteExample:QuoteItem[]=[{id:'1',name:'',quantity:'1',price:'5000'}];
export function calculateQuote(items:QuoteItem[],markup:string,discount:string,tax:string){
 if(!items.length||items.length>100)throw new RangeError('Add 1–100 items');
 const rows=items.map(item=>{const quantity=numeric(item.quantity,.001,10000),price=Math.round(numeric(item.price,0,1000000)*100)/100;return {...item,quantity,price,cents:Math.round(quantity*price*100)};});
 const subtotal=rows.reduce((sum,row)=>sum+row.cents,0),markupCents=Math.round(subtotal*numeric(markup,0,1000)/100);
 const discountCents=Math.round((subtotal+markupCents)*numeric(discount,0,100)/100),net=subtotal+markupCents-discountCents,taxCents=Math.round(net*numeric(tax,0,100)/100);
 return {rows,subtotal,markupCents,discountCents,taxCents,total:net+taxCents};
}

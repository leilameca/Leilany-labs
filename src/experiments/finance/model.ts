import {numeric} from "../numbers.ts";
export const financeExample={principal:"250000",rate:"12",months:"36",extra:"0"};
export function calculateFinance(input:typeof financeExample){
 const principal=numeric(input.principal,1,100000000),annual=numeric(input.rate,0,100),months=numeric(input.months,1,600,true),extra=numeric(input.extra,0,100000000);
 const rate=annual/1200,payment=rate===0?principal/months:principal*rate/-Math.expm1(-months*Math.log1p(rate));
 let balance=principal,totalInterest=0;const rows:{month:number;payment:number;interest:number;principal:number;balance:number}[]=[];
 for(let month=1;month<=months&&balance>1e-8;month++){
  const interest=balance*rate,paid=month===months?balance+interest:Math.min(balance+interest,payment+extra),repaid=paid-interest;
  balance=Math.max(0,balance-repaid);totalInterest+=interest;rows.push({month,payment:paid,interest,principal:repaid,balance});
 }
 return {principal,payment,totalInterest,totalPaid:principal+totalInterest,months:rows.length,rows};
}

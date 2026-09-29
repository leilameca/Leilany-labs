import {numeric} from "../numbers.ts";
export const workExample={start:'2022-01-01',end:'2025-12-31',average:'30000',current:'30000',vacationDays:'0',earned:'',minimum:'',christmasPaid:'0'};
function parseDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'1993-01-01'||value>'2099-12-31')throw new RangeError('Unsupported date');
 const date=new Date(value+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)throw new RangeError('Invalid date');return date;
}
function addMonths(date:Date,months:number){const first=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+months,1));const lastDay=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();first.setUTCDate(Math.min(date.getUTCDate(),lastDay));return first;}
export function serviceTime(startValue:string,endValue:string){
 const start=parseDate(startValue),last=parseDate(endValue);if(last<start)throw new RangeError('Reversed dates');
 // Last working date is included. UTC avoids DST and locale-dependent date parsing.
 const end=new Date(last.getTime()+86400000);let months=(end.getUTCFullYear()-start.getUTCFullYear())*12+end.getUTCMonth()-start.getUTCMonth();
 if(addMonths(start,months)>end)months--;
 const days=Math.round((end.getTime()-addMonths(start,months).getTime())/86400000);
 return {years:Math.floor(months/12),months:months%12,days,totalMonths:months};
}
export function calculateWork(input:typeof workExample,noticeServed:boolean,includeChristmas:boolean){
 const time=serviceTime(input.start,input.end),average=numeric(input.average,1,10000000),current=numeric(input.current,1,10000000),vacationDays=numeric(input.vacationDays,0,365);
 const daily=average/23.83,noticeDays=noticeServed?0:time.totalMonths>=12?28:time.totalMonths>=6?14:time.totalMonths>=3?7:0;
 // Completed-month tiers follow the public Ministry calculator (reviewed 2026-09-29).
 const severanceDays=time.years*(time.years>=5?23:21)+(time.months>=6?13:time.months>=3?6:0);
 const notice=Math.round(daily*noticeDays*100),severance=Math.round(daily*severanceDays*100),vacation=Math.round(current/23.83*vacationDays*100);
 let christmas=0,christmasBase=0,christmasCap=0;
 if(includeChristmas){const earned=numeric(input.earned,0,120000000),minimum=numeric(input.minimum,1,10000000),paid=numeric(input.christmasPaid,0,10000000);christmasBase=Math.round(earned/12*100);christmasCap=Math.round(minimum*5*100);christmas=Math.max(0,Math.min(christmasBase,christmasCap)-Math.round(paid*100));}
 return {time,daily,noticeDays,severanceDays,vacationDays,notice,severance,vacation,christmas,christmasBase,christmasCap,total:notice+severance+vacation+christmas};
}

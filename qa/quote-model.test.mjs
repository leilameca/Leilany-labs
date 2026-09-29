import test from 'node:test';import assert from 'node:assert/strict';import {calculateQuote,quoteExample as e} from '../src/experiments/quote/model.ts';
test('quote markup then discount then tax in integer cents',()=>{const r=calculateQuote(e,'20','10','18');assert.equal(r.subtotal,500000);assert.equal(r.markupCents,100000);assert.equal(r.discountCents,60000);assert.equal(r.taxCents,97200);assert.equal(r.total,637200);});
test('full discount produces zero tax and total',()=>assert.equal(calculateQuote(e,'0','100','18').total,0));
test('fractional quantities round each line to cents',()=>assert.equal(calculateQuote([{...e[0],quantity:'0.333',price:'10'}],'0','0','0').total,333));
test('empty quote and invalid prices rejected',()=>{assert.throws(()=>calculateQuote([],'0','0','0'),RangeError);assert.throws(()=>calculateQuote([{...e[0],price:'-1'}],'0','0','0'),RangeError);assert.throws(()=>calculateQuote(e,'0','101','0'),RangeError);});

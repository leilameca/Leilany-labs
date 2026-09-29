import test from 'node:test';import assert from 'node:assert/strict';import {calculatePaint,paintExample as e} from '../src/experiments/paint/model.ts';
test('paint area, coats and containers',()=>{const r=calculatePaint(e,false);assert.ok(Math.abs(r.area-46.4)<1e-10);assert.ok(Math.abs(r.liters-10.208)<1e-10);assert.equal(r.cans,3);});
test('ceiling adds floor area',()=>assert.ok(Math.abs(calculatePaint(e,true).area-66.4)<1e-10));
test('rejects impossible walls and fractional coats',()=>{for(const input of [{...e,openings:'999'},{...e,coats:'1.5'},{...e,coverage:'0'},{...e,length:''}])assert.throws(()=>calculatePaint(input,false),RangeError);});

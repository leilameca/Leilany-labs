import test from 'node:test';import assert from 'node:assert/strict';
import {calculateConstruction,constructionExample as e} from '../src/experiments/construction/model.ts';
test('slab converts centimeters and applies waste once',()=>{const r=calculateConstruction(e,'slab');assert.equal(r.area,20);assert.equal(r.volume,2.4);assert.ok(Math.abs(r.quantity-2.64)<1e-10);});
test('blocks deduct openings and round purchase upward',()=>{const r=calculateConstruction(e,'wall');assert.equal(r.netArea,12);assert.equal(r.quantity,165);});
test('invalid dimensions and impossible openings rejected',()=>{for(const input of [{...e,length:''},{...e,height:'0'},{...e,openings:'14'},{...e,waste:'-1'}])assert.throws(()=>calculateConstruction(input,'wall'),RangeError);});

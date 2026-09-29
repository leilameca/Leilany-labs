import test from 'node:test';import assert from 'node:assert/strict';import {calculateFurniture,furnitureExample as e,furnitureOptions as o} from '../src/experiments/furniture/model.ts';
test('furniture costs reconcile with waste and markup',()=>{const r=calculateFurniture(e,o);assert.equal(r.groups.material,360000);assert.equal(r.waste,36000);assert.equal(r.labor,320000);assert.equal(r.cost,914100);assert.equal(r.price,1096920);});
test('hardware has no material waste',()=>assert.equal(calculateFurniture([{...e[0],kind:'hardware'}],o).waste,0));
test('zero-rate and free parts supported',()=>assert.equal(calculateFurniture([{...e[0],price:'0'}],{...o,rate:'0'}).cost,0));
test('invalid quantities and empty list rejected',()=>{assert.throws(()=>calculateFurniture([],o),RangeError);assert.throws(()=>calculateFurniture([{...e[0],quantity:''}],o),RangeError);});

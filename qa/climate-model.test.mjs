import test from 'node:test';import assert from 'node:assert/strict';import {calculateClimate,climateExample as e} from '../src/experiments/climate/model.ts';
test('20m2 selects 6000 BTU band',()=>assert.equal(calculateClimate(e,'normal',false).total,6000));
test('sun, people and kitchen are additive adjustments',()=>assert.equal(calculateClimate({...e,people:'4'},'sun',true).total,11800));
test('shade reduces baseline by ten percent',()=>assert.equal(calculateClimate(e,'shade',false).total,5400));
test('no chart extrapolation or fractional people',()=>{for(const input of [{...e,length:'1',width:'1'},{...e,length:'100',width:'100'},{...e,people:'1.5'},{...e,width:''}])assert.throws(()=>calculateClimate(input,'normal',false),RangeError);});

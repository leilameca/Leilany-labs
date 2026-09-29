import test from 'node:test';
import assert from 'node:assert/strict';
import { batteryExample, calculateBattery } from '../src/experiments/battery/model.ts';
test('battery example capacity and runtime',()=>{const r=calculateBattery(batteryExample);assert.equal(r.storedWh,2560);assert.equal(r.usableWh,1843.2);assert.equal(r.runtime,6.144);});
test('series changes voltage, parallel changes Ah',()=>{const r=calculateBattery({...batteryExample,series:'2',parallel:'3'});assert.equal(r.bankVoltage,25.6);assert.equal(r.bankAh,300);});
test('battery rejects missing, nonfinite, fractional units, zero load and excessive percentages',()=>{for(const [key,value] of [['load',''],['capacity','NaN'],['series','1.5'],['load','0'],['depth','101'],['efficiency','0']])assert.throws(()=>calculateBattery({...batteryExample,[key]:value}),RangeError);});

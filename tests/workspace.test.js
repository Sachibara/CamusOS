import test from 'node:test';
import assert from 'node:assert/strict';
import {sample,displayTime,displayDate,displayZone,elapsedTimer,timeString,sumMinutes,validateImport,money} from '../src/data.js';

test('workspace initializes as an independent demo',()=>{
 const d=sample();
 assert.equal(d.schema,1);assert.equal(d.demo,true);assert.ok(d.projects.length>0);
 assert.ok(d.notes.every(n=>!JSON.stringify(n).includes('Speak Your Way To Cash')));
});
test('timer math uses wall-clock milliseconds and duration formatting',()=>{
 const d=sample();d.timer={elapsedMs:185000,startedAt:null};
 assert.equal(elapsedTimer(d),185000);
 assert.equal(timeString(3661000),'01:01:01');
 assert.equal(sumMinutes([{minutes:20},{minutes:40}]),60);
});
test('New York clock respects DST spring-forward transition in 2026',()=>{
 const before=displayTime('America/New_York',new Date('2026-03-08T06:59:00Z'));
 const after=displayTime('America/New_York',new Date('2026-03-08T07:00:00Z'));
 assert.match(before,/01:59/);assert.match(after,/03:00/);
 assert.match(displayZone('America/New_York',new Date('2026-03-08T06:59:00Z')),/GMT-5/);
 assert.match(displayZone('America/New_York',new Date('2026-03-08T07:00:00Z')),/GMT-4/);
});
test('calendar date crosses midnight correctly by region',()=>{
 assert.match(displayDate('2026-11-14T16:30:00Z','Asia/Manila'),/Nov 15, 2026/);
 assert.match(displayDate('2026-11-14T16:30:00Z','America/New_York'),/Nov 14, 2026/);
});
test('backup import rejects invalid data and stops running timers',()=>{
 const d=sample();d.timer.startedAt=Date.now();
 assert.throws(()=>validateImport({schema:1,entries:[]}),/Not a CamusOS/);
 const imported=validateImport(d);assert.equal(imported.timer.startedAt,null);
});
test('money output respects selected currency',()=>{
 assert.match(money(1250,{currency:'PHP'}),/₱/);
 assert.match(money(1250,{currency:'USD'}),/\$/);
});

const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const h=fs.readFileSync('index.html','utf8');
const source=[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean).join('\n').replace(/init\(\);\s*$/,'');
const store=new Map();let fail=false;
const c={console,window:{},document:{},localStorage:{setItem:(k,v)=>{if(fail)throw Error('quota');store.set(k,v)},getItem:k=>store.get(k),removeItem:k=>store.delete(k)},setTimeout(){},clearTimeout(){},addEventListener(){},assert};
vm.createContext(c);vm.runInContext(source,c);
(async()=>{
await vm.runInContext(`(async()=>{
S.meta=defaultMeta();S.meta.name='복구 테스트';S.meta.col={25:2};S.meta.shiny={25:1};S.meta.stats.c=123;S.meta.gs='6-2';S.meta.adaptive={floor:8,permit:7};
const md=buildMD(),file=await readAny(md);assert.equal(sigState(file),'ok');assert.equal(file.meta.col[25],2);assert.equal(file.meta.shiny[25],1);assert.equal(file.meta.adaptive.permit,7);
assert.equal(saveLocal(),true);S.meta.stats.c=124;saveLocal();assert.equal(recoveryList()[0].data.meta.stats.c,123);
S.meta.stats.c=125;saveLocal();assert.equal(recoveryList().length,1);
for(let i=0;i<16;i++){S.meta.stats.c=200+i;keepRecovery(JSON.stringify({meta:S.meta,sig:sigOf(JSON.stringify(S.meta))}),true);}
assert.equal(recoveryList().length,12);assert.equal(recoveryList()[0].data.meta.stats.c,215);
S.demo=true;const before=localStorage.getItem(SAVE_KEY);assert.equal(saveLocal(),false);assert.equal(localStorage.getItem(SAVE_KEY),before);S.demo=false;
toast=()=>{};applySafe=()=>{};closeM=()=>{};goStart=()=>{};
applyLoaded(file);assert.equal(S.meta.stats.c,123);assert.equal(recoveryList()[0].data.meta.stats.c,215);
const corrupt=JSON.parse(JSON.stringify(file));corrupt.meta.stats.c=999;applyLoaded(corrupt);assert.equal(S.meta.stats.c,123);
})()`,c);
fail=true;vm.runInContext(`assert.equal(saveLocal(),false);S.meta.stats.c=777;assert.equal(keepRecovery(JSON.stringify({meta:S.meta,sig:sigOf(JSON.stringify(S.meta))}),true),false);`,c);
console.log('PASS: signed Markdown round trip, shiny/adaptive preservation, throttled and bounded backups, demo isolation, restore, tamper rejection, storage failure');
})().catch(e=>{console.error(e);process.exitCode=1});

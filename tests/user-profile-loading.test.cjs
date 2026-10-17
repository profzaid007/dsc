const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
function harness(fetchProfile){
 const slots=[];let index=0;const timers=new Map();let nextTimer=0
 const hooks={useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value}]},useRef(initial){const i=index++;if(!(i in slots))slots[i]={current:initial};return slots[i]},useCallback:fn=>fn,useEffect(){}}
 const mocks={react:hooks,'@/lib/lang-context':{useLang:()=>({lang:'en'})},'@/lib/pb':{__esModule:true,default:{filter:(_q,args)=>args.value0,collection:()=>({getFirstListItem:fetchProfile})},getErrorMessage:e=>e.message},'@/types/account-profile':{ROLE_PROFILE_COLLECTION:{individual:'individual_profiles',expert:'expert_profiles'}},'@/lib/user-profile-fields':{ROLE_PROFILE_SECTIONS:{}}}
 const exports={}
 const js=ts.transpileModule(fs.readFileSync('hooks/useUserProfileRecord.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText
 new Function('exports','require','setTimeout','clearTimeout',js)(exports,name=>{assert.ok(name in mocks,name);return mocks[name]},callback=>{const id=++nextTimer;timers.set(id,callback);return id},id=>timers.delete(id))
 return {render(id='user',role='individual'){index=0;return exports.useUserProfileRecord(id,role)},expire(){for(const callback of [...timers.values()])callback()},timers}
}
test('a stalled profile request exits loading with a retryable error, even if transport ignores abort',async()=>{
 let resolve
 const h=harness(()=>new Promise(r=>resolve=r))
 const pending=h.render().reload();h.expire();await pending
 let result=h.render();assert.equal(result.isLoading,false);assert.match(result.loadError,/timed out/)
 resolve({id:'late'});await Promise.resolve();assert.equal(h.render().profile,null)
 // A manual retry is independent of the expired request.
 const retry=h.render().reload();resolve({id:'loaded'});await retry
 result=h.render();assert.equal(result.profile.id,'loaded');assert.equal(result.loadError,'');assert.equal(h.timers.size,0)
})
test('missing profiles and roles with no collection finish loading normally; permission failures show errors',async()=>{
 const missing=harness(async()=>{throw {status:404}});await missing.render().reload();assert.equal(missing.render().isLoading,false);assert.equal(missing.render().loadError,'')
 const admin=harness(()=>{throw Error('should not fetch')});await admin.render('user','admin').reload();assert.equal(admin.render('user','admin').isLoading,false)
 const denied=harness(async()=>{throw {status:403,message:'Access denied'}});await denied.render().reload();assert.equal(denied.render().isLoading,false);assert.equal(denied.render().loadError,'Access denied')
})
test('a late response for a previous user cannot replace the current profile or loading state',async()=>{
 const deferred={};const signals={}
 const h=harness((id,options)=>{signals[id]=options.signal;assert.equal(options.requestKey,null);return new Promise(resolve=>deferred[id]=resolve)})
 const first=h.render('first').reload();const second=h.render('second').reload()
 assert.equal(signals.first.aborted,true)
 deferred.first({id:'old-profile'});await first
 assert.equal(h.render('second').profile,null);assert.equal(h.render('second').isLoading,true)
 deferred.second({id:'current-profile'});await second
 assert.equal(h.render('second').profile.id,'current-profile');assert.equal(h.render('second').isLoading,false)
})

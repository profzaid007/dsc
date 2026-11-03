const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
function load(file,mocks={}){
 const exports={}
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('exports','require',code)(exports,name=>{assert.ok(name in mocks,`Unexpected dependency ${name}`);return mocks[name]})
 return exports
}
const helper=load('lib/expert-schedule.ts')
function hooks(){let cursor=0,pending=[];const values=[];return{react:{useState(initial){const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next}]},useEffect(fn,deps){const i=cursor++;if(!values[i]||deps.some((value,j)=>value!==values[i][j])){values[i]=deps;pending.push(fn)}}},render(fn){cursor=0;return fn()},flush(){const effects=pending;pending=[];effects.forEach(fn=>fn())}}}
const jsx=(type,props,key)=>({type,props,key})
const runtime={jsx,jsxs:jsx}
const nodes=tree=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(nodes):[tree,...nodes(tree.props?.children)]
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):Array.isArray(tree)?tree.map(text).join(''):tree?text(tree.props?.children):''
const icons=new Proxy({},{get:(_,name)=>String(name)})
const task=(id,date,time='09:00',patch={})=>({id,case:'allocated',type:'meeting',name_ar:'جلسة',name_en:id,status:'pending',assigned_at:'1999-01-01',config:{date,time,meetingType:'online',notes:'PRIVATE',media:[]},...patch})

test('schedule date validation handles leap years and rejects calendar rollover, timestamps and invalid years',()=>{
 assert.deepEqual(helper.parseScheduleDate('2028-02-29'),{year:2028,month:2,day:29})
 assert.deepEqual(helper.parseScheduleDate('2000-02-29'),{year:2000,month:2,day:29})
 for(const value of ['2026-02-29','1900-02-29','2026-04-31','2026-13-01','0000-01-01','2026-11-03T00:00:00Z','2026-1-1',null,{},''])assert.equal(helper.parseScheduleDate(value),null,String(value))
 assert.deepEqual(helper.parseScheduleDate('0001-01-01'),{year:1,month:1,day:1})
})
test('month cells are aligned Sunday-first and correctly span leap February and Dec/Jan navigation',()=>{
 const november=helper.monthDays({year:2026,month:11})
 assert.equal(november[0],'2026-11-01')
 assert.equal(november.length,35)
 assert.equal(november.filter(Boolean).length,30)
 const february=helper.monthDays({year:2028,month:2})
 assert.equal(february.findIndex(date=>date==='2028-02-01'),2)
 assert.equal(february.filter(Boolean).length,29)
 assert.equal(february.filter(Boolean).at(-1),'2028-02-29')
 assert.deepEqual(helper.moveCalendarMonth({year:2026,month:12},1),{year:2027,month:1})
 assert.deepEqual(helper.moveCalendarMonth({year:2027,month:1},-1),{year:2026,month:12})
 assert.deepEqual(helper.moveCalendarMonth({year:1,month:1},-1),{year:1,month:1})
})
test('Riyadh today rolls at Saudi midnight regardless of UTC date and invalid legacy time remains unspecified',()=>{
 assert.equal(helper.riyadhToday(new Date('2026-11-03T20:59:59Z')),'2026-11-03')
 assert.equal(helper.riyadhToday(new Date('2026-11-03T21:00:00Z')),'2026-11-04')
 assert.equal(helper.normalizeScheduleTime('09:05:30'),'09:05')
 for(const value of ['24:00','09:60','09:05:60','9:00',null])assert.equal(helper.normalizeScheduleTime(value),'')
 assert.equal(helper.scheduleTimeLabel('',false),'Time not specified')
 assert.match(helper.calendarMonthLabel({year:2028,month:2},true),/فبراير.*2028/)
})
test('schedule includes meetings for allocated cases including custom unassigned experts, uses scheduled dates and excludes unrelated/private fields',()=>{
 const assignments=[task('late','2026-11-03','13:00'),task('unknown-time','2026-11-03','bad'),task('early','2026-11-03','08:00'),task('unallocated','2026-11-03','09:00',{case:'other'}),task('survey','2026-11-03','09:00',{type:'survey'}),task('invalid','2026-02-30'),task('no-date','')]
 const result=helper.scheduledCaseSessions(assignments,[{id:'allocated',name:'Case A'}],[{id:'meeting',key:'one_to_one_meeting'},{id:'survey',key:'survey'}],false)
 assert.deepEqual(result.map(session=>session.id),['early','late','unknown-time'])
 assert.equal(result[0].date,'2026-11-03')
 assert.equal(result[0].caseName,'Case A')
 assert.equal(result[2].time,'')
 assert.ok(!JSON.stringify(result).includes('PRIVATE'))
 assert.ok(!JSON.stringify(result).includes('1999-01-01'))
 assert.equal(helper.scheduledCaseSessions(assignments,[],[{id:'meeting',key:'one_to_one_meeting'}],false).length,0)
})
const sessions=[{id:'today',caseId:'case',caseName:'Demo',title:'Today session',date:'2026-11-03',time:'09:00',mode:'online',status:'pending'},{id:'leap',caseId:'case',caseName:'Demo',title:'Leap session',date:'2028-02-29',time:'10:00',mode:'face_to_face',status:'completed'}]
function calendarFixture(){const h=hooks();const {ExpertScheduleCalendar}=load('components/schedule/ExpertScheduleCalendar.tsx',{react:h.react,'react/jsx-runtime':runtime,'next/link':{default:'Link'},'lucide-react':icons,'@/components/ui/button':{Button:'Button'},'@/lib/expert-schedule':helper});return{render:()=>h.render(()=>ExpertScheduleCalendar({ar:false,sessions,today:'2026-11-03'}))}}
test('year/month selectors reset selected day, display leap days, and Today restores current agenda',()=>{
 const{render}=calendarFixture();let tree=render();const find=predicate=>nodes(tree).find(predicate)
 assert.ok(text(tree).includes('Today session'))
 find(n=>n.props?.id==='schedule-year').props.onChange({target:{value:'2028'}})
 tree=render();find(n=>n.props?.id==='schedule-month').props.onChange({target:{value:'2'}})
 tree=render();assert.ok(text(tree).includes('February 2028'))
 const dayButtons=nodes(tree).filter(n=>n.type==='button'&&'aria-pressed'in n.props)
 assert.equal(dayButtons.length,29)
 assert.match(dayButtons.find(n=>n.props['aria-pressed']).props['aria-label'],/1 February 2028/)
 dayButtons.find(n=>n.props['aria-label'].includes('29 February')).props.onClick()
 tree=render();assert.ok(text(tree).includes('Leap session'))
 find(n=>n.type==='Button'&&text(n)==='Today').props.onClick()
 tree=render();assert.equal(find(n=>n.props?.id==='schedule-year').props.value,2026)
 assert.equal(find(n=>n.props?.id==='schedule-month').props.value,11)
 assert.ok(text(tree).includes('Today session'))
})
test('calendar navigation crosses years without losing year option and shows empty day/month states',()=>{
 const{render}=calendarFixture();let tree=render();const find=predicate=>nodes(tree).find(predicate)
 find(n=>n.props?.id==='schedule-month').props.onChange({target:{value:'12'}})
 tree=render();find(n=>n.props?.['aria-label']==='Next month').props.onClick()
 tree=render();assert.equal(find(n=>n.props?.id==='schedule-year').props.value,2027)
 assert.equal(find(n=>n.props?.id==='schedule-month').props.value,1)
 assert.ok(text(tree).includes('No sessions are scheduled this month.'))
 assert.ok(text(tree).includes('No sessions on this day'))
 find(n=>n.props?.['aria-label']==='Previous month').props.onClick()
 tree=render();assert.equal(find(n=>n.props?.id==='schedule-year').props.value,2026)
 const years=helper.calendarYearOptions('2026-11-03',2045,[...sessions,{...sessions[0],date:'2048-01-01'}])
 assert.ok(years.includes(2045));assert.ok(years.includes(2048));assert.ok(years.length<30)
})
test('schedule page waits for auth and shows source errors with retries rather than an empty calendar',async()=>{
 const h=hooks(),calls={cases:0,tasks:0,types:0}
 let auth={isLoading:true,currentUser:null}
 let profileError='',taskError='',typeError=null,typeRecords=[{id:'meeting',key:'one_to_one_meeting'}]
 const fetchToolTypes=async()=>{calls.types++;return typeRecords}
 const Page=load('app/dashboard/expert/schedule/page.tsx',{
  react:h.react,'react/jsx-runtime':runtime,'@/hooks/useAuth':{useAuth:()=>auth},'@/hooks/useProfiles':{useProfiles:()=>({profiles:[],isLoading:false,loadError:profileError,refresh:()=>{calls.cases++}})},'@/hooks/useAssignments':{useAssignments:()=>({assignments:[],isLoading:false,loadError:taskError,refresh:()=>{calls.tasks++}})},'@/hooks/useToolTypes':{useToolTypes:()=>({toolTypes:typeRecords,isLoading:false,error:typeError,fetchToolTypes})},'@/lib/lang-context':{useLang:()=>({lang:'en'})},'@/lib/expert-schedule':helper,'@/components/schedule/ExpertScheduleCalendar':{ExpertScheduleCalendar:'Calendar'},'@/components/ui/page-loader':{PageLoader:'Loader'},'@/components/ui/data-error':{DataError:'Error'},
 }).default
 assert.equal(h.render(()=>Page()).type,'Loader')
 auth={isLoading:false,currentUser:{id:'expert-a',role:'expert'}}
 const wrapper=h.render(()=>Page());assert.equal(wrapper.key,'expert-a')
 const render=()=>h.render(()=>wrapper.type())
 assert.equal(render().type,'Loader');h.flush();await new Promise(resolve=>setImmediate(resolve))
 assert.equal(render().type,'Calendar')
 for(const[source,message]of[['profiles','Cases failed'],['tasks','Tasks failed'],['types','Types failed']]){
  profileError=source==='profiles'?message:'';taskError=source==='tasks'?message:'';typeError=source==='types'?message:null
  const tree=render();assert.equal(tree.type,'Error');assert.equal(tree.props.message,message)
  const before={...calls};tree.props.onRetry();assert.equal(calls.cases,before.cases+1);assert.equal(calls.tasks,before.tasks+1);assert.equal(calls.types,before.types+1)
 }
 profileError='';taskError='';typeError=null;typeRecords=[]
 assert.match(render().props.message,/meeting tool type is unavailable/)
})

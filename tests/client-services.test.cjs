const{test}=require('node:test')
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript')
function load(file,mocks={}){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('exports','require',code)(exports,name=>{assert.ok(name in mocks,`Unexpected dependency ${name}`);return mocks[name]});return exports}
function hooks(){let cursor=0,pending=[];const slots=[];return{react:{useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next}]},useEffect(fn,deps){const i=cursor++;if(!slots[i]||deps.some((value,j)=>value!==slots[i].deps[j])){const old=slots[i];pending.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:fn()}})}},useCallback(fn,deps){const i=cursor++;if(!slots[i]||deps.some((value,j)=>value!==slots[i].deps[j]))slots[i]={deps,fn};return slots[i].fn}},render(fn){cursor=0;return fn()},flush(){const effects=pending;pending=[];effects.forEach(fn=>fn())},unmount(){slots.forEach(slot=>slot?.cleanup?.())}}}
const jsx=(type,props,key)=>({type,props,key}),runtime={jsx,jsxs:jsx,Fragment:'Fragment'},icons=new Proxy({},{get:(_,name)=>String(name)})
const nodes=tree=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(nodes):[tree,...nodes(tree.props?.children)]
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):Array.isArray(tree)?tree.map(text).join(''):tree?text(tree.props?.children):''
const schedule=load('lib/expert-schedule.ts'),payment=load('lib/payment-case-status.ts'),dates=load('lib/format-date.ts'),clients=load('lib/client-services.ts',{'@/lib/payment-case-status':payment,'@/lib/expert-schedule':schedule})
const profiles=[{id:'active',user:'owner',name:'Active case',status:'active',created:'2026-11-01',updated:'2026-11-01'},{id:'unpaid',user:'owner',name:'Unpaid case',created:'2026-10-01',updated:'2026-10-01'},{id:'foreign',user:'other',name:'FOREIGN CASE',status:'active',created:'2026-11-02',updated:'2026-11-02'}]
const types=[{id:'meeting',key:'one_to_one_meeting',name:'one_to_one_meeting',label:{ar:'اجتماع فردي',en:'Individual meeting'}}]
const task=(id,patch={})=>({id,case:'active',type:'meeting',name_en:id,status:'pending',is_visible_to_user:true,config:{date:'2026-11-06',time:'09:00',meetingType:'online',notes:'SECRET STAFF NOTE'},...patch})
const summary=(id,patch={})=>({id,case:'active',kind:'task',caseName:'Active case',name_en:id,name_ar:id,status:'pending',created:'2026-11-01',...patch})
const summaries=[summary('Task A'),summary('Assessment A',{kind:'assessment'}),summary('Unpaid assessment',{kind:'assessment',case:'unpaid'}),summary('FOREIGN TASK',{case:'foreign'}),summary('Completed',{status:'completed'})]
function baseMocks(h){return{react:h.react,'react/jsx-runtime':runtime,'next/link':{__esModule:true,default:'Link'},'lucide-react':icons,'@/components/ui/button':{Button:'Button'},'@/components/ui/input':{Input:'Input'},'@/components/ui/page-loader':{PageLoader:'Loader'},'@/components/ui/data-error':{DataError:'Error'},'@/lib/client-services':clients,'@/lib/expert-schedule':schedule,'@/lib/format-date':dates,'@/lib/payment-case-status':payment,'@/hooks/useAuth':{useAuth:()=>({currentUser:{id:'owner',name:'Owner',role:'parent'},isLoading:false})},'@/lib/lang-context':{useLang:()=>({lang:'en'})},'@/hooks/useProfiles':{useProfiles:()=>({profiles,isLoading:false,loadError:'',refresh(){}})},'@/hooks/useClientAssignments':{useClientAssignments:()=>({data:{assignments:summaries,cases:[]},isLoading:false,error:'',refresh(){}})},'@/hooks/useClientServiceData':{useClientServiceData:()=>({})}}}

test('client routes preserve role boundaries, including individual task URLs and care foundation parent routes',()=>{
 for(const[role,home,segment]of[['parent','parent','cases'],['care_foundation','parent','cases'],['individual','individual','cases'],['organization','institution','projects']]){
  const routes=clients.clientRoutes(role);assert.equal(routes.cases,`/dashboard/${home}/${segment}`);assert.equal(routes.newCase,`${routes.cases}/new`);assert.equal(routes.appointments,`/dashboard/${home}/appointments`)
  assert.equal(clients.clientAssignmentHref(summary('task/id'),role),`${routes.cases}/active/tasks/task%2Fid`)
  assert.equal(clients.clientAssignmentHref(summary('a/id',{kind:'assessment'}),role),'/dashboard/assessments/a%2Fid')
 }
 assert.equal(clients.isClientRole('expert'),false);assert.equal(clients.isClientRole('institution'),false)
})
test('client schedules strictly intersect ownership, visibility and paid activation before projecting dates without private notes',()=>{
 const meetings=[task('Public'),task('Hidden',{is_visible_to_user:false}),task('String visibility',{is_visible_to_user:'true'}),task('UNPAID',{case:'unpaid'}),task('FOREIGN',{case:'foreign'})]
 const result=clients.clientScheduledSessions(meetings,profiles,types,'owner',false)
 assert.deepEqual(result.map(item=>item.id),['Public'])
 assert.ok(!JSON.stringify(result).includes('SECRET STAFF NOTE'))
 assert.equal(clients.clientCaseAccessible({status:undefined}),false)
 assert.equal(clients.clientCaseAccessible({status:' under_review '}),false)
 assert.equal(clients.clientCaseAccessible({status:' active '}),true)
 assert.equal(clients.clientScheduledSessions(meetings,profiles,types,undefined,false).length,0)
})
test('upcoming sessions use Riyadh time, omit elapsed/completed appointments and retain missing-time same-day legacy sessions',()=>{
 const base={id:'session',caseId:'active',caseName:'Case',title:'Meeting',mode:'online',status:'pending'}
 const sessions=[{...base,id:'elapsed',date:'2026-11-03',time:'07:00'},{...base,id:'upcoming',date:'2026-11-03',time:'09:00'},{...base,id:'unspecified',date:'2026-11-03',time:''},{...base,id:'done',date:'2026-11-04',time:'09:00',status:'completed'}]
 assert.deepEqual(clients.upcomingClientSessions(sessions,new Date('2026-11-03T05:00:00Z')).map(item=>item.id),['upcoming','unspecified'])
})
test('dashboard preserves core cases/payment actions on optional source failures and does not present failure as zero',()=>{
 const h=hooks(),calls=[];const{ClientDashboardView}=load('components/clients/ClientDashboard.tsx',baseMocks(h))
 const tree=ClientDashboardView({ar:false,role:'organization',userId:'owner',userName:'Owner',profiles,assignments:summaries,sessions:[],assignmentError:'Assignments failed',scheduleError:'Schedule failed',onRetryAssignments:()=>calls.push('assignments'),onRetrySchedule:()=>calls.push('schedule')})
 assert.ok(text(tree).includes('Active case'));assert.ok(text(tree).includes('Unpaid case'));assert.ok(!text(tree).includes('FOREIGN CASE'))
 assert.ok(nodes(tree).some(node=>node.props?.href==='/dashboard/institution/projects/new'))
 const stats=nodes(tree).filter(node=>node.type==='Link'&&['/dashboard/assessments','/dashboard/institution/appointments'].includes(node.props.href))
 assert.ok(stats.some(node=>text(node).includes('Assignments awaiting you—')))
 assert.ok(stats.some(node=>text(node).includes('Upcoming sessions—')))
 assert.ok(!text(tree).includes('No upcoming appointments'));assert.ok(!text(tree).includes('You have no outstanding assignments'))
 const errors=nodes(tree).filter(node=>node.type==='Error');assert.equal(errors.length,2);errors.forEach(node=>node.props.onRetry());assert.deepEqual(calls,['schedule','assignments'])
})
test('dashboard and global assignment actions keep unpaid assessment responses behind the existing case activation flow',()=>{
 const h=hooks(),mocks=baseMocks(h);const{ClientDashboardView}=load('components/clients/ClientDashboard.tsx',mocks)
 const tree=ClientDashboardView({ar:false,role:'individual',userId:'owner',userName:'Owner',profiles,assignments:summaries,sessions:[]})
 assert.ok(!text(tree).includes('FOREIGN TASK'))
 const links=nodes(tree).filter(node=>node.type==='Link')
 assert.ok(links.some(node=>node.props.href==='/dashboard/assessments/Assessment%20A'))
 assert.ok(links.some(node=>node.props.href==='/dashboard/individual/cases/unpaid'&&text(node).includes('activation')))
 assert.ok(!links.some(node=>node.props.href==='/dashboard/assessments/Unpaid%20assessment'))
})
test('global client assignment filters compose real kind/case/status/search and keep role-correct task routes',()=>{
 const h=hooks(),{ClientAssignmentListView}=load('components/assignments/ClientAssignmentList.tsx',baseMocks(h))
 const render=()=>h.render(()=>ClientAssignmentListView({ar:false,role:'individual',userId:'owner',profiles,assignments:summaries}))
 let tree=render();const selectByLabel=label=>nodes(nodes(tree).find(node=>node.type==='label'&&text(node).startsWith(label))).find(node=>node.type==='select')
 assert.ok(!text(tree).includes('FOREIGN TASK'));assert.ok(!text(tree).includes('FOREIGN CASE'))
 assert.ok(nodes(tree).some(node=>node.type==='Link'&&node.props.href==='/dashboard/individual/cases/active/tasks/Task%20A'))
 selectByLabel('Filter by assignment type').props.onChange({target:{value:'assessment'}});tree=render()
 assert.ok(!text(tree).includes('Task A'));assert.ok(text(tree).includes('Assessment A'))
 selectByLabel('Case').props.onChange({target:{value:'active'}});tree=render();assert.ok(!text(tree).includes('Unpaid assessment'))
 nodes(tree).find(node=>node.type==='Input').props.onChange({target:{value:'missing'}});tree=render();assert.ok(text(tree).includes('No matching assignments'))
})
test('resource workspace selects only one owned case at a time and changes selected content without mounting every case',()=>{
 const h=hooks(),calls=[],mocks={...baseMocks(h),'@/components/cases/PaymentGate':{PaymentGate:'Gate'},'@/components/cases/CaseDocuments':{CaseDocuments:'Documents'},'@/components/assessments/CaseAssessments':{CaseAssessments:'Reports'}}
 const{ClientResourcesView}=load('components/clients/ClientResources.tsx',mocks)
 const render=()=>h.render(()=>ClientResourcesView({ar:false,role:'parent',userId:'owner',profiles,renderResources:(profile,tab)=>{calls.push([profile.id,tab]);return jsx('Gate',{profile,children:profile.status==='active'?`${tab} content`:'Activation required'})}}))
 let tree=render();assert.deepEqual(calls,[['active','reports']]);assert.ok(!text(tree).includes('FOREIGN CASE'))
 nodes(tree).find(node=>node.type==='select').props.onChange({target:{value:'unpaid'}});tree=render();assert.equal(calls.length,2);assert.deepEqual(calls[1],['unpaid','reports']);assert.ok(text(tree).includes('Activation required'))
 nodes(tree).find(node=>node.type==='button'&&node.props.id==='client-resource-documents').props.onClick();tree=render();assert.deepEqual(calls[2],['unpaid','documents'])
})
test('owner summary hook aborts stale auth requests and never returns a previous client payload during identity change',async()=>{
 const h=hooks(),requests=[];let currentUser={id:'first',role:'parent'}
 const{useClientAssignments}=load('hooks/useClientAssignments.ts',{react:h.react,'@/hooks/useAuth':{useAuth:()=>({currentUser})},'@/lib/lang-context':{useLang:()=>({lang:'en'})},'@/lib/pb':{__esModule:true,default:{send:(url,options)=>new Promise((resolve,reject)=>requests.push({url,options,resolve,reject}))},getErrorMessage:error=>error.message},'@/lib/client-services':clients})
 const render=()=>h.render(()=>useClientAssignments())
 assert.equal(render().isLoading,true);h.flush();await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.length,1)
 currentUser={id:'second',role:'organization'};let state=render();assert.equal(state.data,null);assert.equal(state.isLoading,true);h.flush();await new Promise(resolve=>setImmediate(resolve));assert.equal(requests[0].options.signal.aborted,true)
 requests[0].resolve({cases:[],assignments:[summary('PRIVATE FIRST CLIENT')]});await new Promise(resolve=>setImmediate(resolve));assert.equal(render().data,null)
 requests[1].resolve({cases:[],assignments:[summary('Second client')]});await new Promise(resolve=>setImmediate(resolve));state=render();assert.equal(state.data.assignments[0].name_en,'Second client')
 state.refresh();render();h.flush();await new Promise(resolve=>setImmediate(resolve));requests[2].reject(new Error('Summary failed'));await new Promise(resolve=>setImmediate(resolve));state=render();assert.equal(state.error,'Summary failed');assert.equal(state.data,null);assert.equal(state.isLoading,false)
 currentUser={id:'expert',role:'expert'};state=render();assert.equal(state.data,null);assert.equal(state.isLoading,false);h.flush();h.unmount()
})

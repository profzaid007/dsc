const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
function load(file,mocks={}){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('exports','require',code)(exports,name=>{assert.ok(name in mocks,`Unexpected dependency ${name}`);return mocks[name]});return exports}
function hooks(){let cursor=0,pending=[];const values=[];return{react:{use:value=>value,useState(initial){const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next}]},useRef(initial){const i=cursor++;if(!(i in values))values[i]={current:initial};return values[i]},useEffect(fn,deps){const i=cursor++;if(!values[i]||deps.some((value,j)=>value!==values[i][j])){values[i]=deps;pending.push(fn)}}},render(fn){cursor=0;return fn()},flush(){const effects=pending;pending=[];effects.forEach(fn=>fn())}}}
const jsx=(type,props,key)=>({type,props,key}),runtime={jsx,jsxs:jsx,Fragment:'Fragment'}
const nodes=tree=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(nodes):[tree,...nodes(tree.props?.children)]
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):Array.isArray(tree)?tree.map(text).join(''):tree?text(tree.props?.children):''
const icons=new Proxy({},{get:(_,name)=>String(name)})
const schedule=load('lib/expert-schedule.ts'),dates=load('lib/format-date.ts')
const clients=load('lib/client-services.ts',{'@/lib/payment-case-status':load('lib/payment-case-status.ts'),'@/lib/expert-schedule':schedule})
const profile={id:'owned',user:'owner',name:'Demo',status:'active',created:'2026-11-03',updated:'2026-11-03'}
const types=[{id:'meeting',key:'one_to_one_meeting',label:{ar:'جلسة فردية',en:'Individual session'}},{id:'survey',key:'survey',label:{ar:'استبيان',en:'Survey'}}]
const task=(id,patch={})=>({id,case:'owned',type:'meeting',name_ar:'جلسة',name_en:id,status:'pending',assigned_at:'2026-11-03',created:'2026-11-03',is_visible_to_user:true,task_brief:'STAFF ONLY BRIEF',responses:{private:'RAW RESPONSES'},config:{date:'2026-11-04',time:'09:00',meetingType:'online',description:'Public goals',notes:'PRIVATE NOTE',notesVisibleToUser:false,meetingLink:'https://example.test/session'},...patch})
function fixture(patch={}){const h=hooks();const props={profile,assignments:[task('Public session')],toolTypes:types,ar:false,role:'parent',...patch};const {ClientCaseAssignments}=load('components/clients/ClientCaseAssignments.tsx',{react:h.react,'react/jsx-runtime':runtime,'next/link':{__esModule:true,default:'Link'},'lucide-react':icons,'@/components/ui/button':{Button:'Button'},'@/components/ui/input':{Input:'Input'},'@/lib/client-services':clients,'@/lib/format-date':dates,'@/lib/expert-schedule':schedule});return{props,render:()=>h.render(()=>ClientCaseAssignments(props))}}

test('client case panel shares only visible same-case details and excludes staff notes, briefs and raw responses',()=>{
 const{render}=fixture({assignments:[task('Public session'),task('HIDDEN',{is_visible_to_user:false}),task('FOREIGN',{case:'other'})]})
 const tree=render(),content=text(tree)
 assert.ok(content.includes('Public goals'))
 for(const secret of ['PRIVATE NOTE','STAFF ONLY BRIEF','RAW RESPONSES','HIDDEN','FOREIGN'])assert.ok(!content.includes(secret),secret)
 assert.equal(nodes(tree).filter(n=>n.type==='button'&&'aria-pressed'in n.props).length,1)
})

test('client session notes require strict public visibility and unsafe join URLs or invalid dates are not presented',()=>{
 for(const visible of [false,undefined,'true',true]){
  const session=task('Session');session.config={...session.config,notesVisibleToUser:visible,meetingLink:'javascript:alert(1)',date:'2026-02-30'}
  const tree=fixture({assignments:[session]}).render()
  assert.equal(text(tree).includes('PRIVATE NOTE'),visible===true)
  assert.ok(!text(tree).includes('30-02-2026'))
  assert.equal(nodes(tree).filter(n=>n.type==='a').length,0)
 }
 const valid=fixture().render();const join=nodes(valid).find(n=>n.type==='a')
 assert.equal(join.props.href,'https://example.test/session');assert.equal(join.props.rel,'noopener noreferrer')
})

test('client assignment actions preserve role-specific response routes including completed answers',()=>{
 for(const[role,prefix]of[['parent','/dashboard/parent/cases'],['care_foundation','/dashboard/parent/cases'],['individual','/dashboard/individual/cases'],['organization','/dashboard/institution/projects']]){
  const tree=fixture({role,assignments:[task('complete',{status:'completed'})]}).render()
  const link=nodes(tree).find(n=>n.type==='Link')
  assert.equal(link.props.href,`${prefix}/owned/tasks/complete`)
  assert.equal(text(link),'View assignment and responses')
 }
})

test('unpaid or unsupported-role case props cannot expose task content or actions even before a caller gate',()=>{
 for(const patch of [{profile:{...profile,status:undefined}},{profile:{...profile,status:'awaiting_payment'}},{role:'expert'}]){
  const tree=fixture(patch).render()
  assert.ok(!text(tree).includes('Public goals'))
  assert.equal(nodes(tree).filter(n=>n.type==='Link'||n.type==='a').length,0)
 }
})

test('client type/search filters reset pagination and exclude other types from the list',()=>{
 const{render}=fixture({assignments:Array.from({length:8},(_,index)=>task(`Assignment ${index}`,{type:index<6?'meeting':'survey'}))})
 let tree=render();const find=predicate=>nodes(tree).find(predicate)
 find(n=>n.props?.['aria-label']==='Next page').props.onClick();tree=render();assert.ok(text(tree).includes('Page 2 / 2'))
 find(n=>n.type==='select').props.onChange({target:{value:'survey'}});tree=render();assert.ok(text(tree).includes('Page 1 / 1'))
 assert.equal(nodes(tree).filter(n=>n.type==='button'&&'aria-pressed'in n.props).length,2)
 find(n=>n.type==='Input').props.onChange({target:{value:'7'}});tree=render();assert.equal(nodes(tree).filter(n=>n.type==='button'&&'aria-pressed'in n.props).length,1)
 find(n=>n.type==='Input').props.onChange({target:{value:'nothing'}});tree=render();assert.ok(text(tree).includes('No assignments match these filters.'))
})

function pageFixture(role){
 const h=hooks(),calls={profiles:0,tasks:0,types:0}
 const state={authLoading:false,profilesLoading:false,profileError:'',tasksError:'',typesError:null,candidate:{...profile,status:'awaiting_payment'}}
 const fetchToolTypes=async()=>{calls.types++;return types}
 const mocks={react:h.react,'react/jsx-runtime':runtime,'next/navigation':{useRouter:()=>({back(){}})},'next/link':{__esModule:true,default:'Link'},'lucide-react':icons,sonner:{toast:{success(){}}},'@/hooks/useProfiles':{useProfiles:()=>({getProfileById:()=>state.candidate,isLoading:state.profilesLoading,loadError:state.profileError,refresh:()=>{calls.profiles++},updateProfile:async()=>{}})},'@/hooks/useAssignments':{useAssignments:()=>({getVisibleAssignments:()=>[task('visible'),task('HIDDEN',{is_visible_to_user:false})],isLoading:false,loadError:state.tasksError,refresh:()=>{calls.tasks++}})},'@/hooks/useToolTypes':{useToolTypes:()=>({toolTypes:types,fetchToolTypes,isLoading:false,error:state.typesError})},'@/hooks/useAuth':{useAuth:()=>({currentUser:{id:'owner',role},isLoading:state.authLoading})},'@/lib/lang-context':{useLang:()=>({lang:'en'})},'@/lib/format-date':dates,'@/lib/pb':{getErrorMessage:error=>error.message},'@/lib/project-validation':{validateProject:()=>null,projectCaseData:()=>({})},'@/components/clients/ClientCaseAssignments':{ClientCaseAssignments:'ClientAssignments'},'@/components/ui/data-error':{DataError:'Error'},'@/components/ui/page-loader':{PageLoader:'Loader'}}
 for(const name of ['CaseDocuments','CaseMessages','CaseName','CaseFeedback'])mocks[`@/components/cases/${name}`]={[name]:name}
 mocks['@/components/cases/PaymentGate']={PaymentGate:'PaymentGate'};mocks['@/components/assessments/CaseAssessments']={CaseAssessments:'CaseAssessments'}
 for(const[path,names]of Object.entries({card:['Card','CardHeader','CardTitle','CardDescription','CardContent'],button:['Button'],badge:['Badge'],tabs:['Tabs','TabsContent','TabsList','TabsTrigger'],skeleton:['Skeleton'],input:['Input'],label:['Label'],textarea:['Textarea'],'date-input':['DateInput']}))mocks[`@/components/ui/${path}`]=Object.fromEntries(names.map(name=>[name,name]))
 const file=role==='organization'?'app/dashboard/institution/projects/[id]/page.tsx':`app/dashboard/${role}/cases/[id]/page.tsx`
 const Page=load(file,mocks).default
 return{state,calls,render:()=>h.render(()=>Page({params:{id:'owned'}})),flush:async()=>{h.flush();await new Promise(resolve=>setImmediate(resolve))}}
}

test('client case loading, ownership and profile errors are handled before showing protected case content',async()=>{
 for(const role of ['parent','individual','organization']){
  const f=pageFixture(role);f.state.authLoading=true;let tree=f.render();assert.ok(!text(tree).includes('not found'));assert.equal(nodes(tree).some(n=>n.type==='PaymentGate'),false)
  await f.flush();f.state.authLoading=false;f.state.profilesLoading=true;tree=f.render();assert.equal(nodes(tree).some(n=>n.type==='PaymentGate'),false)
  f.state.profilesLoading=false;f.state.profileError='Profile request failed';tree=f.render();assert.equal(tree.type,'Error');tree.props.onRetry();assert.equal(f.calls.profiles,1);assert.equal(f.calls.tasks,1)
  f.state.profileError='';f.state.candidate={...f.state.candidate,user:'someone-else'};tree=f.render();assert.equal(nodes(tree).some(n=>n.type==='PaymentGate'),false)
 }
})

test('unpaid client cases retain payment instructions and organization editing when task or lookup requests fail',async()=>{
 for(const role of ['parent','individual','organization']){
  const f=pageFixture(role);f.render();await f.flush();f.state.tasksError='Task request failed';f.state.typesError='Lookup request failed'
  const tree=f.render(),gate=nodes(tree).find(n=>n.type==='PaymentGate')
  assert.ok(gate,`${role} payment gate remains reachable`);assert.equal(gate.props.profile.status,'awaiting_payment')
  assert.equal(nodes(tree).filter(n=>n.type==='ClientAssignments').length,0)
  if(role==='organization')assert.ok(text(tree).includes('Manage project details'))
 }
})

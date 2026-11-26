const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
function renderTraining(lang){
 const host=(tag)=>({children,asChild,...props})=>asChild?React.cloneElement(React.Children.only(children),props):React.createElement(tag,props,children)
 const mocks={react:React,'@/components/PublicEventTime':{usePublicEventTime:()=>({now:Date.UTC(2026,10,26),hydrated:false})},'@/lib/public-event-dates':{publicEventDate:value=>new Date(value),publicEventInstant:value=>new Date(value),publicEventDateLabel:String},'next/navigation':{useRouter:()=>({push(){},refresh(){}})},'next/image':{__esModule:true,default:()=>null},'@/lib/lang-context':{useLang:()=>({lang})},'@/hooks/useAuth':{useAuth:()=>({currentUser:null})},'@/lib/pb-collections':{casesCollection:{}},'@/lib/pb':{__esModule:true,default:{},getErrorMessage:String},'@/lib/format-date':{formatDate:String},'@/lib/validators':{EMAIL_INVALID_MESSAGE:{en:'Invalid email'},isValidEmail:()=>true,normalizeEmail:String},sonner:{toast:{error(){}}}}
 const ui={card:['Card','CardContent','CardHeader','CardTitle'],button:['Button'],badge:['Badge'],input:['Input'],'email-input':['EmailInput'],'password-input':['PasswordInput'],label:['Label'],separator:['Separator'],alert:['Alert','AlertDescription']}
 for(const [file,names]of Object.entries(ui))mocks['@/components/ui/'+file]=Object.fromEntries(names.map(name=>[name,host(name.includes('Input')?'input':name==='Label'?'label':name==='Button'?'button':'div')]))
 const state={exports:{}}
 const code=ts.transpileModule(fs.readFileSync('app/programmes/training_programmes/[id]/TrainingProgrammeDetail.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('exports','require',code)(state.exports,name=>mocks[name]||require(name))
 const program={id:'future',title:{en:'Future programme',ar:'برنامج قادم'},category:{en:'Education',ar:'التعليم'},trainer:{name:{en:'Trainer',ar:'المدرب'},role:{en:'Teacher',ar:'معلم'}},coordinator:'',type:'online',location:'',duration:60,schedule:{startDate:'2099-01-01',endDate:'2099-01-02',sessions:[]},currentRegistrations:0,isPublic:true,status:'published'}
 return renderToStaticMarkup(React.createElement(state.exports.default,{program}))
}
test('anonymous visitors receive future programme content and enrolment fields in initial HTML',()=>{
 for(const lang of ['ar','en']){
  const html=renderTraining(lang)
  assert.ok(html.includes(lang==='ar'?'برنامج قادم':'Future programme'))
  assert.match(html,/id="enroll-name"/)
  assert.match(html,/id="enroll-email"/)
  assert.match(html,/<input\b/)
  assert.doesNotMatch(html,/Loading\.\.\.|Checking\.\.\.|جاري التحميل|جاري التحقق/)
 }
})

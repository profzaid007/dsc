const {test}=require("node:test")
const assert=require("node:assert/strict")
const fs=require("node:fs"),vm=require("node:vm")
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync("pb_hooks/lib/case-owner-display.js","utf8"),context)
const display=(...args)=>JSON.parse(JSON.stringify(context.module.exports(...args)))
const record=values=>({id:"owner",getString:key=>values[key]||""})
test("child uses its parent's name",()=>{
 assert.deepEqual(display({findRecordById:()=>record({role:"parent",name:"Parent A"})},record({user:"owner"})),{type:"parent",name:"Parent A"})
})
test("care case uses organization name, not the contact person's name",()=>{
 const app={findRecordById:()=>record({role:"care_foundation",name:"Contact Person"}),findRecordsByFilter:(table,filter,sort,limit,offset,params)=>{
 assert.equal(table,"organization_profiles");assert.equal(params.user,"owner");return [record({organization_name:"Care Foundation A"})]
 }}
 assert.deepEqual(display(app,record({user:"owner"})),{type:"care_foundation",name:"Care Foundation A"})
})
test("missing care profile is explicit and does not substitute a contact name",()=>{
 assert.deepEqual(display({findRecordById:()=>record({role:"care_foundation",name:"Contact Person"}),findRecordsByFilter:()=>[]},record({user:"owner"})),{type:"care_foundation",name:""})
})
test("individual cases and cases without an owner do not receive a parent label",()=>{
 assert.equal(display({findRecordById:()=>record({role:"individual",name:"Client"})},record({user:"owner"})),null)
 assert.equal(display({},record({})),null)
})


test("organization cases use their organization name and type",()=>{
 const app={findRecordById:()=>record({role:"organization",name:"Contact Person"}),findRecordsByFilter:()=>[record({organization_name:"School A"})]}
 assert.deepEqual(display(app,record({user:"owner"})),{type:"organization",name:"School A"})
})

test("case headings render the case, owner type and full owner name in both interface languages",()=>{
 const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
 for(const lang of ['ar','en']){
  const exports={}
  new Function('exports','require',ts.transpileModule(fs.readFileSync('components/cases/CaseName.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(exports,name=>name==='@/lib/lang-context'?{useLang:()=>({lang})}:require(name))
  for(const [type,label] of [['parent',lang==='ar'?'ولي الأمر':'Parent'],['care_foundation',lang==='ar'?'جهة الرعاية':'Care foundation'],['organization',lang==='ar'?'الجهة':'Organization']]){
   const html=renderToStaticMarkup(React.createElement(exports.CaseName,{profile:{name:'مها',owner_display:{type,name:'Full owner name'}}}))
   assert.ok(html.includes('مها'));assert.ok(html.includes(label));assert.ok(html.includes('Full owner name'))
  }
 }
})

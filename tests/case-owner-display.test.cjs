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

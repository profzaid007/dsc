import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import {ClientResponseError} from "pocketbase"
import {getFieldErrors,getErrorMessage} from "../lib/pb"
class ValidationError { constructor(public code:string,public message:string){} }
class BadRequestError extends Error { constructor(message:string,public data:Record<string,ValidationError>={}){super(message)} }
const source=fs.readFileSync("pb_hooks/lib/account-registration.js","utf8")
function failure(userChanges={},cases:unknown[]=[]) {
 const context={module:{exports:undefined as unknown},ValidationError,BadRequestError}
 vm.runInNewContext(source,context)
 const run=context.module.exports as (event:unknown)=>void
 try { run({requestInfo:()=>({body:{submission_key:"valid-submission-123456789",user:{role:"parent",name:"Parent",email:"parent@example.test",password:"12345678",passwordConfirm:"12345678",contact_number:"+966501234567",...userChanges},profile:{collection:"parent_profiles"},cases}}),app:{findCollectionByNameOrId:()=>({fields:{getByName:()=>null}})}}) }
 catch(error){return error as BadRequestError}
 throw Error("Expected a validation error")
}
function client(error:BadRequestError){return new ClientResponseError({status:400,response:{message:error.message,data:error.data}})}
test("registration identifies name, email, mobile and password problems",()=>{
 for(const [changes,field,code] of [
  [{name:""},"name","validation_required"],
  [{email:"wrong"},"email","validation_email"],
  [{contact_number:"123"},"contact_number","registration_phone"],
  [{name:"a".repeat(201)},"name","registration_max_length"],
  [{passwordConfirm:"different"},"passwordConfirm","validation_password_mismatch"],
 ] as const){const error=failure(changes);assert.equal(error.data[field]?.code,code)}
 const error=client(failure({contact_number:"123"}));assert.match(getErrorMessage(error,"en"),/Mobile number:.*country code/);assert.match(getErrorMessage(error,"ar"),/رقم الجوال/)
})
test("child validation identifies the child number and exact field in both languages",()=>{
 const child={name:"Child",portal_type:"education",service_type:"assessment",gender:"male",relationship:"parent",date_of_birth:"2999-01-01"}
 const error=client(failure({},[child]));assert.match(getErrorMessage(error,"en"),/Child 1.*Date of birth.*not in the future/);assert.match(getErrorMessage(error,"ar"),/الطفل 1.*تاريخ الميلاد/)
})
test("field limits and missing server setup give actionable messages",()=>{
 assert.match(getErrorMessage(client(failure({name:"a".repeat(201)})),"en"),/200 characters/)
 assert.match(getErrorMessage(client(failure()),"en"),/parent_profiles.submission_key is missing/)
 const error=client(failure({password:"a".repeat(129)}));assert.match(getFieldErrors(error,"en").password,/8 to 128/)
})

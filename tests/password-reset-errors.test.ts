import test from "node:test"
import assert from "node:assert/strict"
import {handlePocketBaseError} from "../lib/pb"
test("reset errors distinguish malformed email from unregistered email in both languages",()=>{
 const error=(code:string)=>({status:400,response:{code}})
 assert.equal(handlePocketBaseError(error("password_reset_email_not_registered"),"ar"),"هذا البريد غير مسجل")
 assert.equal(handlePocketBaseError(error("password_reset_email_not_registered"),"en"),"This email address is not registered.")
 assert.equal(handlePocketBaseError(error("password_reset_email_invalid"),"ar"),"أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.com")
 assert.match(handlePocketBaseError(error("password_reset_email_invalid"),"en"),/name@example.com/)
})

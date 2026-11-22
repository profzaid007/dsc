import test from "node:test"
import assert from "node:assert/strict"
import {handlePocketBaseError} from "../lib/pb"
test("reset errors validate format without revealing account registration",()=>{
 const error=(code:string)=>({status:400,response:{code}})
 assert.match(handlePocketBaseError(error("password_reset_email_not_registered"),"ar"),/إذا كان هناك حساب/)
 assert.match(handlePocketBaseError(error("password_reset_email_not_registered"),"en"),/If an account matches/)
 assert.equal(handlePocketBaseError(error("password_reset_email_invalid"),"ar"),"أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.com")
 assert.match(handlePocketBaseError(error("password_reset_email_invalid"),"en"),/name@example.com/)
})

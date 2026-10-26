import test from "node:test"
import assert from "node:assert/strict"
import {toStringList, recordStringArray} from "../lib/expert-list-fields"
import {paymentCaseStatus} from "../lib/payment-case-status"

test("expert text lists accept comma-separated text only and report invalid values",()=>{
 assert.deepEqual(toStringList("therapy, education"),["therapy","education"])
 assert.deepEqual(toStringList(""),[])
 for(const value of [["therapy"], '["therapy"]', {role:"therapy"}, 42])
   assert.throws(()=>toStringList(value,"expert abc: specialization_type"),/expert abc.*needs correction/)
 assert.deepEqual(recordStringArray(["role-id"]),["role-id"])
 assert.throws(()=>recordStringArray("role-id"),/expected a database array/)
})
test("missing case statuses require payment while explicit statuses remain unchanged",()=>{
 for(const status of [undefined,null,"","   "])assert.equal(paymentCaseStatus(status),"awaiting_payment")
 for(const status of ["active","pending","under_review"])assert.equal(paymentCaseStatus(status),status)
})

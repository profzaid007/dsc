const { test } = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const exportsObject = {}
const source = fs.readFileSync(path.join(__dirname, '../components/assessments/import-questions.ts'), 'utf8')
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exportsObject })
const { previewQuestions } = exportsObject
const definition = { questions:[{order:9}], answerSets:[{id:'set1'}], dimensions:[{id:'dim1'}] }
const mapping = { text:'question',order:'sequence',weight:'weight',reverse:'reverse',critical:'critical',answerSet:'set',dimensions:'dimensions' }
const row = {question:'سؤال تجريبي', sequence:10, weight:2, reverse:'نعم', critical:'false',set:'set1',dimensions:'dim1'}
test('maps selected columns and preserves scoring metadata before append',()=>{
 const [q] = previewQuestions([row],mapping,definition,()=> 'q1')
 assert.equal(q.text,row.question);assert.equal(q.order,10);assert.equal(q.weight,2);assert.equal(q.reverse,true);assert.equal(q.critical,false);assert.equal(q.answerSet,'set1');assert.equal(q.dimensions[0].id,'dim1');assert.equal(definition.questions.length,1)
})
test('rejects entire preview on a malformed later row without changing definition',()=>{
 for (const patch of [{question:''},{sequence:9},{sequence:1.5},{weight:0},{weight:'NaN'},{weight:1001},{reverse:'maybe'},{set:'missing'},{dimensions:'unknown'},{dimensions:'dim1,dim1'}]) {
  assert.throws(()=>previewQuestions([row,{...row,sequence:11,...patch}],mapping,definition,()=> 'q2'))
  assert.equal(definition.questions.length,1)
 }
})
test('defaults append ordering from maximum existing order, never array length',()=>{
 const [q]=previewQuestions([{question:'سؤال'}],{text:'question'},definition,()=> 'q3')
 assert.equal(q.order,10);assert.equal(q.answerSet,'set1');assert.equal(q.weight,1)
 assert.throws(()=>previewQuestions([{question:'سؤال'}],{text:'question'},{...definition,answerSets:[{id:'one'},{id:'two'}]},()=> 'q4'))
})
test('empty sheet and duplicate imported order cannot silently produce partial imports',()=>{
 assert.throws(()=>previewQuestions([],mapping,definition,()=> 'q5'))
 assert.throws(()=>previewQuestions([row,row],mapping,definition,()=> 'q5'))
})



const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
const exportsObject={}
const source=ts.transpileModule(fs.readFileSync('components/assessments/AnswerMatrix.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
new Function('exports','require',source)(exportsObject,require)
const {default:AnswerMatrix,groupAnswerRows}=exportsObject
const shared=[{id:'never',label:'أبدًا'},{id:'often',label:'غالبًا'}]
const q=(id,order,options=shared)=>({id,order,text:`سؤال ${id}`,options})
const render=(props)=>renderToStaticMarkup(React.createElement(AnswerMatrix,{questions:[q('one',1),q('two',2)],answers:{one:'often'},onChange(){},...props}))
test('common options use one matrix with shared column headings and unique radio group per question',()=>{
 const html=render()
 assert.equal((html.match(/<table/g)||[]).length,1)
 const inputs=html.match(/<input[^>]*>/g)
 assert.equal(inputs.length,4)
 const names=inputs.map(s=>s.match(/name="([^"]+)"/)[1])
 assert.equal(names[0],names[1]);assert.equal(names[2],names[3]);assert.notEqual(names[0],names[2])
 assert.equal((html.match(/scope="col"/g)||[]).length,4)
 assert.ok(inputs[1].includes('checked=""'))
 assert.ok(inputs[1].includes('سؤال one — غالبًا'))
 assert.ok(html.includes('min-h-14'));assert.ok(html.includes('overflow-auto'));assert.ok(html.includes('sticky top-0'))
})
test('mixed options keep exact per-row IDs/labels and preserve global order in contiguous groups',()=>{
 const other=[{id:'yes',label:'نعم'},{id:'no',label:'لا'}]
 const rows=[q('three',3),q('one',1),q('two',2,other),q('four',4)]
 const groups=groupAnswerRows(rows)
 assert.equal(groups.length,3)
 assert.deepEqual(groups.flatMap(g=>g.rows.map(r=>r.id)),['one','two','three','four'])
 const html=render({questions:rows})
 assert.equal((html.match(/<table/g)||[]).length,3)
 assert.ok(html.includes('value="yes"'));assert.ok(html.includes('value="never"'))
 assert.ok(html.indexOf('سؤال one')<html.indexOf('سؤال two'));assert.ok(html.indexOf('سؤال two')<html.indexOf('سؤال three'))
 assert.equal(groupAnswerRows([q('one',1),q('two',2,[{id:'never',label:'Different label'},{id:'often',label:'غالبًا'}])]).length,2)
})
test('locked/busy matrices disable every radio and omit clear controls without losing saved selection',()=>{
 const html=render({disabled:true})
 const radios=html.match(/<input[^>]*>/g)
 assert.equal(radios.length,4)
 assert.ok(radios.every(s=>s.includes('disabled=""')))
 assert.ok(radios[1].includes('checked=""'))
 assert.equal((html.match(/<button/g)||[]).length,0)
 assert.equal((html.match(/scope="col"/g)||[]).length,3)
})

test('introduction, reference period and respondent notice render as escaped plain text before answering',()=>{
 const target={}
 const code=ts.transpileModule(fs.readFileSync('components/assessments/AssessmentInstructions.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('exports','require',code)(target,require)
 const html=renderToStaticMarkup(React.createElement(target.default,{instructions:'المقدمة\nالسطر الثاني <script>alert(1)</script>',referencePeriod:'خلال الأسبوع الماضي',respondentNotice:'يمكن طلب توضيح من المختص',lang:'ar'}))
 for(const text of ['المقدمة والتعليمات','الفترة الزمنية المرجعية','تنبيه للمجيب','خلال الأسبوع الماضي','يمكن طلب توضيح'])assert.ok(html.includes(text))
 assert.ok(html.includes('&lt;script&gt;'));assert.equal(html.includes('<script>'),false);assert.ok(html.includes('whitespace-pre-wrap'))
 assert.equal(renderToStaticMarkup(React.createElement(target.default,{})),'')
})

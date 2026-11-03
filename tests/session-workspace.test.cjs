const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(file, mocks) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  new Function('exports', 'require', code)(exports, name => { assert.ok(name in mocks, `Unexpected dependency: ${name}`); return mocks[name] })
  return exports
}
function hooks() {
  let cursor = 0
  const values = []
  let pending=[]
  return {
    react: { useState(initial) { const index = cursor++; if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial; return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next }] }, useRef(value) { const index=cursor++; if (!(index in values)) values[index]={current:value}; return values[index] }, useEffect(fn,deps) { const index=cursor++; const previous=values[index]; if (!previous || deps.some((value,i)=>value!==previous[i])) { values[index]=deps; pending.push(fn) } } },
    render(fn) { cursor = 0; return fn() }, flush() { const effects=pending; pending=[]; effects.forEach(fn=>fn()) },
  }
}
const jsx = (type, props) => ({type, props})
const runtime = { jsx, jsxs: jsx }
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)]
const text = tree => typeof tree === 'string' || typeof tree === 'number' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : tree ? text(tree.props?.children) : ''
const icons = new Proxy({}, { get: (_, key) => String(key) })
const meeting = load('lib/meeting-assignment.ts', {})
function workspaceFixture() {
  const h = hooks()
  const { CaseAssignmentsWorkspace } = load('components/cases/CaseAssignmentsWorkspace.tsx', {
    react: h.react, 'react/jsx-runtime': runtime, 'next/link': {default:'Link'}, 'lucide-react': icons,
    '@/components/ui/button': {Button:'Button'}, '@/components/ui/input': {Input:'Input'}, '@/lib/format-date': {formatDate:value=>value},
  })
  const items = Array.from({length:9}, (_,i)=>({id:String(i),name:`Assignment ${i}`,status:'pending',date:'2026-11-03',typeKey:i<7?'meeting':'plan',typeLabel:i<7?'Meeting':'Plan',category:'Same specialization',content:`Draft ${i}`}))
  const render = () => h.render(()=>CaseAssignmentsWorkspace({ar:false,caseName:'Demo',caseId:'demo',items,documents:null,results:null,create:null}))
  return {render,items}
}
test('assignment type filtering combines with search, resets pagination and offers actual types separately from specialization',()=>{
  const {render} = workspaceFixture()
  let tree=render()
  const find = predicate => nodes(tree).find(predicate)
  assert.deepEqual(nodes(find(n=>n.type==='select')).filter(n=>n.type==='option').map(n=>text(n)),['All types','Meeting','Plan'])
  find(n=>n.props?.['aria-label']==='Next page').props.onClick()
  tree=render()
  assert.ok(text(tree).includes('2 / 2'))
  find(n=>n.type==='select').props.onChange({target:{value:'plan'}})
  tree=render()
  assert.ok(text(tree).includes('1 / 1'))
  assert.deepEqual(nodes(tree).filter(n=>n.type==='button' && 'aria-pressed' in n.props).map(n=>n.props.children[1].props.children),['Assignment 7','Assignment 8'])
  find(n=>n.type==='Input').props.onChange({target:{value:'8'}})
  tree=render()
  assert.equal(nodes(tree).filter(n=>n.type==='button' && 'aria-pressed' in n.props).length,1)
  find(n=>n.type==='Input').props.onChange({target:{value:'nothing'}})
  tree=render()
  assert.ok(text(tree).includes('No assignments match your search and type filter.'))
})
test('changing a type filter preserves the selected assignment detail and draft',()=>{
  const {render} = workspaceFixture()
  let tree=render()
  nodes(tree).find(n=>n.type==='button' && 'aria-pressed' in n.props).props.onClick()
  tree=render()
  assert.ok(text(tree).includes('Draft 0'))
  nodes(tree).find(n=>n.type==='select').props.onChange({target:{value:'plan'}})
  tree=render()
  assert.ok(text(tree).includes('Draft 0'))
})
test('meeting edits retain media and unrelated configuration while clearing obsolete mode fields',()=>{
  const existing = {date:'2026-11-03',time:'09:00',meetingType:'online',meetingLink:'https://example.com/old',media:['kept.pdf'],integrationId:'keep',notes:'old'}
  const draft=meeting.meetingDraft('Session',existing)
  const config=meeting.meetingConfig({...draft,meetingType:'face_to_face',location:' Room 3 ',description:' Goals ',notes:' New '},existing)
  assert.deepEqual(config.media,['kept.pdf'])
  assert.equal(config.integrationId,'keep')
  assert.equal(config.meetingLink,'')
  assert.equal(config.location,'Room 3')
  assert.equal(config.description,'Goals')
  assert.equal(config.notes,'New')
  assert.equal(config.notesVisibleToUser,false)
  assert.equal(existing.meetingLink,'https://example.com/old')
})
function detailFixture(capability,status='pending') {
  const h=hooks(), calls=[]
  const {MeetingAssignmentDetail}=load('components/cases/MeetingAssignmentDetail.tsx', {
    react:h.react,'react/jsx-runtime':runtime,'lucide-react':icons,sonner:{toast:{success(){}}},
    '@/components/ui/button':{Button:'Button'},'@/components/cases/OneToOneMeetingFields':{OneToOneMeetingFields:'Fields'},
    '@/lib/meeting-assignment':meeting,'@/lib/pb':{getErrorMessage:error=>error.message},
  })
  const task={id:'session',name_ar:'جلسة',status,can_edit_configuration:capability,config:{date:'2026-11-03',time:'09:00',meetingType:'online',media:['retained']}}
  const render=()=>h.render(()=>MeetingAssignmentDetail({task,ar:true,save:async(...args)=>calls.push(args)}))
  return {render,calls}
}
test('inline meeting save requires server capability and noncompleted state',async()=>{
  for (const [capability,status] of [[undefined,'pending'],[false,'pending'],[true,'completed']]) {
    const {render,calls}=detailFixture(capability,status)
    const tree=render()
    assert.equal(nodes(tree).find(n=>n.type==='Fields').props.readOnly,true)
    await tree.props.onSubmit({preventDefault(){}})
    assert.equal(calls.length,0)
  }
})
test('authorized inline meeting saves edited fields and cancel restores saved values',async()=>{
  const {render,calls}=detailFixture(true)
  let tree=render()
  let fields=nodes(tree).find(n=>n.type==='Fields')
  fields.props.onChange({...fields.props.value,title:'Updated session',description:'Goal'})
  tree=render()
  await tree.props.onSubmit({preventDefault(){}})
  assert.equal(calls.length,1)
  assert.equal(calls[0][1].name_ar,'Updated session')
  assert.equal(calls[0][1].config.description,'Goal')
  assert.deepEqual(calls[0][1].config.media,['retained'])
  tree=render()
  nodes(tree).find(n=>n.type==='Button' && n.props.type==='button').props.onClick()
  tree=render()
  assert.equal(nodes(tree).find(n=>n.type==='Fields').props.value.title,'جلسة')
})

test('shared meeting builder preserves admin edits of completed meetings and enforces expert capability',async()=>{
  for (const [role,status,capability,allowed] of [['admin','completed',true,true],['super_admin','completed',true,true],['expert','completed',true,false],['expert','pending',false,false],['expert','pending',true,true]]) {
    const h=hooks(), calls=[]
    const assignment={id:'session',case:'case',name_ar:'جلسة',status,can_edit_configuration:capability,config:{date:'2026-11-03',time:'09:00',meetingType:'online',media:['keep']}}
    const params=Promise.resolve({edit:'session'})
    const getProfileById=()=>({id:'case',name:'Demo'})
    const Page=load('app/dashboard/admin/tools/one-to-one-meeting/new/page.tsx',{
      react:h.react,'react/jsx-runtime':runtime,'next/navigation':{useRouter:()=>({push(){}})},'lucide-react':icons,sonner:{toast:{success(){}}},
      '@/lib/case-task-path':{caseTaskPath:()=>'/case'},'@/hooks/useAssignments':{useAssignments:()=>({assignments:[assignment],isLoading:false,loadError:'',assignTool:async()=>{},updateAssignment:async(...args)=>calls.push(args)})},
      '@/hooks/useAuth':{useAuth:()=>({currentUser:{role}})},'@/hooks/useProfiles':{useProfiles:()=>({getProfileById})},
      '@/lib/pb-collections':{toolTypesCollection:{getByName:async()=>({id:'type'})}},'@/lib/pb':{getErrorMessage:error=>error.message},
      '@/lib/lang-context':{useLang:()=>({lang:'ar'})},'@/lib/meeting-assignment':meeting,
      '@/components/ui/button':{Button:'Button'},'@/components/case-search-combobox':{CaseSearchCombobox:'CasePicker'},'@/components/cases/OneToOneMeetingFields':{OneToOneMeetingFields:'Fields'},
    }).default
    const render=()=>h.render(()=>Page({searchParams:params}))
    render();h.flush();await new Promise(resolve=>setImmediate(resolve))
    const tree=render()
    assert.equal(nodes(tree).find(n=>n.type==='Fields').props.readOnly,!allowed,`${role}/${status} field access`)
    await nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}})
    assert.equal(calls.length,allowed?1:0,`${role}/${status} submit access`)
  }
})

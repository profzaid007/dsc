const fs = require('node:fs'), path = require('node:path'), ts = require('typescript')
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
const assert = require('node:assert/strict'), { test } = require('node:test')
const root = path.resolve(__dirname, '..')
function load(file, mocks) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  new Function('exports', 'require', code)(exports, name => mocks[name] || require(name))
  return exports
}
const model = load('components/messages/mailbox-model.ts', {})
const primitiveMocks = { '@/lib/utils': load('lib/utils.ts', {}) }
const primitives = {
  '@/components/ui/button': load('components/ui/button.tsx', primitiveMocks),
  '@/components/ui/input': load('components/ui/input.tsx', primitiveMocks),
  '@/components/ui/textarea': load('components/ui/textarea.tsx', primitiveMocks),
  '@/components/ui/label': load('components/ui/label.tsx', primitiveMocks),
}
const message = (id, sender, recipient, subject, created, read = false, caseId = '') => ({ id, sender, recipient, subject, body: `Message body ${id}`, created, read, case: caseId, attachments: [] })
const baseProps = {
  messages: [message('second', 'admin', 'self', 'Next messages', '2026-11-01 07:06:58Z'), message('first', 'admin', 'self', 'How are you', '2026-11-01 07:06:00Z'), message('sent', 'self', 'admin', 'Thank you', '2026-11-01 07:00:00Z', true), message('private', 'admin', 'other', 'PRIVATE', '2026-11-01 08:00:00Z')],
  contacts: [{ id: 'admin', name: 'Admin-Test', role: 'super_admin' }], userId: 'self', lang: 'en', isAdmin: false, canCreate: true, caseRoute: 'expert/cases', sending: false, actionError: '', notice: '', onRead() {}, onSend: async draft => ({ sent: draft.recipients.length, failedRecipients: [] }), onClearNotice() {},
}
function harness(props = {}, initial = ['received', '', false, '', null]) {
  const state = [...initial]; let cursor = 0
  const native = tag => ({ children, variant, size, ...props }) => React.createElement(tag, props, children)
  const mocks = {
    react: { ...React, useRef: value => ({ current: value }), useEffect() {}, useState(value) { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next }] } },
    'next/link': { __esModule: true, default: native('a') },
    ...primitives,
    '@/lib/person-name':load('lib/person-name.ts',{}),
    '@/components/cases/CaseMessages': { MessageBody: ({ text }) => React.createElement('p', { dir: 'auto' }, text), MessageAttachments: () => null }, './mailbox-model': model,
  }
  const { Mailbox } = load('components/messages/Mailbox.tsx', mocks)
  return { state, props: { ...baseProps, ...props }, render() { cursor = 0; return Mailbox(this.props) } }
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (predicate(node)) return node
  for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found }
  return null
}
if (require.main === module) {
  test('folders and search only expose current-user messages, newest first', () => {
    const received = model.mailboxMessages(baseProps.messages, 'self', 'received', '', false, baseProps.contacts)
    assert.deepEqual(received.map(m => m.id), ['second', 'first'])
    assert.deepEqual(model.mailboxMessages(baseProps.messages, 'self', 'sent', '', false, baseProps.contacts).map(m => m.id), ['sent'])
    assert.deepEqual(model.mailboxMessages(baseProps.messages, 'self', 'all', 'thank', false, baseProps.contacts).map(m => m.id), ['sent'])
    assert.equal(model.mailboxMessages(baseProps.messages, 'self', 'all', 'PRIVATE', false, baseProps.contacts).length, 0)
  })
  test('administrators can find and open messages between other users without marking them read', () => {
    const reads = []
    const contacts = [...baseProps.contacts, { id: 'other', name: 'Case Expert', role: 'expert' }]
    const h = harness({ isAdmin: true, contacts, onRead: message => reads.push(message.id) })
    assert.ok(!renderToStaticMarkup(harness().render()).includes('Messages between users'))
    find(h.render(), node => node.type === 'button' && node.props?.children?.some?.(child => child?.props?.children === 'Messages between users')).props.onClick()
    assert.deepEqual(model.mailboxMessages(baseProps.messages, 'self', 'between-users', 'Case Expert', false, contacts).map(m => m.id), ['private'])
    find(h.render(), node => node.key === 'private').props.onClick()
    const html = renderToStaticMarkup(h.render())
    assert.match(html, /Admin-Test → Case Expert/)
    assert.match(html, /Message body private/)
    assert.doesNotMatch(html, /aria-label="Reply"/)
    assert.deepEqual(reads, [])
  })
  test('case context composes linked messages for multiple authorized participants and shows case labels', () => {
    const h = harness({ caseContext: { id: 'case-123', name: 'Review case' }, contacts: [...baseProps.contacts, { id: 'owner', name: 'Owner', role: 'parent' }] })
    find(h.render(), node => node.props?.['aria-label'] === 'New message').props.onClick()
    assert.equal(h.state[4].caseId, 'case-123')
    assert.equal(h.state[4].replyTo, undefined)
    const html = renderToStaticMarkup(h.render())
    assert.ok(html.includes('Linked to case: ')); assert.ok(html.includes('Review case')); assert.ok(html.includes('Owner'))
    const linked = { ...message('linked', 'admin', 'self', 'Case update', '2026-11-01 07:06:58Z', true, 'case-123'), expand: { case: { name: 'Review case' } } }
    assert.ok(renderToStaticMarkup(harness({ messages: [linked] }).render()).includes('Case: Review case'))
    assert.equal(model.mailboxMessages([linked], 'self', 'all', 'Review case', false, baseProps.contacts).length, 1)
  })
  test('mailbox does not mark previews read; selecting only one received message requests its read update', () => {
    const reads = []; const h = harness({ onRead: message => reads.push(message.id) })
    let tree = h.render(); assert.deepEqual(reads, [])
    const listButton = find(tree, node => node.key === 'second'); listButton.props.onClick(); tree = h.render()
    assert.deepEqual(reads, ['second']); assert.equal(h.state[3], 'second')
    assert.ok(renderToStaticMarkup(tree).includes('Message body second'))
    assert.ok(!renderToStaticMarkup(tree).includes('PRIVATE'))
  })
  test('reply prepopulates recipient and subject, and retains authorized case context', () => {
    const incoming = message('case-message', 'admin', 'self', 'Review notes', '2026-11-01 07:06:58Z', true, 'case-123')
    const h = harness({ messages: [incoming] }, ['received', '', false, 'case-message', null])
    const reply = find(h.render(), node => node.props?.['aria-label'] === 'Reply')
    assert.ok(reply); reply.props.onClick()
    assert.deepEqual(h.state[4], { recipients: ['admin'], subject: 'Re: Review notes', body: '', caseId: 'case-123', replyTo: 'admin' })
    assert.equal(model.canMessageContact({ role: 'expert' }, false, true), false)
    assert.equal(model.canMessageContact({ role: 'expert' }, false, true, 'case-123'), true)
    assert.equal(model.canMessageContact(undefined, true, true), false)
  })
  test('recipient search retains selections, supports multiple recipients, and all includes authorized contacts outside search', () => {
    const contacts = [{id:'a',name:'Alice',role:'parent'},{id:'b',name:'Bob',role:'expert'},{id:'c',name:'Carol',role:'individual'}]
    const h = harness({contacts,isAdmin:true}, ['received','',false,'',{recipients:[],subject:'Hello',body:'Body',caseId:''}])
    let tree = h.render()
    find(tree,node=>node.type==='input' && node.props.type==='checkbox' && node.props.checked===false).props.onChange({target:{checked:true}})
    assert.deepEqual(h.state[4].recipients,['a','b','c'])
    find(h.render(),node=>node.props?.['aria-label']==='Search recipients').props.onChange({target:{value:'Alice'}})
    const html=renderToStaticMarkup(h.render()); assert.ok(html.includes('3 recipients selected')); assert.ok(html.includes('Send to all (3)'))
    find(h.render(),node=>node.props?.['aria-label']==='Remove Bob').props.onClick()
    assert.deepEqual(h.state[4].recipients,['a','c'])
    assert.equal(h.state[5],'Alice')
    const restricted=harness({contacts:[...contacts,{id:'admin',name:'Admin',role:'admin'}]}, ['received','',false,'',{recipients:[],subject:'',body:'',caseId:''}])
    const restrictedHtml=renderToStaticMarkup(restricted.render()); assert.ok(restrictedHtml.includes('Send to all (1)')); assert.ok(!restrictedHtml.includes('Alice'))
  })
  test('partial sends keep only failed recipients selected for retry', async () => {
    const h=harness({isAdmin:true,contacts:[{id:'a',name:'Alice',role:'parent'},{id:'b',name:'Bob',role:'parent'}],onSend:async()=>({sent:1,failedRecipients:['b']})},['received','',false,'',{recipients:['a','b'],subject:'Hello',body:'Keep body',caseId:''}])
    await find(h.render(),node=>node.type==='form').props.onSubmit({preventDefault(){}})
    assert.deepEqual(h.state[4].recipients,['b']);assert.equal(h.state[4].body,'Keep body')
    const attempts=[]
    const result=await model.deliverMessages(['a','b','a'],async id=>{attempts.push(id);if(id==='b')throw Error('denied');return {id:'record-'+id}})
    assert.deepEqual(attempts,['a','b']);assert.deepEqual(result.failedRecipients,['b']);assert.equal(result.records.length,1)
  })
  test('attachments can be selected, rejected safely, and removed before sending', () => {
    const h=harness({},['received','',false,'',{recipients:['admin'],subject:'Subject',body:'Body',caseId:''}])
    const file=new File(['report'],'report.txt',{type:'text/plain'})
    let input=find(h.render(),node=>node.props?.id==='message-attachments')
    input.props.onChange({target:{files:[file],value:'file'}})
    assert.equal(h.state[4].attachments[0],file)
    assert.ok(renderToStaticMarkup(h.render()).includes('report.txt'))
    input=find(h.render(),node=>node.props?.id==='message-attachments')
    input.props.onChange({target:{files:[new File(['bad'],'program.exe')],value:'file'}})
    assert.equal(h.state[4].attachments.length,1);assert.ok(h.state[6].includes('Unsupported file type'))
    find(h.render(),node=>node.props?.['aria-label']==='Remove attachment report.txt').props.onClick()
    assert.equal(h.state[4].attachments.length,0);assert.equal(h.state[6],'')
    assert.ok(model.messageAttachmentError(Array.from({length:6},()=>({name:'f.pdf',size:1})),'en'))
    assert.ok(model.messageAttachmentError([{name:'f.pdf',size:10485761}],'ar'))
    assert.equal(model.messageAttachmentError([{name:'f.PDF',size:10485760}],'en'),'')
  })
  test('each recipient gets an independent multipart request with the same files and case context', async () => {
    const file=new File(['report'],'report.txt',{type:'text/plain'})
    const draft={recipients:['a','b'],subject:' Subject ',body:' Body ',caseId:'case-123',attachments:[file]}
    const first=model.messageFormData('self','a',draft),second=model.messageFormData('self','b',draft)
    assert.notEqual(first,second);assert.equal(first.get('recipient'),'a');assert.equal(second.get('recipient'),'b')
    for(const data of [first,second]) { assert.equal(data.get('subject'),'Subject');assert.equal(data.get('read'),'false');assert.equal(data.get('case'),'case-123');assert.equal(data.getAll('attachments').length,1);assert.equal(await data.get('attachments').text(),'report') }
    const h=harness({onSend:async()=>({sent:1,failedRecipients:['b']})},['received','',false,'',draft])
    await find(h.render(),node=>node.type==='form').props.onSubmit({preventDefault(){}})
    assert.deepEqual(h.state[4].recipients,['b']);assert.equal(h.state[4].attachments[0],file)
  })
  test('message and recipient names follow interface language and search accepts both names', () => {
    const contacts=[{id:'admin',name:'اسم قديم',name_ar:'أحمد زوه',name_en:'Ahmed Zoh',role:'admin'}]
    for(const [lang,expected,hidden] of [['ar','أحمد زوه','Ahmed Zoh'],['en','Ahmed Zoh','أحمد زوه']]) {
      const h=harness({lang,contacts},['received','',false,'second',null])
      const html=renderToStaticMarkup(h.render());assert.ok(html.includes(expected));assert.ok(!html.includes(hidden))
      const draft=harness({lang,contacts},['received','',false,'',{recipients:['admin'],subject:'',body:'',caseId:''}])
      assert.ok(renderToStaticMarkup(draft.render()).includes(expected))
    }
    assert.equal(model.mailboxMessages(baseProps.messages,'self','received','Ahmed',false,contacts).length,2)
    assert.equal(model.mailboxMessages(baseProps.messages,'self','received','أحمد',false,contacts).length,2)
    const {personName}=load('lib/person-name.ts',{})
    assert.equal(personName({name:'Legacy'},'ar'),'Legacy');assert.equal(personName({name:'Legacy',name_en:' ',name_ar:'أحمد'},'en'),'Legacy');assert.equal(personName({name_en:'Ahmed'},'ar'),'Ahmed')
  })
  test('Arabic, empty, unread filter, and composer states remain usable', () => {
    assert.ok(renderToStaticMarkup(harness({ lang: 'ar', messages: [] }).render()).includes('الرسائل الواردة'))
    const h = harness(); let tree = h.render()
    find(tree, node => node.props?.['aria-label'] === 'Show unread only').props.onClick()
    assert.equal(h.state[2], true)
    tree = h.render(); find(tree, node => node.props?.['aria-label'] === 'New message').props.onClick()
    const html = renderToStaticMarkup(h.render()); assert.ok(html.includes('Message composer')); assert.ok(html.includes('message-subject')); assert.ok(html.includes('message-body'))
  })
}
module.exports = { harness, baseProps, model, renderToStaticMarkup }

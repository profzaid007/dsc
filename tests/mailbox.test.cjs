const fs = require('node:fs'), path = require('node:path'), ts = require('typescript')
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
const assert = require('node:assert/strict'), { test } = require('node:test')
const root = path.resolve(__dirname, '..')
function load(file, mocks) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
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
  contacts: [{ id: 'admin', name: 'Admin-Test', role: 'super_admin' }], userId: 'self', lang: 'en', isAdmin: false, canCreate: true, caseRoute: 'expert/cases', sending: false, actionError: '', notice: '', onRead() {}, onSend: async () => true, onClearNotice() {},
}
function harness(props = {}, initial = ['received', '', false, '', null]) {
  const state = [...initial]; let cursor = 0
  const native = tag => ({ children, variant, size, ...props }) => React.createElement(tag, props, children)
  const mocks = {
    react: { ...React, useRef: value => ({ current: value }), useEffect() {}, useState(value) { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next }] } },
    'next/link': { __esModule: true, default: native('a') },
    ...primitives,
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
    assert.deepEqual(h.state[4], { recipient: 'admin', subject: 'Re: Review notes', body: '', caseId: 'case-123' })
    assert.equal(model.canMessageContact({ role: 'expert' }, false, true), false)
    assert.equal(model.canMessageContact({ role: 'expert' }, false, true, 'case-123'), true)
    assert.equal(model.canMessageContact(undefined, true, true), false)
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

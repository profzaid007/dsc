const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function screen(canReadCases = true, failure = false) {
  const state = [], effects = [], calls = []
  let index = 0
  const jsx = (type, props) => ({ type, props })
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useState(initial) { const key = index++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value }] },
      useEffect(effect) { effects.push(effect) },
    },
    '@/lib/lang-context': { useLang: () => ({ lang: 'en' }) },
    '@/hooks/usePermissions': { usePermissions: () => ({ can: () => canReadCases }) },
    '@/components/smart-link': { SmartLink: 'Link' },
    '@/components/ui/button': { Button: 'Button' },
    '@/lib/pb': { __esModule: true, getErrorMessage: e => e.message, default: {
      filter: (query, params) => { calls.push({ query, params }); return 'scoped-filter' },
      collection: name => ({ getList: async (page, size, options) => {
        calls.push({ name, page, size, options })
        if (failure) throw Error('Access denied')
        return { totalPages: 2, items: [{ id: 'allocation', case_id: 'case-123', expand: { case_id: { name: 'Example Case' }, role_id: { role_name_en: 'Psychologist' } } }] }
      } }),
    } },
  }
  const exports = {}
  new Function('exports', 'require', ts.transpileModule(fs.readFileSync('components/dashboard/UserAssignmentLinks.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText)(exports, name => { assert.ok(name in mocks, name); return mocks[name] })
  return { calls, render() { index = 0; return exports.UserAssignmentLinks({ userId: 'expert-123' }) }, async load() { effects.shift()(); await new Promise(resolve => setImmediate(resolve)) } }
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)]
}
test('shows linked case and role, scopes query to selected expert, and paginates', async () => {
  const view = screen(); view.render(); await view.load(); const tree = view.render()
  const link = nodes(tree).find(n => n.type === 'Link')
  assert.equal(link.props.href, '/dashboard/admin/cases/case-123#case-allocations')
  assert.equal(link.props.children, 'Example Case')
  assert.match(JSON.stringify(tree), /Psychologist/)
  assert.deepEqual(view.calls[0].params, { id: 'expert-123' })
  nodes(tree).find(n => n.type === 'Button' && n.props.children === 'Next').props.onClick()
  view.render()
  // Run the newest effect after the simulated state change.
  await view.load(); await view.load()
  assert.ok(view.calls.some(call => call.page === 2 && call.size === 10))
})
test('does not link to case pages without Cases read access', async () => {
  const view = screen(false); view.render(); await view.load()
  assert.equal(nodes(view.render()).filter(n => n.type === 'Link').length, 0)
})
test('explains failure and offers retry instead of silently hiding allocations', async () => {
  const view = screen(true, true); view.render(); await view.load(); const tree = view.render()
  assert.match(JSON.stringify(tree), /Unable to load assignment details/)
  assert.ok(nodes(tree).some(n => n.type === 'Button' && n.props.children === 'Retry'))
})

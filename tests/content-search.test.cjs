const {test}=require('node:test')
const assert=require('node:assert/strict')
const ts=require('typescript')
const fs=require('node:fs')
const exported={}
new Function('exports',ts.transpileModule(fs.readFileSync('lib/content-search.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exported)
const {matchesContentSearch}=exported
test('search finds keyword-only Arabic and English matches and ignores blank queries',()=>{
 assert.equal(matchesContentSearch('أسرة','عنوان المقال','تواصل، أُسرة'),true)
 assert.equal(matchesContentSearch('RESEARCH','Training','research, learning'),true)
 assert.equal(matchesContentSearch('  ','Training',undefined),true)
 assert.equal(matchesContentSearch('medical','Training','research'),false)
 assert.equal(matchesContentSearch('تواصل','عنوان','تـواصل'),true)
})

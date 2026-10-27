const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs'),ts=require('typescript')
function load(loader){
 const out={};const jsx=(type,props)=>({type,props})
 const mocks={
 'react/jsx-runtime':{jsx,jsxs:jsx},
 '@/lib/classifications-data':{getClassificationDefinitions:async()=>[]},
 '@/components/landing/HeroSection':{HeroSection:'HeroSection'},
 '@/components/landing/PortalDiscovery':{PortalDiscovery:'PortalDiscovery'},
 '@/lib/team-experts':{getTeamExperts:loader},
 }
 new Function('exports','require',ts.transpileModule(fs.readFileSync('app/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(out,name=>{assert.ok(name in mocks,name);return mocks[name]})
 return out.default
}
test('catalog errors are explicit without preventing other homepage sections from rendering',async()=>{
 const page=await load(async()=>{throw Error('expert_roles_public missing on configured backend')})()
 const children=page.props.children
 assert.match(children.find(n=>n.type==='HeroSection').props.catalogError,/expert_roles_public/)
 assert.ok(children.some(n=>n.type==='PortalDiscovery'))
})
test('valid expert results render without a catalog warning',async()=>{
 const experts=[{id:'expert'}]
 const page=await load(async()=>experts)()
 const hero=page.props.children.find(n=>n.type==='HeroSection')
 assert.equal(hero.props.experts,experts);assert.equal(hero.props.catalogError,'')
})

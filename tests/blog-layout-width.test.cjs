const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
function loadPage(content){
 const exports={}
 const mocks={
  '@/lib/blog-content':{blogField:(p,f)=>p[f+'_en'],blogContentLang:()=> 'ar'},
  '@/lib/bounded-records':{boundedFullList:async()=>[]},
  'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
  'next/headers':{cookies:async()=>({get:()=>({value:'ar'})})},
  'next/navigation':{notFound:()=>{throw Error('Not found')}},
  '@/lib/pb':{default:{filter:()=>'',collection:()=>({getFirstListItem:async()=>({id:'post',title_en:'Article',content_en:content,category:'',is_published:true})})}},
  '@/lib/i18n':{t:(labels,lang)=>labels[lang]},
  '@/lib/format-date':{formatDate:()=> '2026-10-17'},
  '@/lib/cms-layout':{isCustomCmsLayout:html=>html.includes('<style>')},
  '@/components/cms/CmsContent':{CmsContent:()=>React.createElement('iframe',{'data-testid':'content'})},
  'suneditor/css/contents':{},
 }
 const code=ts.transpileModule(fs.readFileSync('app/blog/[slug]/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText
 new Function('exports','require',code)(exports,name=>name==='react/jsx-runtime'?require(name):mocks[name]??(()=>{throw Error(name)})())
 return exports.default
}
for(const [kind,content,constrained] of [['custom','<style>@media(max-width:900px){aside{display:none}}</style><aside>Contents</aside>',false],['ordinary','<p>Article</p>',true]]){
 test(kind+' blog content receives the correct available width',async()=>{
  const Page=loadPage(content)
  const tree=await Page({params:Promise.resolve({slug:'post'})})
  assert.equal(tree.props.className.includes('max-w-4xl'),constrained)
  const markup=renderToStaticMarkup(tree)
  assert.ok(markup.includes('data-testid="content"'))
  if(!constrained){
   assert.ok(tree.props.className.includes('w-full'))
   const children=React.Children.toArray(tree.props.children)
   assert.equal(children[1].type.name,'CmsContent')
   assert.equal(children[0].props.className.includes('max-w-7xl'),true)
  }
 })
}

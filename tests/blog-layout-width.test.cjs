const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
const blogContent={}
new Function('exports','require',ts.transpileModule(fs.readFileSync('lib/blog-content.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(blogContent,require)
function loadPage(content,record,lang='ar'){
 const exports={}
 const mocks={
  '@/lib/blog-content':blogContent,
  '@/lib/bounded-records':{boundedFullList:async()=>[]},
  'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
  'next/image':{default:props=>React.createElement('img',props)},
  'next/headers':{cookies:async()=>({get:()=>({value:lang})})},
  'next/navigation':{notFound:()=>{throw Error('Not found')}},
  '@/lib/pb':{default:{filter:()=>'',files:{getURL:(_,name)=>`https://files.example/${name}`},collection:()=>({getFirstListItem:async()=>record||({id:'post',title:'Article',content:content,category:'',is_published:true})})}},
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

test('published articles display their uploaded thumbnail',async()=>{
 const record={id:'post',slug:'post',title:'Article',content:'<p>Article</p>',category:'',is_published:true,thumbnail:['cover.png']}
 const Page=loadPage('',record,'en')
 const markup=renderToStaticMarkup(await Page({params:Promise.resolve({slug:'post'})}))
 assert.match(markup,/<img[^>]+src="https:\/\/files\.example\/cover\.png"/)
})

for(const lang of ['ar','en'])test('published legacy article renders its '+lang+' title and body without the missing-field server error',async()=>{
 const record={id:'legacy',slug:'legacy',title_ar:'مقال قديم',title_en:'Legacy article',content_ar:'<p>المحتوى الأصلي</p>',content_en:'<p>Original content</p>',category:'',is_published:true}
 const Page=loadPage('',record,lang)
 const tree=await Page({params:Promise.resolve({slug:'legacy'})})
 assert.ok(renderToStaticMarkup(tree).includes(record['title_'+lang]))
 assert.equal(React.Children.toArray(tree.props.children)[1].props.html,record['content_'+lang])
 assert.equal(record.title,undefined)
 assert.equal(record.content,undefined)
})
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

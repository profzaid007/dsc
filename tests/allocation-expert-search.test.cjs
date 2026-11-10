const fs = require('node:fs'), path = require('node:path'), ts = require('typescript'), React = require('react')
const {test} = require('node:test'), assert = require('node:assert/strict'), {renderToStaticMarkup} = require('react-dom/server')
function load(file) {
 const result = {}
 const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('exports','require',code)(result,name=>name==='@/components/ui/button'?{Button:({children,variant,size,...props})=>React.createElement('button',props,children)}:name.startsWith('@/')?load(name.slice(2)+'.ts'):name.startsWith('.')?load(path.resolve(path.dirname(file),name)+'.ts'):require(name))
 return result
}
const model=load('lib/allocation-expert-search.ts')
const users=[{id:'jordan',role:'expert',is_active:true,name:'Account',email:'expert@example.test'},{id:'saudi',role:'expert',is_active:true,name:'Saudi Expert',email:''},{id:'inactive',role:'expert',is_active:false,name:'Inactive',email:''},{id:'parent',role:'parent',is_active:true,name:'Parent',email:''}]
const profiles=[{id:'p1',user:'jordan',country_of_residence:'JO',city:'عَمَّان',specialist_roles:['orthopedic'],public_name_ar:'الخبير العربي',public_name_en:'English Expert',public_specialty_ar:'تأهيل',public_specialty_en:'Rehabilitation',specialization_type:'consultation'},{id:'p2',user:'saudi',country_of_residence:'SA',city:'Riyadh',specialist_roles:['teacher']}]
const roles=[{id:'orthopedic',role_name_en:'Orthopedic Specialist',role_name_ar:'طبيب العظام'},{id:'teacher',role_name_en:'Teacher',role_name_ar:'معلم'}]
const filters=(country='',city='',specialty='')=>({country,city,specialty})
test('country/city/current specialist roles and public specialties filter immediately with combined fields and bilingual text',()=>{
 const experts=model.allocationExpertDirectory(users,profiles,roles,'ar')
 assert.equal(experts.length,2)
 assert.equal(experts[0].name,'الخبير العربي')
 for(const query of [filters(' الاردن '),filters('Jordan'),filters('JO'),filters('','عمان'),filters('','','العظام'),filters('','','Orthopedic'),filters('','','Rehabilitation'),filters('','','استشارات'),filters('الاردن','عمان','طبيب')]) assert.deepEqual(model.filterAllocationExperts(experts,query).map(e=>e.id),['jordan'],JSON.stringify(query))
 assert.equal(model.filterAllocationExperts(experts,filters('Saudi','عمان')).length,0)
 assert.equal(model.filterAllocationExperts(experts,filters('no-match')).length,0)
 assert.equal(model.filterAllocationExperts(experts,filters('   ')).length,2)
 for (const name of ['العربي', ' ENGLISH ', 'account'])
  assert.deepEqual(model.filterAllocationExperts(experts, {...filters(), name}).map(e => e.id), ['jordan'])
 assert.equal(model.filterAllocationExperts(experts, {...filters('Saudi'), name: 'English'}).length, 0)
 assert.equal(model.allocationExpertDirectory(users,profiles,roles,'en')[0].name,'English Expert')
})
test('visible search results show count, context and selection action; distinguish no matches, loading and errors',()=>{
 const {ExpertSearchResults}=load('components/cases/ExpertSearchResults.tsx')
 const experts=model.allocationExpertDirectory(users,profiles,roles,'ar'),selected=[]
 const props={experts,lang:'ar',loading:false,error:'',selectedIds:[],disabled:false,onSelect:id=>selected.push(id),onClear(){}}
 const tree=ExpertSearchResults(props),html=renderToStaticMarkup(tree)
 assert.ok(html.includes('الخبراء المطابقون: 2'));assert.ok(html.includes('الخبير العربي'));assert.ok(html.includes('تأهيل'))
 function find(node){if(!node||typeof node!=='object')return; if(node.props?.onClick&&node.props.children==='اختيار الخبير')return node;for(const item of [node.props?.children].flat(Infinity)){const found=find(item);if(found)return found}}
 find(tree).props.onClick();assert.deepEqual(selected,['jordan'])
 assert.ok(renderToStaticMarkup(ExpertSearchResults({...props,experts:[]})).includes('لا يوجد خبراء يطابقون'))
 assert.ok(renderToStaticMarkup(ExpertSearchResults({...props,loading:true})).includes('جارٍ تحميل الخبراء'))
 assert.ok(renderToStaticMarkup(ExpertSearchResults({...props,error:'Load failed'})).includes('role="alert"'))
 assert.equal(find(ExpertSearchResults({...props,selectedIds:['jordan','saudi']})),undefined)
})

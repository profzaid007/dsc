const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const React=require('react')
const {renderToStaticMarkup}=require('react-dom/server')
function load(file, context){
 const exports={}
 const Link=({children,href,...props})=>React.createElement('a',{...props,href},children)
 const mocks={
  'next/navigation':{usePathname:()=>context.path,useRouter:()=>({push(){}})},
  'next/link':{__esModule:true,default:Link},
  'next/image':{__esModule:true,default:()=>null},
  '@/hooks/useUiTranslation':{useUiTranslation:()=>x=>x},
  '@/lib/lang-context':{useLang:()=>({lang:'ar',toggleLang(){}})},
  '@/hooks/useAuth':{useAuth:()=>({isAuthenticated:true,isAdmin:true,currentUser:{name:'Admin',role:'admin'},logout(){}})},
  '@/hooks/usePermissions':{usePermissions:()=>({isSuperAdmin:context.super,can:()=>context.cms})},
  '@/hooks/usePortals':{usePortals:()=>({portals:[]})},
  '@/hooks/useUnreadMessages':{useUnreadMessages:()=>0},
  '@/lib/i18n':{t:(x,lang)=>x[lang]},
  '@/lib/site-content':{SITE_CONTENT:{nav:{bookConsultation:{ar:'حجز',en:'Book'}}}},
  '../BookConsultDialog':{BookConsultDialog:()=>null},
  '@/components/ui/button':{Button:({children,...props})=>React.createElement('button',props,children)},
  '@/components/smart-link':{SmartLink:Link},
  '@/lib/utils':{cn:(...args)=>args.filter(x=>typeof x==='string').join(' ')},
  '@/lib/security':{routePermission:()=>null},
  './SecuritySidebar':{SecuritySidebar:()=>React.createElement('div',null,'Security sections')},
 }
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('exports','require',code)(exports,name=>mocks[name]||require(name))
 return exports
}
test('admin header exposes management and logout actions with their access restrictions',()=>{
 for(const superAdmin of [false,true]){
  const {Navbar}=load('components/layout/Navbar.tsx',{path:'/dashboard/admin',super:superAdmin,cms:true})
  const html=renderToStaticMarkup(React.createElement(Navbar))
  assert.equal(html.includes('إدارة الأمان'),superAdmin)
  assert.ok(html.includes('إدارة المحتوى'))
  assert.ok(html.includes('تسجيل الخروج'))
 }
 const {Navbar}=load('components/layout/Navbar.tsx',{path:'/cms/blog',super:false,cms:false})
 assert.equal(renderToStaticMarkup(React.createElement(Navbar)).includes('إدارة المحتوى'),false)
})
test('dashboard sidebar removes management entry points and logout and switches to security sections',()=>{
 const context={path:'/dashboard/admin',super:true,cms:true}
 const {DashboardSidebar}=load('components/dashboard/Sidebar.tsx',context)
 let html=renderToStaticMarkup(React.createElement(DashboardSidebar))
 assert.equal(html.includes('إدارة الأمان'),false)
 assert.equal(html.includes('إدارة المحتوى'),false)
 assert.equal(html.includes('تسجيل الخروج'),false)
 context.path='/dashboard/admin/security'
 html=renderToStaticMarkup(React.createElement(DashboardSidebar))
 assert.ok(html.includes('Security sections'))
})

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
  react: context.mobileOpen ? { ...React, useState: initial => [initial === null ? context.path : typeof initial === 'function' ? initial() : initial, () => {}] } : React,
  'next/navigation':{usePathname:()=>context.path,useRouter:()=>({push(){}})},
  'next/link':{__esModule:true,default:Link},
  'next/image':{__esModule:true,default:()=>null},
  '@/hooks/useUiTranslation':{useUiTranslation:()=>x=>x},
  '@/lib/lang-context':{useLang:()=>({lang:context.lang || 'ar',toggleLang(){}})},
  '@/hooks/useAuth':{useAuth:()=>({isAuthenticated:context.auth !== false,isAdmin:context.admin !== false,currentUser:{id:'test-user',name:'Admin',role:context.role || 'admin'},logout(){}})},
  '@/hooks/usePermissions':{usePermissions:()=>({isSuperAdmin:context.super,can:()=>context.cms})},
  '@/hooks/usePortals':{usePortals:()=>({portals:[]})},
  '@/hooks/useUserDisplayName':{useUserDisplayName:user=>user?.name || ''},
  '@/hooks/useUnreadMessages':{useUnreadMessages:(_id,enabled)=>enabled ? context.unread || 0 : 0},
  '@/lib/i18n':{t:(x,lang)=>x[lang]},
  '@/lib/site-content':{SITE_CONTENT:{nav:{bookConsultation:{ar:'حجز',en:'Book'}}}},
  '../BookConsultDialog':{BookConsultDialog:()=>null},
  './AdminNotifications':{AdminNotifications:()=>React.createElement('button',{'data-notifications':'admin'},'Admin notifications')},
  './ClientAssignmentNotifications':{ClientAssignmentNotifications:()=>React.createElement('button',{'data-notifications':'client'},'Assignment notifications')},
  '@/lib/client-services':{isClientRole:role=>['parent','individual','organization','care_foundation'].includes(role)},
  '@/components/ui/button':{Button:({children,...props})=>React.createElement('button',props,children)},
  '@/components/smart-link':{SmartLink:Link},
  '@/lib/utils':{cn:(...args)=>args.filter(x=>typeof x==='string').join(' ')},
  '@/lib/security':{routePermission:()=>context.required || null},
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
test('dashboard sidebar retains the security shortcut, omits CMS and logout, and switches to security sections',()=>{
 const context={path:'/dashboard/admin',super:true,cms:true}
 const {DashboardSidebar}=load('components/dashboard/Sidebar.tsx',context)
 let html=renderToStaticMarkup(React.createElement(DashboardSidebar))
 assert.equal(html.includes('إدارة الأمان'),true)
 assert.equal(html.includes('إدارة المحتوى'),false)
 assert.equal(html.includes('تسجيل الخروج'),false)
 context.path='/dashboard/admin/security'
 html=renderToStaticMarkup(React.createElement(DashboardSidebar))
 assert.ok(html.includes('Security sections'))
})


test('logged-in main navigation replaces public links and retains Home',()=>{
 const {Navbar}=load('components/layout/Navbar.tsx',{path:'/about-us',super:true,cms:true})
 const html=renderToStaticMarkup(React.createElement(Navbar))
 assert.ok(html.includes('الرئيسية'))
 for(const label of ['من نحن','المدونة','الفعاليات','اتصل بنا','إنشاء حساب']) assert.equal(html.includes(label),false)
 const nav=html.match(/<nav[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/)[1]
 for(const label of ['لوحة التحكم','إدارة الأمان','إدارة المحتوى','تسجيل الخروج']) assert.ok(nav.includes(label))
 assert.equal((html.match(/href="\/dashboard"/g)||[]).length,1)
})

test('guests see public navigation without account management actions',()=>{
 const {Navbar}=load('components/layout/Navbar.tsx',{path:'/about-us',auth:false,admin:false,super:false,cms:false})
 const html=renderToStaticMarkup(React.createElement(Navbar))
 for(const label of ['الرئيسية','من نحن','المدونة','اتصل بنا','إنشاء حساب']) assert.ok(html.includes(label))
 for(const label of ['لوحة التحكم','إدارة الأمان','إدارة المحتوى','تسجيل الخروج']) assert.equal(html.includes(label),false)
})


test('login page retains all public navigation links',()=>{
 const {Navbar}=load('components/layout/Navbar.tsx',{path:'/login',auth:false,admin:false,super:false,cms:false})
 const html=renderToStaticMarkup(React.createElement(Navbar))
 for(const label of ['الرئيسية','من نحن','المدونة','الفعاليات','اتصل بنا']) assert.ok(html.includes(label))
})


test('header message shortcut supports every account type, respects admin access, and announces unread counts',()=>{
 for(const lang of ['ar','en']) {
  for(const role of ['expert','parent','individual','organization','care_foundation','admin','super_admin']) {
   const {Navbar}=load('components/layout/Navbar.tsx',{path:'/dashboard/messages',role,admin:['admin','super_admin'].includes(role),cms:true,lang,unread:3})
   const html=renderToStaticMarkup(React.createElement(Navbar))
   assert.ok(html.includes('href="/dashboard/messages"'))
   assert.ok(html.includes(lang==='ar' ? 'الرسائل، 3 غير مقروءة' : 'Messages, 3 unread'))
   assert.ok(html.includes('aria-current="page"'))
   assert.equal(html.includes('data-notifications="admin"'),['admin','super_admin'].includes(role))
   assert.equal(html.includes('data-notifications="client"'),['parent','individual','organization','care_foundation'].includes(role))
  }
 }
 for(const context of [{auth:false},{admin:true,cms:false}]) {
  const {Navbar}=load('components/layout/Navbar.tsx',{path:'/',...context})
  assert.equal(renderToStaticMarkup(React.createElement(Navbar)).includes('href="/dashboard/messages"'),false)
 }
})


test('expert navigation shows only allocated cases even with case-management grants, on desktop and mobile',()=>{
 for(const mobileOpen of [false,true]) for(const lang of ['ar','en']) {
  const context={path:'/dashboard/expert/cases',role:'expert',admin:false,super:false,cms:true,required:'cases.read',mobileOpen,lang}
  const {DashboardSidebar}=load('components/dashboard/Sidebar.tsx',context)
  const html=renderToStaticMarkup(React.createElement(DashboardSidebar))
  assert.equal(html.includes('href="/dashboard/admin/cases"'),false)
  assert.ok(html.includes('href="/dashboard/expert/cases"'))
  assert.ok(html.includes(lang==='ar'?'الحالات المخصصة لي':'My allocated cases'))
 }
})
test('direct administrative case routes deny experts while preserving authorized delegates and expert task routes',()=>{
 for(const path of ['/dashboard/admin/cases','/dashboard/admin/cases/new','/dashboard/admin/cases/example']) {
  const {AdminProtectedRoute}=load('components/dashboard/AdminProtectedRoute.tsx',{path,role:'expert',admin:false,cms:true,required:'cases.read'})
  assert.equal(renderToStaticMarkup(React.createElement(AdminProtectedRoute,null,'PRIVATE CASE MANAGEMENT')).includes('PRIVATE CASE MANAGEMENT'),false)
 }
 for(const role of ['admin','parent']) {
  const {AdminProtectedRoute}=load('components/dashboard/AdminProtectedRoute.tsx',{path:'/dashboard/admin/cases',role,admin:role==='admin',cms:true,required:'cases.read'})
  assert.ok(renderToStaticMarkup(React.createElement(AdminProtectedRoute,null,'AUTHORIZED DELEGATE')).includes('AUTHORIZED DELEGATE'))
 }
 const {AdminProtectedRoute}=load('components/dashboard/AdminProtectedRoute.tsx',{path:'/dashboard/admin/assignments/task',role:'expert',admin:false,cms:false})
 assert.ok(renderToStaticMarkup(React.createElement(AdminProtectedRoute,null,'EXPERT TASK')).includes('EXPERT TASK'))
})

test('client navigation exposes working shared services with role-correct case and project routes on desktop and mobile',()=>{
 for(const[role,home,segment]of[['parent','parent','cases'],['care_foundation','parent','cases'],['individual','individual','cases'],['organization','institution','projects']])for(const mobileOpen of [false,true])for(const lang of ['ar','en']){
  const{DashboardSidebar}=load('components/dashboard/Sidebar.tsx',{path:`/dashboard/${home}`,role,admin:false,super:false,cms:false,mobileOpen,lang,unread:2})
  const html=renderToStaticMarkup(React.createElement(DashboardSidebar))
  for(const href of ['/dashboard/messages','/dashboard/assessments',`/dashboard/${home}/${segment}`,`/dashboard/${home}/appointments`,`/dashboard/${home}/reports`,`/dashboard/${home}/documents`])assert.ok(html.includes(`href="${href}"`),`${role}/${lang}/${mobileOpen}: ${href}`)
  for(const href of ['/dashboard/expert/cases','/dashboard/admin/cases','/dashboard/institution/quotations',`/dashboard/${home}/services`])assert.ok(!html.includes(`href="${href}"`),`${role}: ${href}`)
  assert.ok(html.includes(lang==='ar'?'2 رسائل غير مقروءة':'2 unread messages'))
 }
})

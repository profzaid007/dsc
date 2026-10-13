"use client"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { useSpecialists } from "@/hooks/useSpecialists"
import pb, { getErrorMessage } from "@/lib/pb"
import type { SpecialistCategory, SpecialistRole } from "@/lib/specialist-types"
export default function SpecialistsSettings() {
 const {isAdmin,isSuperAdmin,isLoading}=useAuth();const {lang}=useLang();const ar=lang==="ar"
 const {categories,roles,loading,error,refresh}=useSpecialists()
 const [kind,setKind]=useState<"category"|"role">("category")
 const [id,setId]=useState("");const [en,setEn]=useState("");const [arabic,setArabic]=useState("");const [category,setCategory]=useState("")
 const [saving,setSaving]=useState(false);const [notice,setNotice]=useState("")
 const reset=()=>{setId("");setEn("");setArabic("");setCategory("")}
 if(isLoading)return <p>Loading...</p>
 if(!isAdmin&&!isSuperAdmin)return <p role="alert">{ar?"غير مصرح":"Access denied"}</p>
 const edit=(k:"category"|"role",r:SpecialistCategory|SpecialistRole)=>{setKind(k);setId(r.id);setEn("name_en" in r?r.name_en:r.role_name_en);setArabic("name_ar" in r?r.name_ar:r.role_name_ar);setCategory("category" in r?r.category:"");setNotice("")}
 async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setNotice("")
  try {
   const col=pb.collection(kind==="category"?"specialist_role_categories":"roles_management")
   const data=kind==="category"?{name_en:en.trim(),name_ar:arabic.trim(),...(id?{}:{key:`custom-${crypto.randomUUID()}`,order:categories.length,is_active:true})}:{role_name_en:en.trim(),role_name_ar:arabic.trim(),category,...(id?{}:{order:roles.length+1,is_active:true})}
   if(id)await col.update(id,data);else await col.create(data)
   reset();await refresh();setNotice(ar?"تم الحفظ":"Saved")
  }catch(e){setNotice(getErrorMessage(e))}finally{setSaving(false)}
 }
 async function remove(k:"category"|"role",rid:string){
  if(!window.confirm(ar?"هل تريد تغيير حالة التفعيل؟":"Change availability for new selections?"))return
  setSaving(true);setNotice("")
  try {
   const item=(k==="category"?categories:roles).find(x=>x.id===rid);
   await pb.collection(k==="category"?"specialist_role_categories":"roles_management").update(rid,{is_active:!item?.is_active});reset();await refresh()
  }catch(e){setNotice(getErrorMessage(e))}finally{setSaving(false)}
 }
 return <div className="space-y-6" dir={ar?"rtl":"ltr"}>
  <h1 className="text-2xl font-bold">{ar?"فئات وأدوار التخصص":"Specialist categories and roles"}</h1>
  {(error||notice)&&<p role="status">{error||notice}</p>}
  {error&&<button onClick={()=>void refresh()}>{ar?"إعادة المحاولة":"Retry"}</button>}
  <form onSubmit={save} className="grid gap-3 rounded border p-4 sm:grid-cols-2">
   <label>{ar?"الجدول":"Table"}<select disabled={saving} value={kind} onChange={e=>{reset();setKind(e.target.value as "category"|"role")}} className="block w-full rounded border p-2"><option value="category">{ar?"الفئات":"Categories"}</option><option value="role">{ar?"الأدوار":"Roles"}</option></select></label>
   {kind==="role"&&<label>{ar?"الفئة":"Category"}<select required value={category} disabled={saving} onChange={e=>setCategory(e.target.value)} className="block w-full rounded border p-2"><option value="">{ar?"اختر فئة":"Select category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{ar?c.name_ar:c.name_en}</option>)}</select></label>}
   <label>Name (English)<input dir="ltr" required value={en} disabled={saving} onChange={e=>setEn(e.target.value)} className="block w-full rounded border p-2"/></label>
   <label>الاسم (العربية)<input dir="rtl" required value={arabic} disabled={saving} onChange={e=>setArabic(e.target.value)} className="block w-full rounded border p-2"/></label>
   <button disabled={saving||loading||!!error} className="rounded bg-primary p-2 text-white">{id?(ar?"حفظ التعديل":"Save changes"):(ar?"إضافة":"Add")}</button><button type="button" onClick={reset}>{ar?"إلغاء":"Cancel"}</button>
  </form>
  <h2 className="text-xl font-bold">{ar?"فئات التخصص":"Specialist role categories"}</h2>
  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr><th>English</th><th>العربية</th><th>{ar?"إجراءات":"Actions"}</th></tr></thead><tbody>{categories.map(c=><tr key={c.id} className="border-b"><td className="p-2">{c.name_en}</td><td className="p-2">{c.name_ar}</td><td><button disabled={saving} onClick={()=>edit("category",c)}>{ar?"تعديل":"Edit"}</button> · <button disabled={saving} onClick={()=>void remove("category",c.id)}>{c.is_active?(ar?"تعطيل":"Deactivate"):(ar?"تفعيل":"Activate")}</button></td></tr>)}</tbody></table></div>
  <h2 className="text-xl font-bold">{ar?"أدوار التخصص":"Specialist roles"}</h2>
  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr><th>{ar?"الفئة":"Category"}</th><th>English</th><th>العربية</th><th>{ar?"إجراءات":"Actions"}</th></tr></thead><tbody>{roles.map(r=><tr key={r.id} className="border-b"><td className="p-2">{categories.find(c=>c.id===r.category)?.[ar?"name_ar":"name_en"]||"—"}</td><td className="p-2">{r.role_name_en}</td><td className="p-2">{r.role_name_ar}</td><td><button disabled={saving} onClick={()=>edit("role",r)}>{ar?"تعديل":"Edit"}</button> · <button disabled={saving} onClick={()=>void remove("role",r.id)}>{r.is_active?(ar?"تعطيل":"Deactivate"):(ar?"تفعيل":"Activate")}</button></td></tr>)}</tbody></table></div>
 </div>
}

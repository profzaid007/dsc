"use client"
import { useState } from "react"
import { useLang } from "@/lib/lang-context"
import { useSpecialists } from "@/hooks/useSpecialists"
export function SpecialistSelector({value,onChange,disabled=false}:{value:string[];onChange:(ids:string[])=>void;disabled?:boolean}) {
 const {lang}=useLang();const ar=lang==="ar"
 const {categories,roles,loading,error,refresh}=useSpecialists()
 const [selectedCategories,setSelectedCategories]=useState<string[]>([])
 const [search,setSearch]=useState("")
 const categoryIds=Array.from(new Set([...selectedCategories,...roles.filter(r=>value.includes(r.id)).map(r=>r.category)]))
 const toggle=(id:string)=>onChange(value.includes(id)?value.filter(x=>x!==id):[...value,id])
 if(loading)return <p role="status">{ar?"جارٍ تحميل التخصصات...":"Loading specialist roles..."}</p>
 if(error)return <div role="alert"><p>{error}</p><button type="button" onClick={()=>void refresh()}>{ar?"إعادة المحاولة":"Retry"}</button></div>
 return <div className="space-y-3" dir={ar?"rtl":"ltr"}>
  <fieldset disabled={disabled} className="space-y-2 rounded-md border p-3"><legend className="px-1 font-medium">{ar?"١. فئات التخصص":"1. Specialist categories"}</legend>
   {categories.filter(c=>c.is_active || categoryIds.includes(c.id)).map(c=><label key={c.id} className="flex items-center gap-2"><input type="checkbox" checked={categoryIds.includes(c.id)} onChange={()=>{
    if(categoryIds.includes(c.id)){setSelectedCategories(selectedCategories.filter(x=>x!==c.id));onChange(value.filter(id=>roles.find(r=>r.id===id)?.category!==c.id))}
    else setSelectedCategories([...selectedCategories,c.id])
   }}/>{ar?c.name_ar:c.name_en}</label>)}
  </fieldset>
  <fieldset disabled={disabled} className="space-y-2 rounded-md border p-3"><legend className="px-1 font-medium">{ar?"٢. أدوار التخصص (اختيار متعدد)":"2. Specialist roles (multiple selection)"}</legend>
   <input aria-label={ar?"البحث في الأدوار":"Search roles"} placeholder={ar?"البحث في الأدوار...":"Search roles..."} value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded border p-2"/>
   <div className="max-h-64 space-y-2 overflow-y-auto">{roles.filter(r=>((r.is_active && categoryIds.includes(r.category))||value.includes(r.id))&&`${r.role_name_en} ${r.role_name_ar}`.toLowerCase().includes(search.toLowerCase())).map(r=><label key={r.id} className="flex items-center gap-2"><input type="checkbox" checked={value.includes(r.id)} onChange={()=>toggle(r.id)}/>{ar?r.role_name_ar:r.role_name_en}</label>)}</div>
   {!categoryIds.length&&<p>{ar?"اختر فئة أولاً":"Choose a category first."}</p>}
  </fieldset>
 </div>
}

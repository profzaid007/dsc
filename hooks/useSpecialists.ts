"use client"
import { useCallback, useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import type { SpecialistCategory, SpecialistRole } from "@/lib/specialist-types"
export function useSpecialists() {
 const [categories,setCategories]=useState<SpecialistCategory[]>([])
 const [roles,setRoles]=useState<SpecialistRole[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState("")
 const refresh=useCallback(async()=>{
  setLoading(true);setError("")
  try {
   const [c,r]=await Promise.all([
    pb.collection("specialist_role_categories").getFullList<SpecialistCategory>({sort:"order,name_en",requestKey:null}),
    pb.collection("roles_management").getFullList<SpecialistRole>({sort:"order,role_name_en",requestKey:null})])
   setCategories(c);setRoles(r)
  } catch(e){setError(getErrorMessage(e))} finally {setLoading(false)}
 },[])
 useEffect(()=>{void refresh()},[refresh])
 return {categories,roles,loading,error,refresh}
}

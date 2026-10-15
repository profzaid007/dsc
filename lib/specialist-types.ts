export interface SpecialistCategory { id: string; is_active?: boolean; key: string; name_en: string; name_ar: string; order: number }
export interface SpecialistRole { id: string; is_active?: boolean; role_name_en: string; role_name_ar: string; category: string; order: number; tool_types: string[] }

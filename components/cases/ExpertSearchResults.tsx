import { Button } from "@/components/ui/button"
import type { AllocationExpertChoice } from "@/lib/allocation-expert-search"

export function ExpertSearchResults({ experts, lang, loading, error, selectedIds, disabled, onSelect, onClear }: {
  experts: AllocationExpertChoice[]; lang: "ar" | "en"; loading: boolean; error: string; selectedIds: string[]; disabled: boolean;
  onSelect: (id: string) => void; onClear: () => void;
}) {
  const ar = lang === "ar"
  return <section aria-label={ar ? "نتائج البحث عن الخبراء" : "Expert search results"} className="space-y-3 rounded-xl border bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="font-semibold">{loading ? (ar ? "جارٍ البحث عن الخبراء…" : "Loading experts…") : error ? (ar ? "تعذر تحميل الخبراء" : "Could not load experts") : (ar ? `الخبراء المطابقون: ${experts.length}` : `Matching experts: ${experts.length}`)}</p><Button variant="ghost" size="sm" onClick={onClear}>{ar ? "مسح البحث" : "Clear search"}</Button></div>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : !loading && (!experts.length ? <p className="text-sm text-muted-foreground">{ar ? "لا يوجد خبراء يطابقون جميع شروط البحث. جرّب تعديل البلد أو المدينة أو التخصص." : "No experts match all search fields. Try changing the country, city or specialization."}</p> : <div className="grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2">{experts.map(expert => <article key={expert.id} className="flex items-start justify-between gap-3 rounded-lg border p-3"><div className="min-w-0 space-y-1"><h4 dir="auto" className="break-words font-semibold">{expert.name}</h4><p dir="auto" className="text-sm text-muted-foreground">{[expert.country, expert.city].filter(Boolean).join("، ")}</p><p dir="auto" className="break-words text-sm">{expert.specialty}</p></div><Button variant="outline" size="sm" disabled={disabled || selectedIds.includes(expert.id)} onClick={() => onSelect(expert.id)}>{selectedIds.includes(expert.id) ? (ar ? "محدد" : "Selected") : (ar ? "اختيار الخبير" : "Select expert")}</Button></article>)}</div>)}
    <p className="text-xs text-muted-foreground">{ar ? "اختيار الخبير يضيفه إلى النموذج فقط. حدد الدور ثم احفظ التخصيصات لتأكيد الإضافة." : "Selecting an expert only adds them to the form. Choose a role and save allocations to confirm."}</p>
  </section>
}

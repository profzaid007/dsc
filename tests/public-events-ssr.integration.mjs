import assert from "node:assert/strict"
const base=process.env.SSR_BASE_URL||"http://localhost:3000"
const clean=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
async function read(path){const r=await fetch(base+path,{signal:AbortSignal.timeout(45000)});assert.equal(r.status,200,path);const html=clean(await r.text());assert.doesNotMatch(html,/Loading events…|Loading\.\.\.|جاري التحميل|جارٍ تحميل الفعاليات/);assert.match(html,/<h1\b/);return html}
for(const lang of ['ar','en']){
 const events=await read(`/${lang}/programmes`)
 const lectures=await read(`/${lang}/programmes/public_lectures`)
 const programs=await read(`/${lang}/programmes/training_programmes`)
 const lecture=lectures.match(/href="(?:\/(?:ar|en))?(\/programmes\/public_lectures\/[^"/?]+)"/)?.[1]
 const program=programs.match(/href="(?:\/(?:ar|en))?(\/programmes\/training_programmes\/[^"/?]+)"/)?.[1]
 if (!lecture) assert.match(lectures, /No lectures found|لا توجد محاضرات/)
 if (!program) assert.match(programs, /No training programmes found|لا توجد برامج تدريبية/)
 for(const path of [lecture,program].filter(Boolean)){
  const detail=await read(`/${lang}${path}`)
  const listHtml=path===lecture?lectures:programs
  const cardTitle=listHtml.match(/<h3[^>]*>(.*?)<\/h3>/s)?.[1]?.replace(/<[^>]+>/g,'').trim()
  assert.ok(cardTitle && detail.includes(cardTitle),'Detail title must match the server-rendered card')
  const headings=[...detail.matchAll(/<h[123][^>]*>(.*?)<\/h[123]>/gs)].map(match=>match[1].replace(/<[^>]+>/g,'').trim())
  assert.ok(headings.some(heading=>heading.length>5))
  if(path===program)assert.doesNotMatch(detail,/Checking\.\.\.|جاري التحقق/)
 }
 assert.match(events,/href="[^" ]*\/programmes\/(public_lectures|training_programmes)\/[^"/]+"/)
 console.log(`PASS ${lang}: event lists and ${[lecture,program].filter(Boolean).length} detail fixtures include content without JavaScript`)
}
for(const type of ['public_lectures','training_programmes']){
 const r=await fetch(`${base}/en/programmes/${type}/zzzzzzzzzzzzzzz`);assert.equal(r.status,404,type+' missing detail')
}

const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs'),vm=require('node:vm')
const exportsObject={}
vm.runInNewContext(fs.readFileSync('pb_hooks/lib/assessment-engine.js','utf8'),{exports:exportsObject})
const {calculate,formula,validateDefinition}=exportsObject
const make=()=>({name:'Example',code:'EXAMPLE',version:'1',description:'',audience:'',instructions:'',language:'ar',duration:10,type:'general',direction:'higher_problem',missingPolicy:'reject',minAnswered:2,dimensions:[{id:'A',name:'A',includeInTotal:true,rule:{method:'mean'}}],answerSets:[{id:'standard',name:'Options',options:[{id:'a',label:'Low',score:1},{id:'b',label:'Medium',score:3},{id:'c',label:'High',score:5}]}],questions:[{id:'q1',order:1,text:'One',dimensions:[{id:'A',weight:2}],weight:1,reverse:false,critical:true,answerSet:'standard'},{id:'q2',order:2,text:'Two',dimensions:[{id:'A',weight:1}],weight:3,reverse:true,critical:false,answerSet:'standard'}],totalRule:{method:'sum'},indicators:[],bands:[],alerts:[]})
test('reverse uses min+max and weighted dimension links are independent of the overall score',()=>{
 const d=make();d.dimensions[0].rule.method='weighted_mean'
 const r=calculate(d,{q1:'b',q2:'a'})
 assert.equal(r.scores[0].value,8)
 assert.equal(r.scores[1].value,4.2)
 assert.equal(r.steps[1].adjusted,5)
 assert.equal(r.complete,true)
})
test('percentage uses actual lower bound; count and constrained formulas support indices',()=>{
 const d=make();d.totalRule.method='percentage';d.indicators=[{id:'PST',name:'PST',rule:{method:'count',operator:'gt',threshold:0}},{id:'PSDI',name:'PSDI',rule:{method:'formula',formula:'SUM / PST'}}]
 const r=calculate(d,{q1:'a',q2:'c'})
 assert.equal(r.scores[0].value,0)
 assert.equal(r.scores[2].value,2)
 assert.equal(r.scores[3].value,1)
})
test('missing answer policies mark incomplete, omit, or explicitly impute zero',()=>{
 const d=make();let r=calculate(d,{q1:'b'});assert.equal(r.complete,false);assert.equal(r.scores[0].value,null)
 d.missingPolicy='omit';d.minAnswered=1;r=calculate(d,{q1:'b'});assert.equal(r.complete,true);assert.equal(r.scores[1].value,3)
 d.missingPolicy='zero';r=calculate(d,{q1:'b'});assert.equal(r.scores[1].value,1.5);assert.equal(r.steps[1].adjusted,0)
})
test('dimension exclusions do not duplicate shared questions in total',()=>{
 const d=make();d.dimensions.push({id:'B',name:'B',includeInTotal:false,rule:{method:'sum'}});d.questions[0].dimensions.push({id:'B',weight:1});d.questions[1].dimensions=[{id:'B',weight:1}]
 assert.equal(calculate(d,{q1:'b',q2:'a'}).scores[0].value,3)
})
test('population matched norms and bands; critical alerts use adjusted scores',()=>{
 const d=make();d.totalRule={method:'standard',normTable:[{min:0,max:20,score:50,population:{minAge:18,maxAge:40,sex:'female'}}]};d.bands=[{id:'b1',target:'overall',min:40,max:60,label:'Reference',recommendation:'Review',population:{language:'ar'}}];d.alerts=[{id:'a1',target:'question:q2',operator:'gte',threshold:4,message:'Review item'}]
 let r=calculate(d,{q1:'b',q2:'a'},{age:25,sex:'female',language:'ar'});assert.equal(r.scores[0].value,50);assert.equal(r.scores[0].interpretation,'Reference');assert.equal(r.alerts.length,1)
 r=calculate(d,{q1:'b',q2:'a'},{age:10});assert.equal(r.scores[0].value,null);assert.equal(r.complete,false)
})
test('formula rejects injection, unknown variables, zero division, cycles and bad definitions',()=>{
 for(const s of ['globalThis.process.exit()','constructor.constructor(1)','1;alert(1)','1/0','UNKNOWN+1'])assert.throws(()=>formula(s,{}))
 assert.equal(formula('max(abs(-4), sqrt(9)) + round(1.2)',{}),5)
 const d=make();d.indicators=[{id:'X',name:'X',rule:{method:'formula',formula:'Y+1'}},{id:'Y',name:'Y',rule:{method:'formula',formula:'X+1'}}];assert.throws(()=>calculate(d,{q1:'a',q2:'b'}),/Cyclic/)
 const bad=make();bad.questions[0].weight=-1;assert.throws(()=>validateDefinition(bad))
 assert.throws(()=>calculate(make(),{q1:'madeup',q2:'a'}),/Unknown answer/)
})
test('bands use half-open boundaries with optional inclusive last endpoint',()=>{
 const d=make();d.totalRule.method='mean';d.bands=[{id:'b1',target:'overall',min:1,max:3,label:'low'},{id:'b2',target:'overall',min:3,max:5,includeMax:true,label:'high'}]
 assert.equal(calculate(d,{q1:'b',q2:'b'}).scores[0].interpretation,'high')
 d.bands[0].includeMax=true;assert.throws(()=>calculate(d,{q1:'b',q2:'b'}),/Overlapping/)
})
test('indicators depending on incomplete dimensions remain incomplete without inventing scores',()=>{
 const d=make();d.indicators=[{id:'INDEX',name:'Index',rule:{method:'formula',formula:'A * 2'}}]
 const r=calculate(d,{q1:'b'})
 assert.equal(r.complete,false)
 assert.equal(r.scores.find(s=>s.id==='INDEX').value,null)
 assert.equal(r.scores.find(s=>s.id==='INDEX').complete,false)
})
module.exports={make}
test('approved zero-denominator policy returns an explicit nonnumeric result without marking complete responses incomplete',()=>{
 const d=make();d.answerSets[0].options=[0,1,2,3,4].map(n=>({id:'v'+n,label:String(n),score:n}));d.questions.forEach(q=>q.reverse=false)
 d.indicators=[{id:'PST',name:'PST',rule:{method:'count',operator:'gt',threshold:0}},{id:'PSDI',name:'PSDI',rule:{method:'formula',formula:'SUM / PST',zeroDenominator:'not_applicable',notApplicableLabel:'غير قابل للحساب — لا أعراض مُبلّغ عنها'}}]
 const r=calculate(d,{q1:'v0',q2:'v0'}),s=r.scores.find(s=>s.id==='PSDI')
 assert.equal(s.value,null);assert.equal(s.notApplicable,true);assert.equal(s.interpretation,'غير قابل للحساب — لا أعراض مُبلّغ عنها');assert.equal(r.complete,true)
 assert.equal(calculate(d,{q1:'v3',q2:'v0'}).scores.find(s=>s.id==='PSDI').value,3)
 delete d.indicators[1].rule.zeroDenominator
 assert.throws(()=>calculate(d,{q1:'v0',q2:'v0'}),/Division by zero/)
})

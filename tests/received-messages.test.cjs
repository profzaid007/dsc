const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
const exportsObject={}
const code=ts.transpileModule(fs.readFileSync('components/messages/ReceivedMessages.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText
new Function('exports','require',code)(exportsObject,name=>name==='@/components/cases/CaseMessages'?{MessageBody:({text})=>React.createElement('p',null,text),MessageAttachments:()=>null}:require(name))
const {ReceivedMessages}=exportsObject
const message=(id,recipient,created,read=false)=>({id,recipient,sender:'sender',subject:id,body:`Body ${id}`,created,read})
test('inbox shows only received messages, newest first, with unread status and bilingual empty states',()=>{
 const props={userId:'self',contacts:[{id:'sender',name:'Sender name'}],lang:'en',onRead(){},messages:[message('old','self','2026-10-30 12:00:00Z',true),message('private-other','other','2026-11-01 12:00:00Z'),message('new','self','2026-10-31 12:00:00Z')]}
 const html=renderToStaticMarkup(React.createElement(ReceivedMessages,props))
 assert.ok(!html.includes('private-other'));assert.ok(html.indexOf('Body new')<html.indexOf('Body old'));assert.ok(html.includes('2 messages, 1 unread'));assert.ok(html.includes('Sender name'))
 for(const [lang,text] of [['en','No received messages yet.'],['ar','لا توجد رسائل واردة بعد.']]) assert.ok(renderToStaticMarkup(React.createElement(ReceivedMessages,{...props,messages:[],lang})).includes(text))
})
test('preview does not mark a message read until its details are opened',()=>{
 const reads=[];const tree=ReceivedMessages({userId:'self',contacts:[],lang:'en',messages:[message('new','self','2026-10-31 12:00:00Z')],onRead:id=>reads.push(id)})
 function find(node){if(!node||typeof node!=='object')return null;if(node.type==='details')return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child);if(found)return found}return null}
 const details=find(tree);assert.ok(details);assert.deepEqual(reads,[]);details.props.onToggle({currentTarget:{open:false}});assert.deepEqual(reads,[]);details.props.onToggle({currentTarget:{open:true}});assert.deepEqual(reads,['new'])
})

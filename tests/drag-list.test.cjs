const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript')
function harness(disabled=false){
 const state=[];let cursor=0;const changes=[];const mod={};
 const jsx=(type,props)=>({type,props});
 const react={useState(initial){const index=cursor++;if(!(index in state))state[index]=initial;return [state[index],value=>{state[index]=value}]}};
 const source=ts.transpileModule(fs.readFileSync('components/ui/drag-list.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('exports','require',source)(mod,name=>name==='react'?react:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='@/lib/lang-context'?{useLang:()=>({lang:'en'})}:name==='@/lib/utils'?{cn:(...x)=>x.filter(Boolean).join(' ')}:name==='@/components/ui/button'?{Button:'button'}:{GripVertical:'grip',ChevronUp:'up',ChevronDown:'down'});
 const items=[{id:'a',order:0},{id:'b',order:1},{id:'c',order:2}];
 const render=()=>{cursor=0;return mod.DragList({items,disabled,onReorder:value=>changes.push(value),keyExtractor:x=>x.id,renderItem:x=>x.id}).props.children};
 return {render,changes,items};
}
test('mouse drag moves an item to its drop position, renumbers order, and leaves source unchanged',()=>{
 const h=harness();let rows=h.render();const grip=rows[0].props.children[0];let transfer={setData(){},effectAllowed:''};grip.props.onDragStart({dataTransfer:transfer});rows=h.render();rows[2].props.onDrop({preventDefault(){}});
 assert.deepEqual(h.changes[0].map(x=>x.id),['b','c','a']);assert.deepEqual(h.changes[0].map(x=>x.order),[0,1,2]);assert.deepEqual(h.items.map(x=>x.id),['a','b','c']);
});
test('touch drag uses the row under the pointer and commits only at release',()=>{
 const h=harness();let rows=h.render();rows[2].props.children[0].props.onPointerDown({pointerType:'touch',pointerId:1,currentTarget:{setPointerCapture(){}}});
 global.document={elementFromPoint:()=>({closest:()=>({getAttribute:()=> 'a'})})};
 try{rows=h.render();rows[2].props.children[0].props.onPointerMove({pointerType:'touch',clientX:1,clientY:1});assert.equal(h.changes.length,0);rows=h.render();rows[2].props.children[0].props.onPointerUp({pointerType:'touch'});assert.deepEqual(h.changes[0].map(x=>x.id),['c','a','b'])}finally{delete global.document}
});
test('disabled lists reject drag, touch and arrow reordering',()=>{
 const h=harness(true);const rows=h.render(),grip=rows[0].props.children[0];let prevented=false;grip.props.onDragStart({preventDefault(){prevented=true}});assert.ok(prevented);grip.props.onPointerDown({pointerType:'touch'});rows[0].props.onDrop({preventDefault(){}});rows[1].props.children[1].props.children[0].props.onClick();assert.equal(h.changes.length,0);
});

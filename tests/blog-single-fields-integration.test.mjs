import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'
const migration='1794400000_single_authored_blog.js'
for(const conflict of [false,true]) test(conflict?'conflicting blog versions stop migration with record IDs':'single blog fields preserve authored text and remove all language copies',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-single-blog-'))
 const migrations=path.join(folder,'migrations');fs.mkdirSync(migrations)
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 const c=new Collection({name:'blog_pages',type:'base',fields:['title_en','title_ar','content_en','content_ar'].map(name=>({name,type:'text',max:1000000}))});app.save(c);
 const r=new Record(c);r.set('title_en','English عنوان');r.set('title_ar',${JSON.stringify(conflict?'Different title':'English عنوان')});r.set('content_ar','<p>نص عربي</p>');app.save(r);
 });`)
 fs.copyFileSync(path.resolve('pb_migrations',migration),path.join(migrations,migration))
 assert.equal(fs.readFileSync(path.resolve('pb_migrations',migration),'utf8'),fs.readFileSync(path.resolve('backend/pb/pb_migrations',migration),'utf8'))
 fs.writeFileSync(path.join(migrations,'1794400001_verify.js'),`migrate(app=>{
 const c=app.findCollectionByNameOrId('blog_pages');
 for(const name of ['title_en','title_ar','content_en','content_ar'])if(c.fields.getByName(name))throw Error('Old field retained: '+name);
 const r=app.findAllRecords('blog_pages')[0];if(r.getString('title')!=='English عنوان'||r.getString('content')!=='<p>نص عربي</p>')throw Error('Authored text lost');
 r.set('title','New English title');r.set('content','<p>نص جديد English</p>');app.save(r);
 });`)
 const run=spawnSync(path.resolve('../work/pocketbase-0.31.0/pocketbase.exe'),['migrate','up','--dir',path.join(folder,'data'),'--migrationsDir',migrations],{encoding:'utf8',windowsHide:true})
 const log=run.stdout+run.stderr
 if(conflict){assert.match(log,/Blog records need correction/);assert.match(log,/:title/);assert.doesNotMatch(log,/Applied 1794400001_verify/)}
 else assert.match(log,/Applied 1794400001_verify/,log)
})

routerAdd('GET','/api/dsc/message-contacts',(e)=>{
 return e.json(200,require(`${__hooks}/lib/case-messaging.js`).contacts(e));
},$apis.requireAuth('users'));

routerAdd('GET','/api/dsc/backups',(e)=>{
 require(`${__hooks}/lib/backup-access.js`)(e);
 const fs=e.app.newBackupsFilesystem();try{
 const rows=fs.list('').filter(x=>x&&!x.isDir&&/^dsc-.*\.zip$/.test(x.key)).map(x=>({name:x.key,size:x.size,modified:x.modTime}));
 return e.json(200,rows.sort((a,b)=>b.name.localeCompare(a.name)));
 }finally{fs.close();}
},$apis.requireAuth('users'));
routerAdd('POST','/api/dsc/backups',(e)=>{
 require(`${__hooks}/lib/backup-access.js`)(e);
 const name='dsc-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+$security.randomString(6)+'.zip';
 e.app.createBackup(e.request.context(),name);return e.json(200,{name});
},$apis.requireAuth('users'));
routerAdd('POST','/api/dsc/backups/download',(e)=>{
 require(`${__hooks}/lib/backup-access.js`)(e);
 const name=e.requestInfo().body.name;
 if(typeof name!=='string'||!/^dsc-[A-Za-z0-9-]+\.zip$/.test(name))throw new BadRequestError('Invalid backup name.');
 const fs=e.app.newBackupsFilesystem();try{
 fs.attributes(name);
 e.response.header().set('Content-Disposition','attachment; filename="'+name+'"');
 e.response.header().set('Cache-Control','no-store');
 fs.serve(e.response,e.request,name,name);return null;
 }finally{fs.close();}
},$apis.requireAuth('users'));

migrate(app=>{
 const c=app.findCollectionByNameOrId('assessment_sessions'),users=app.findCollectionByNameOrId('users')
 if(!c.fields.getByName('recipient'))c.fields.add(new RelationField({name:'recipient',collectionId:users.id,maxSelect:1,cascadeDelete:false}))
 for(const name of ['assigned_at','submitted_at'])if(!c.fields.getByName(name))c.fields.add(new TextField({name,max:40}))
 const status=c.fields.getByName('status');if(!status.values.includes('assigned'))status.values.push('assigned')
 app.save(c)
},()=>{throw new Error('Restore a reviewed backup to revert delivery records')})

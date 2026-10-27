migrate(app => {
 const c = app.findCollectionByNameOrId("tools")
 const field = c.fields.getByName("media")
 if (field && field.type() !== "file") throw new Error("Correct tools.media: it must be a file field.")
 if (!field) { c.fields.add(new FileField({id:"file1781309708",name:"media",maxSelect:99,maxSize:0,protected:false}));app.save(c) }
}, () => { throw new Error("Restore a reviewed backup to remove tools.media without losing uploaded files.") })

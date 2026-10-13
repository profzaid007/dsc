migrate((app)=>{
 const view=app.findCollectionByNameOrId('experts_public');
 if(!view.viewQuery.includes('expert_profiles.specialist_roles')) {
  const query=view.viewQuery;
  if(!query.includes('FROM expert_profiles'))throw new Error('Review the public expert query before adding specialist roles');
  view.viewQuery=query.replace('FROM expert_profiles',', expert_profiles.specialist_roles FROM expert_profiles');
  app.save(view);
 }
},()=>{throw new Error('Use a reviewed backup to revert the public expert view.');});

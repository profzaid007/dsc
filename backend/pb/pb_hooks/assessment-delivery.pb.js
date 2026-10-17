routerAdd('GET','/api/dsc/cases/{id}/assessments',e=>require(__hooks+'/lib/assessment-delivery.js')(e,'case'),$apis.requireAuth('users'));
routerAdd('POST','/api/dsc/assessment-sessions/assign',e=>require(__hooks+'/lib/assessment-delivery.js')(e,'assign'),$apis.requireAuth('users'));
routerAdd('GET','/api/dsc/my-assessments',e=>require(__hooks+'/lib/assessment-delivery.js')(e,'mine'),$apis.requireAuth('users'));
routerAdd('GET','/api/dsc/my-assessments/{id}',e=>require(__hooks+'/lib/assessment-delivery.js')(e,'client'),$apis.requireAuth('users'));
routerAdd('POST','/api/dsc/my-assessments/{id}/submit',e=>require(__hooks+'/lib/assessment-delivery.js')(e,'respond'),$apis.requireAuth('users'));

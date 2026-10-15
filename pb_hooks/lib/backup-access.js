module.exports=(e)=>{
 require(`${__hooks}/lib/security-policy.js`).requireSuper(e.app,e.auth);
};

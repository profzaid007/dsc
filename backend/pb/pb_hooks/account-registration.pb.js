routerAdd(
  "POST",
  "/api/dsc/register",
  (e) => require(`${__hooks}/lib/account-registration.js`)(e),
  $apis.bodyLimit(256 * 1024)
)

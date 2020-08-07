const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');

const auth = require('./routers/auth');

const app = new Koa();

app.use(serve(path.join(__dirname + '/public')))
  .use(auth.routes())
  .use(auth.allowedMethods());

app.listen(3000, () => {
  console.log('service is successFul');
})
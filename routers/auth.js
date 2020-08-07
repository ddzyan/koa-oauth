// https://github.com/settings/applications/1351552

const Router = require('koa-router');
const axios = require('axios');

const router = new Router();

const clientID = 'd76e85f63c8e14b891f4'
const clientSecret = '64d9d769a087e1e268369f827e20088c55526f95'

router.get('/oauth/redirect', async (ctx) => {
  try {
    const requestToken = ctx.request.query.code;
    console.log('authorization code:', requestToken);

    // 根据返回的 code 获取 access_token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token?' +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${requestToken}`,
      headers: {
        accept: 'application/json'
      }
    });

    const { access_token: accessToken } = tokenResponse.data;
    console.log(`access token: ${accessToken}`);

    // 根据获取的 access_token 获取用户信息
    const result = await axios({
      method: 'get',
      url: `https://api.github.com/user`,
      headers: {
        accept: 'application/json',
        Authorization: `token ${accessToken}`
      }
    });
    console.log(result.data);
    const { name } = result.data;

    // 注册完成，跳转欢迎页面
    ctx.response.redirect(`/welcome.html?name=${name}`);
  } catch (error) {
    console.error(error);
    ctx.status = 501;
    ctx.body = 'system is error';
  }

})

module.exports = router;
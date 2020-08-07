# 简介

使用 koa + OAuth 授权认证流程，完成第三方账号登录，并且获取第三方用户信息。

[github OAuth 注册地址](https://github.com/settings/applications/new)

## 使用

```sh
npm install

node ./index.js
```

在浏览器中打开 http://localhost:3000/ 进行第三方授权登录

# OAuth 授权流程

## 资料

1. https://oauth.net/articles/authentication/
2. https://www.zhihu.com/question/19781476/answer/81020455

网站登录的两种实现方式：

1. 输入当前网站账号密码登录
2. 使用第三方网站账号进行授权登录 --- OAuth 认证流程

一种开放协议，允许通过简单，标准的方法从 Web，移动和桌面应用程序进行安全授权。（此段描述来自官网）

这里需要指出 jwt （json web token）为一种加密方式，而 OAuth 是是一种认证流程，两者并不冲突，反而可以混合使用。

## 认证流程

![](https://pic1.zhimg.com/80/v2-9a5eb207b71c891f9e1318413a457755_720w.jpg?source=1940ef5c)

此图中还少了一个流程：client 需要在 OAuth server 中进行注册，添加需要的用户权限，和验证成功后进行跳转的 redirect_uri。

4 阶段发送给 OAuth server 的数据

```js
{
  code:"xxxx",
  client_id:"xxx",
  client_secret:"xxx",
  redirect_uri:"www.xxx.com"
}
```

5 阶段 OAuth server 返回的数据格式

```js
{
  access_token:"xxxxx",
  scope:"user,gist",
  token_type:"bearer",
  refresh_token:"xxxx" // 因为 access_token 具有过期时间，所以需要在过期的时候通过 refresh_token 再次获取
}
```

当所有流程完成后，用户如果再次点击第三方登录按钮，则用户无需再二次授权，第三方服务会直接返回 code 给 client , 使之走接下来的流程。

## 常见问题

#### Q : 为什么 OAuth2 在获取 access token 之前一定要先获取 code , 然后再用 code 去获取 access token?

A :

角色定义：

1. client --- 我们自己的 APP
2. owner --- 使用我们 app 的用户
3. auth server --- 在 owner 授权后，为 client 提供接口来访问资源

前面省略了 client 到 auth server 注册的流程：

1. owner 在 auth server 上认证身份，并同意授权给 client , auth server 会通过浏览器 302 重定向到 clint ，并且在 url 后添加 code 信息
2. client 获取 code 时，如果直接使用 code 访问 auth server ，那 auth server 是无法确认 client 身份，因为这是 auth server 只有一个 app id，但是没有任何手段来验证发送 code 的 client 是否与注册的 app 一致。
3. 所以 client 在拿到 code 后，需要将 code ，client Id , client secret , redirect_uri 一起发送给 auth server 进行验证并且获取 access token 。
   1. 请求为 后台 发送给 auth server 所以无法被截取
   2. 请求走的是 https 协议更加安全

如果去掉上面步骤的 token ，则需要 clint 提供 secret 给 owner， 在 auth server 认证身份的时候进行传输，使 auth server 可以验证 client 身份，存在如下问题：

1. 此时由于请求使用浏览器发送，则容易被截取获得到 secret 不安全。
2. 如果 client 指定的 redirect_uri 是 http 协议，则返回的 access token 在传输中也容易被截获导致泄漏。

#### Q：在 client 获取到 acess token 后，在后续的请求里，acess token 还是直接发送给 auth server 给 auth server ，这个时候就不能截取了吗？

因为 clint 是后端发送给 auth server (此时因该为 resources server )，是服务器往服务器端发送消息，消息难以截获。并且此时走的协议一般为 https 加入了 ssl 加密，更加保证了信息的安全

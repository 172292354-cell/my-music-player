# Cloudflare Worker API 部署说明

## 方案说明

这个 Worker 可以替代 Node.js 服务器，为音乐播放器提供 API 服务。

## 部署步骤

### 方式一：使用 Cloudflare Workers（推荐，免费）

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署 Worker**
   ```bash
   cd worker
   wrangler deploy
   ```

4. **获取 Worker URL**
   部署后会得到类似 `https://music-player-api.xxx.workers.dev` 的地址

5. **修改前端配置**
   在 `script.js` 中修改：
   ```javascript
   const API_BASE = 'https://你的-worker-域名';
   const IS_STATIC_HOSTING = false;
   ```

6. **部署到 GitHub 并重新触发 Cloudflare Pages**

### 方式二：使用自定义域名

如果你有自定义域名（如 `api.xmmlzwtk.cc.cd`）：

1. 修改 `wrangler.toml` 中的路由配置：
   ```toml
   routes = [
     { pattern = "api.xmmlzwtk.cc.cd", zone_name = "xmmlzwtk.cc.cd" }
   ]
   ```

2. 确保域名已添加到 Cloudflare

3. 部署：
   ```bash
   wrangler deploy
   ```

## 验证 API 是否正常工作

部署完成后，访问：
```
https://你的-worker-域名/song/url?id=2154219378
```

应该返回类似：
```json
{
  "data": [
    {
      "id": 2154219378,
      "url": "https://m10.music.126.net/...",
      "br": 320000
    }
  ],
  "code": 200
}
```

## 注意事项

- Cloudflare Workers 有每日 100,000 次请求的免费额度
- Worker 代码不能使用 Node.js 特定的 API（如 fs、path 等）
- 使用 fetch API 进行 HTTP 请求

# Cloudflare 完整部署方案

## 方案概述

在 Cloudflare 上同时部署：
- **前端**：Cloudflare Pages（静态文件托管）
- **API**：Cloudflare Workers（无服务器函数）

## 第一步：部署 Cloudflare Worker（API 服务）

### 1.1 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 1.2 登录 Cloudflare
```bash
wrangler login
```

### 1.3 部署 Worker
```bash
cd worker
wrangler deploy
```

### 1.4 记录 Worker URL
部署成功后会显示类似：
```
https://music-player-api.abc123.workers.dev
```
**请记录这个 URL**，后面会用到。

## 第二步：配置前端以使用 API

### 2.1 修改配置

编辑 `script.js` 文件，修改顶部的配置：

```javascript
// 方式一：使用 Cloudflare Worker（推荐）
const API_BASE = 'https://music-player-api.abc123.workers.dev';
const IS_STATIC_HOSTING = false;

// 方式二：使用本地服务器
// const API_BASE = '';
// const IS_STATIC_HOSTING = false;
```

### 2.2 提交并推送
```bash
git add .
git commit -m "配置 Cloudflare Worker API"
git push origin master:main
```

## 第三步：部署 Cloudflare Pages

确保 Cloudflare Pages 从 GitHub 的 `main` 分支拉取代码。

## 验证部署

部署完成后：

1. **测试 API**：
   ```
   https://music-player-api.abc123.workers.dev/song/url?id=2154219378
   ```

2. **访问网站**：
   ```
   https://m.xmmlzwtk.cc.cd/
   ```

3. **切换到 API 模式**：
   - 点击右上角的"外链模式"按钮
   - 应该能正常切换，不会再显示错误提示
   - 点击歌曲应该能播放

## 注意事项

### 免费额度
- Cloudflare Workers：**每天 100,000 次请求**
- Cloudflare Pages：**无限次访问**

### API 域名（可选）
如果你有自定义域名（如 `api.xmmlzwtk.cc.cd`），可以在 `worker/wrangler.toml` 中配置：

```toml
routes = [
  { pattern = "api.xmmlzwtk.cc.cd", zone_name = "xmmlzwtk.cc.cd" }
]
```

然后在 `script.js` 中改为：
```javascript
const API_BASE = 'https://api.xmmlzwtk.cc.cd';
```

## 故障排查

### 问题：API 请求失败
1. 检查 Worker 是否部署成功
2. 确认 `API_BASE` 地址正确
3. 检查浏览器控制台错误信息

### 问题：Worker 部署失败
1. 确保已登录：`wrangler login`
2. 检查网络连接
3. 查看错误信息并重试

### 问题：CORS 错误
Worker 代码已配置 CORS 头，如仍有问题请检查浏览器控制台。

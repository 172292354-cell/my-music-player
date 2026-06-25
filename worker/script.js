/**
 * Cloudflare Worker - 网易云音乐 API 代理
 * 用于替代 Node.js 服务器，为音乐播放器提供 API 服务
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理 /song/url 接口
    if (url.pathname === '/song/url') {
      const songId = url.searchParams.get('id');

      if (!songId) {
        return new Response(JSON.stringify({ error: '缺少歌曲ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        // 调用网易云音乐 API
        const apiUrl = `https://music.163.com/api/song/enhance/player/url?ids=[${songId}]&br=320000`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Referer': 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('API 请求失败:', error);
        return new Response(JSON.stringify({ error: '获取歌曲URL失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 其他请求返回 404
    return new Response('Not Found', { status: 404 });
  },
};

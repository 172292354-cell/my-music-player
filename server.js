const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'Referer': 'https://music.163.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

app.get('/song/url', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: '缺少歌曲ID' });
        }
        
        console.log(`获取歌曲URL: ${id}`);
        const result = await fetchUrl(`https://music.163.com/api/song/enhance/player/url?ids=[${id}]&br=320000`);
        console.log('API 返回:', JSON.stringify(result).substring(0, 200));
        res.json(result);
    } catch (error) {
        console.error('获取歌曲URL失败:', error);
        res.status(500).json({ error: '获取歌曲URL失败' });
    }
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
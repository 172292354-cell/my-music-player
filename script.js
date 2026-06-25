const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;
const iframePlayer = document.getElementById('iframePlayer');
const audioPlayer = document.getElementById('audioPlayer');
const modeToggle = document.getElementById('modeToggle');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorMessage = document.getElementById('errorMessage');
const playlistSection = document.getElementById('playlistSection');
const playlistToggle = document.getElementById('playlistToggle');
const playlistHeader = document.querySelector('.playlist-header');
const playlistContainer = document.getElementById('playlistContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');

const API_BASE = '';

let songsData = [];

const AppState = {
    currentTheme: localStorage.getItem('musicPlayerTheme') || 'light',
    currentMode: localStorage.getItem('musicPlayerMode') || 'iframe',
    currentPlaylist: null,
    currentSong: null,
    isLoading: false,
    isPlaylistCollapsed: true
};

async function loadSongs() {
    try {
        const response = await fetch('./songs.json');
        if (!response.ok) {
            throw new Error('无法加载歌曲数据');
        }
        songsData = await response.json();
        console.log('歌曲数据加载成功:', songsData);
        return songsData;
    } catch (error) {
        console.error('加载歌曲数据失败:', error);
        showError('加载歌曲数据失败，请检查 songs.json 文件');
        return [];
    }
}

function renderPlaylist() {
    if (!playlistContainer || songsData.length === 0) return;
    
    playlistContainer.innerHTML = '';
    
    songsData.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item' + (index === 0 ? ' active' : '');
        item.dataset.index = index;
        item.dataset.songId = song.id;
        item.innerHTML = `
            <div class="playlist-icon">🎵</div>
            <div class="playlist-info">
                <h4 class="playlist-name">${song.playlistName}</h4>
                <p class="playlist-description">${song.name} - ${song.artist}</p>
            </div>
            <div class="playlist-status">▶</div>
        `;
        playlistContainer.appendChild(item);
    });
}

function getCurrentPlayer() {
    return AppState.currentMode === 'iframe' ? iframePlayer : audioPlayer;
}

async function initApp() {
    if (AppState.currentTheme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    updateModeUI();
    
    await loadSongs();
    renderPlaylist();
    
    if (songsData.length > 0) {
        updateSongInfo(songsData[0].name, songsData[0].artist);
        AppState.currentPlaylist = 0;
        AppState.currentSong = {
            id: songsData[0].id,
            title: songsData[0].name,
            artist: songsData[0].artist
        };
    }
    
    if (AppState.isPlaylistCollapsed) {
        playlistSection.classList.add('collapsed');
    } else {
        playlistSection.classList.remove('collapsed');
    }
    
    bindEventListeners();
    monitorPlayerLoading();
    
    console.log('音乐播放器应用初始化完成');
}

function bindEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    modeToggle.addEventListener('click', toggleMode);
    
    const playlistContainer = document.getElementById('playlistContainer');
    if (playlistContainer) {
        playlistContainer.addEventListener('click', (e) => {
            const playlistItem = e.target.closest('.playlist-item');
            if (playlistItem) {
                selectPlaylist(playlistItem);
            }
        });
    }
    
    playlistToggle.addEventListener('click', togglePlaylist);
    
    playlistHeader.addEventListener('click', (e) => {
        if (e.target !== playlistToggle && !playlistToggle.contains(e.target)) {
            togglePlaylist();
        }
    });
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    audioPlayer.addEventListener('play', updatePlayPauseIcon);
    audioPlayer.addEventListener('pause', updatePlayPauseIcon);
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousSong);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', playNextSong);
    }
}

function toggleTheme() {
    showLoading();
    
    setTimeout(() => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            AppState.currentTheme = 'light';
        } else {
            body.classList.add('dark-theme');
            AppState.currentTheme = 'dark';
        }
        
        localStorage.setItem('musicPlayerTheme', AppState.currentTheme);
        
        hideLoading();
        console.log('主题已切换为:', AppState.currentTheme);
    }, 300);
}

function toggleMode() {
    showLoading();
    
    setTimeout(() => {
        if (AppState.currentMode === 'iframe') {
            iframePlayer.src = '';
            AppState.currentMode = 'api';
            modeToggle.textContent = 'API模式';
            modeToggle.classList.add('api-mode');
            iframePlayer.classList.add('hidden');
            audioPlayer.classList.remove('hidden');
            playPauseBtn.classList.remove('hidden');
        } else {
            audioPlayer.pause();
            audioPlayer.src = '';
            AppState.currentMode = 'iframe';
            modeToggle.textContent = '外链模式';
            modeToggle.classList.remove('api-mode');
            audioPlayer.classList.add('hidden');
            iframePlayer.classList.remove('hidden');
            playPauseBtn.classList.add('hidden');
        }
        
        localStorage.setItem('musicPlayerMode', AppState.currentMode);
        
        if (AppState.currentSong) {
            updateMusicPlayer(AppState.currentSong.id);
        }
        
        hideLoading();
        console.log('播放模式已切换为:', AppState.currentMode);
    }, 300);
}

function updateModeUI() {
    if (AppState.currentMode === 'api') {
        modeToggle.textContent = 'API模式';
        modeToggle.classList.add('api-mode');
        iframePlayer.classList.add('hidden');
        audioPlayer.classList.remove('hidden');
        playPauseBtn.classList.remove('hidden');
    } else {
        modeToggle.textContent = '外链模式';
        modeToggle.classList.remove('api-mode');
        audioPlayer.classList.add('hidden');
        iframePlayer.classList.remove('hidden');
        playPauseBtn.classList.add('hidden');
    }
}

function togglePlaylist() {
    if (playlistSection.classList.contains('collapsed')) {
        playlistSection.classList.remove('collapsed');
        AppState.isPlaylistCollapsed = false;
    } else {
        playlistSection.classList.add('collapsed');
        AppState.isPlaylistCollapsed = true;
    }
    
    localStorage.setItem('musicPlayerPlaylistCollapsed', AppState.isPlaylistCollapsed);
    
    console.log('歌单已', AppState.isPlaylistCollapsed ? '收起' : '展开');
}

function selectPlaylist(playlistItem) {
    if (playlistItem.classList.contains('active')) {
        return;
    }
    
    showLoading();
    
    const allItems = playlistContainer.querySelectorAll('.playlist-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    playlistItem.classList.add('active');
    
    const index = parseInt(playlistItem.dataset.index, 10);
    const song = songsData[index];
    if (!song) {
        hideLoading();
        return;
    }
    
    AppState.currentPlaylist = index;
    AppState.currentSong = {
        id: song.id,
        title: song.name,
        artist: song.artist
    };
    
    updateMusicPlayer(song.id);
    
    updateSongInfo(song.name, song.artist);
    
    setTimeout(() => {
        hideLoading();
        console.log('已选择歌单:', song.name, '-', song.artist);
    }, 800);
}

function playSongByIndex(index) {
    if (index < 0 || index >= songsData.length) return;
    
    const allItems = playlistContainer.querySelectorAll('.playlist-item');
    if (allItems[index]) {
        selectPlaylist(allItems[index]);
    }
}

function playPreviousSong() {
    if (songsData.length === 0) return;
    let index = AppState.currentPlaylist !== null ? AppState.currentPlaylist - 1 : 0;
    if (index < 0) index = songsData.length - 1;
    playSongByIndex(index);
}

function playNextSong() {
    if (songsData.length === 0) return;
    let index = AppState.currentPlaylist !== null ? AppState.currentPlaylist + 1 : 0;
    if (index >= songsData.length) index = 0;
    playSongByIndex(index);
}

async function updateMusicPlayer(songId) {
    showLoading();
    
    if (AppState.currentMode === 'iframe') {
        const newSrc = `https://music.163.com/outchain/player?type=2&id=${songId}&auto=1&height=66`;
        iframePlayer.src = newSrc;
        
        iframePlayer.onload = function() {
            console.log('iframe播放器加载完成');
            setTimeout(() => {
                hideLoading();
            }, 1000);
        };
        
        iframePlayer.onerror = function() {
            console.error('iframe播放器加载失败');
            hideLoading();
            showError('音乐播放器加载失败，请检查网络连接');
        };
    } else {
        try {
            const response = await fetch(`${API_BASE}/song/url?id=${songId}`);
            if (!response.ok) {
                throw new Error('API 请求失败');
            }
            const result = await response.json();
            const songUrl = result.data?.[0]?.url;
            
            if (!songUrl) {
                hideLoading();
                showError('该歌曲暂无版权或需要VIP，无法播放');
                return;
            }
            
            audioPlayer.src = songUrl;
            await audioPlayer.play();
        } catch (error) {
            console.error('加载歌曲失败:', error);
            hideLoading();
            showError('加载歌曲失败，请检查API服务是否运行');
        }
    }
}

function monitorPlayerLoading() {
    iframePlayer.onload = function() {
        console.log('初始iframe播放器加载完成');
        setTimeout(() => {
            hideLoading();
        }, 1000);
    };
    
    iframePlayer.onerror = function() {
        console.error('初始iframe播放器加载失败');
        hideLoading();
        showError('音乐播放器加载失败，请检查网络连接');
    };
    
    audioPlayer.addEventListener('canplay', () => {
        console.log('音频加载完成');
        hideLoading();
    });
    
    audioPlayer.addEventListener('error', () => {
        console.error('音频加载失败');
        hideLoading();
        showError('音频加载失败');
    });
    
    audioPlayer.addEventListener('ended', () => {
        console.log('当前歌曲播放结束');
        playNextSong();
    });
}

function togglePlayPause() {
    if (AppState.currentMode === 'api') {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(() => {
                showError('播放失败');
            });
        } else {
            audioPlayer.pause();
        }
    }
}

function updatePlayPauseIcon() {
    if (!playPauseBtn) return;
    if (AppState.currentMode === 'api') {
        if (audioPlayer.paused) {
            playPauseBtn.textContent = '▶';
            playPauseBtn.setAttribute('aria-label', '播放');
        } else {
            playPauseBtn.textContent = '⏸';
            playPauseBtn.setAttribute('aria-label', '暂停');
        }
    } else {
        playPauseBtn.textContent = '▶';
        playPauseBtn.setAttribute('aria-label', '播放');
    }
}

function updateSongInfo(title, artist) {
    songTitle.style.opacity = '0';
    songArtist.style.opacity = '0';
    
    setTimeout(() => {
        songTitle.textContent = title;
        songArtist.textContent = artist;
        
        songTitle.style.opacity = '1';
        songArtist.style.opacity = '1';
    }, 300);
}

function showLoading() {
    AppState.isLoading = true;
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    AppState.isLoading = false;
    loadingOverlay.classList.remove('show');
}

function showError(message) {
    const errorText = errorMessage.querySelector('.error-text');
    errorText.textContent = message || '加载失败，请重试';
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        hideError();
    }, 3000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

function addTransitionEffects() {
    songTitle.style.transition = 'opacity 0.3s ease';
    songArtist.style.transition = 'opacity 0.3s ease';
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            toggleTheme();
        }
        
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const allItems = playlistContainer.querySelectorAll('.playlist-item');
            if (allItems[index]) {
                selectPlaylist(allItems[index]);
            }
        }
    });
}

function setupNetworkMonitoring() {
    window.addEventListener('online', () => {
        console.log('网络已连接');
        hideError();
    });
    
    window.addEventListener('offline', () => {
        console.log('网络已断开');
        showError('网络连接已断开，请检查网络设置');
    });
}

function optimizePerformance() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

function trackUserBehavior(action, data) {
    console.log('用户行为:', action, data);
}

function handleVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('页面已隐藏');
            trackUserBehavior('page_hidden');
        } else {
            console.log('页面已显示');
            trackUserBehavior('page_visible');
        }
    });
}

function handleResponsiveChanges() {
}

document.addEventListener('DOMContentLoaded', () => {
    addTransitionEffects();
    initApp();
    setupKeyboardShortcuts();
    setupNetworkMonitoring();
    optimizePerformance();
    handleVisibilityChange();
    handleResponsiveChanges();
    
    trackUserBehavior('app_start', {
        theme: AppState.currentTheme,
        mode: AppState.currentMode,
        userAgent: navigator.userAgent
    });
});

window.MusicPlayerAPI = {
    toggleTheme,
    toggleMode,
    selectPlaylist,
    getCurrentState: () => ({ ...AppState }),
    showLoading,
    hideLoading,
    showError,
    hideError
};

console.log('音乐播放器脚本加载完成');
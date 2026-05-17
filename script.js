/**
 * Modern Spotify Player
 * A fully-featured music player with responsive design
 * Team: Developer, Tester, QA Lead
 */

// DOM Elements Cache
const DOM = {
  masterPlay: document.getElementById('masterPlay'),
  playPauseIcon: document.getElementById('playPauseIcon'),
  myProgressBar: document.getElementById('myProgressBar'),
  gif: document.getElementById('gif'),
  currentTime: document.getElementById('currentTime'),
  duration: document.getElementById('duration'),
  playerSongName: document.getElementById('playerSongName'),
  playerArtist: document.getElementById('playerArtist'),
  playerCoverImg: document.getElementById('playerCoverImg'),
  songsGrid: document.querySelector('.songs-grid'),
  pageTitle: document.getElementById('pageTitle'),
  pageSubtitle: document.getElementById('pageSubtitle'),
  previous: document.getElementById('previous'),
  next: document.getElementById('next'),
};

// Player State
const playerState = {
  songIndex: 0,
  audioElement: new Audio(),
  currentPlaylist: 'all',
  likedSongs: new Set(),
  isPlaying: false,
  isDraggingProgressBar: false,
};

// Song Data
const songs = [
    {songName: "Warriyo - Mortals [NCS Release]", filePath: "songs/1.mp3", coverPath: "covers/1.jpg", artist: "Warriyo"},
    {songName: "Cielo - Huma-Huma", filePath: "songs/2.mp3", coverPath: "covers/2.jpg", artist: "Cielo"},
    {songName: "DEAF KEV - Invincible [NCS Release]", filePath: "songs/3.mp3", coverPath: "covers/3.jpg", artist: "DEAF KEV"},
    {songName: "Different Heaven & EH!DE - My Heart", filePath: "songs/4.mp3", coverPath: "covers/4.jpg", artist: "Different Heaven"},
    {songName: "Janji - Heroes Tonight (NCS Release)", filePath: "songs/5.mp3", coverPath: "covers/5.jpg", artist: "Janji"},
    {songName: "Rabba - Salam-e-Ishq", filePath: "songs/2.mp3", coverPath: "covers/6.jpg", artist: "Rahat Fateh Ali Khan"},
    {songName: "Sakhiyaan - Salam-e-Ishq", filePath: "songs/2.mp3", coverPath: "covers/7.jpg", artist: "Shreya Ghoshal"},
    {songName: "Bhula Dena - Salam-e-Ishq", filePath: "songs/2.mp3", coverPath: "covers/8.jpg", artist: "KK"},
    {songName: "Tumhari Kasam - Salam-e-Ishq", filePath: "songs/2.mp3", coverPath: "covers/9.jpg", artist: "Udit Narayan"},
    {songName: "Na Jaana - Salam-e-Ishq", filePath: "songs/4.mp3", coverPath: "covers/10.jpg", artist: "Atif Aslam"},
];

const pageContent = {
    home: {title: 'Best of NCS', subtitle: 'No Copyright Sounds - Premium Music'},
    discover: {title: 'Discover New Music', subtitle: 'Explore trending tracks and new releases'},
    library: {title: 'My Library', subtitle: 'Your saved music and collections'},
};

// ===== CORE FUNCTIONS =====

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function renderSongs(playlistType = 'all') {
    const songsGrid = DOM.songsGrid;
    if (!songsGrid) return;
    
    songsGrid.innerHTML = '';
    let visibleSongs = songs;
    
    if (playlistType === 'liked') {
        visibleSongs = songs.filter((_, idx) => playerState.likedSongs.has(idx));
        if (visibleSongs.length === 0) {
            songsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #b3b3b3; padding: 3rem;">No liked songs yet. Heart your favorites!</p>';
            return;
        }
    } else if (playlistType === 'popular') {
        visibleSongs = songs.slice(0, 5);
    }
    
    visibleSongs.forEach((song, index) => {
        const originalIndex = songs.indexOf(song);
        const isLiked = playerState.likedSongs.has(originalIndex);
        
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');
        songCard.setAttribute('role', 'article');
        songCard.setAttribute('aria-label', `${song.songName} by ${song.artist}`);
        
        songCard.innerHTML = `
            <img src="${song.coverPath}" alt="${song.songName}" class="song-card-image" onerror="this.src='covers/1.jpg'" loading="lazy">
            <h4 class="song-card-title" title="${song.songName}">${song.songName}</h4>
            <p class="song-card-artist">${song.artist}</p>
            <p class="song-card-duration">5:34</p>
            <div class="play-icon" data-index="${originalIndex}" role="button" tabindex="0" aria-label="Play ${song.songName}">
                <i class="fas fa-play"></i>
            </div>
            <button class="like-btn ${isLiked ? 'liked' : ''}" data-index="${originalIndex}" title="Like" aria-label="Like ${song.songName}">
                <i class="fas fa-heart"></i>
            </button>
        `;
        songsGrid.appendChild(songCard);
    });
    
    attachSongCardListeners();
}

function attachSongCardListeners() {
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(icon.getAttribute('data-index'));
            playSong(index);
        });
        icon.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const index = parseInt(icon.getAttribute('data-index'));
                playSong(index);
            }
        });
    });
    
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.getAttribute('data-index'));
            toggleLike(index);
        });
    });
}

function toggleLike(index) {
    if (playerState.likedSongs.has(index)) {
        playerState.likedSongs.delete(index);
    } else {
        playerState.likedSongs.add(index);
    }
    renderSongs(playerState.currentPlaylist);
}

function playSong(index) {
    playerState.songIndex = index;
    const song = songs[index];
    
    playerState.audioElement.src = song.filePath;
    DOM.playerSongName.innerText = song.songName;
    DOM.playerArtist.innerText = song.artist;
    DOM.playerCoverImg.src = song.coverPath;
    DOM.playerCoverImg.onerror = () => { DOM.playerCoverImg.src = 'covers/1.jpg'; };
    
    playerState.audioElement.currentTime = 0;
    playerState.audioElement.play().catch(err => {
        console.error('Error playing audio:', err);
        showNotification('Error: Could not play song');
    });
}

function updatePlayButtons() {
    if (playerState.audioElement.paused) {
        DOM.playPauseIcon.classList.remove('fa-pause-circle');
        DOM.playPauseIcon.classList.add('fa-play-circle');
        DOM.gif.style.opacity = '0';
        playerState.isPlaying = false;
    } else {
        DOM.playPauseIcon.classList.remove('fa-play-circle');
        DOM.playPauseIcon.classList.add('fa-pause-circle');
        DOM.gif.style.opacity = '1';
        playerState.isPlaying = true;
    }
}

function handleNavigation(page) {
    playerState.currentPlaylist = 'all';
    const content = pageContent[page];
    if (content) {
        DOM.pageTitle.innerText = content.title;
        DOM.pageSubtitle.innerText = content.subtitle;
    }
    renderSongs('all');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.parentElement.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).parentElement.classList.add('active');
}

function handlePlaylist(playlistType) {
    playerState.currentPlaylist = playlistType;
    
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-playlist="${playlistType}"]`).classList.add('active');
    
    const titles = {
        all: {title: 'Best of NCS', subtitle: 'No Copyright Sounds - Premium Music'},
        liked: {title: 'Liked Songs', subtitle: 'Your favorite tracks'},
        popular: {title: 'Popular Now', subtitle: 'Trending tracks this week'},
    };
    
    const info = titles[playlistType] || titles.all;
    DOM.pageTitle.innerText = info.title;
    DOM.pageSubtitle.innerText = info.subtitle;
    renderSongs(playlistType);
}

function showNotification(message) {
    console.log('Notification:', message);
}

// ===== EVENT LISTENERS =====

DOM.masterPlay.addEventListener('click', () => {
    if (playerState.audioElement.paused || playerState.audioElement.currentTime <= 0) {
        playerState.audioElement.play().catch(err => {
            console.error('Error playing audio:', err);
            showNotification('Error: Could not play song');
        });
    } else {
        playerState.audioElement.pause();
    }
});

playerState.audioElement.addEventListener('play', () => {
    DOM.playPauseIcon.classList.remove('fa-play-circle');
    DOM.playPauseIcon.classList.add('fa-pause-circle');
    DOM.gif.style.opacity = '1';
    playerState.isPlaying = true;
});

playerState.audioElement.addEventListener('pause', () => {
    DOM.playPauseIcon.classList.remove('fa-pause-circle');
    DOM.playPauseIcon.classList.add('fa-play-circle');
    DOM.gif.style.opacity = '0';
    playerState.isPlaying = false;
});

playerState.audioElement.addEventListener('timeupdate', () => {
    if (!playerState.isDraggingProgressBar) {
        const progress = (playerState.audioElement.currentTime / playerState.audioElement.duration) * 100;
        DOM.myProgressBar.value = progress || 0;
    }
    DOM.currentTime.innerText = formatTime(playerState.audioElement.currentTime);
    DOM.duration.innerText = formatTime(playerState.audioElement.duration);
});

playerState.audioElement.addEventListener('loadedmetadata', () => {
    DOM.duration.innerText = formatTime(playerState.audioElement.duration);
});

playerState.audioElement.addEventListener('ended', () => {
    DOM.next.click();
});

DOM.myProgressBar.addEventListener('mousedown', () => {
    playerState.isDraggingProgressBar = true;
});

DOM.myProgressBar.addEventListener('mouseup', () => {
    playerState.isDraggingProgressBar = false;
});

DOM.myProgressBar.addEventListener('input', () => {
    playerState.audioElement.currentTime = (DOM.myProgressBar.value / 100) * playerState.audioElement.duration;
});

DOM.next.addEventListener('click', () => {
    playerState.songIndex = (playerState.songIndex + 1) % songs.length;
    playSong(playerState.songIndex);
});

DOM.previous.addEventListener('click', () => {
    playerState.songIndex = (playerState.songIndex - 1 + songs.length) % songs.length;
    playSong(playerState.songIndex);
});

// Navigation listeners
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        handleNavigation(page);
    });
});

// Playlist listeners
document.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', () => {
        const playlist = item.getAttribute('data-playlist');
        handlePlaylist(playlist);
    });
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        renderSongs('all');
        DOM.playerSongName.innerText = songs[0].songName;
        DOM.playerArtist.innerText = songs[0].artist;
        DOM.playerCoverImg.src = songs[0].coverPath;
        console.log('🎵 Player initialized successfully');
    } catch (error) {
        console.error('Error initializing player:', error);
        showNotification('Error: Could not initialize player');
    }
});

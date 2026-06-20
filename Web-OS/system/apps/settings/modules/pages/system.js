// modules/pages/system.js
const navigate = window.navigate || ((id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');
});

// ==================== Load user data ====================
async function loadUserData() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const user = await response.json();
        return user;
    } catch (err) {
        console.error('Error loading user data:', err);
        return { username: 'User', avatar: '' };
    }
}

// ==================== Load disk stats ====================
async function loadDiskStats() {
    try {
        const response = await fetch('/api/system/disk');
        if (!response.ok) throw new Error('Failed to fetch disk stats');
        const stats = await response.json();
        return stats;
    } catch (err) {
        console.error('Error loading disk stats:', err);
        return { total: 512, used: 128, free: 384, percent: 25 }; // fallback
    }
}

// ==================== Load CPU stats ====================
async function loadCpuStats() {
    try {
        const response = await fetch('/api/system/cpu');
        if (!response.ok) throw new Error('Failed to fetch CPU stats');
        const stats = await response.json();
        return stats;
    } catch (err) {
        console.error('Error loading CPU stats:', err);
        return { usagePercent: 12, cores: 8, speed: '3.6 GHz' }; // fallback
    }
}

// ==================== Load RAM stats ====================
async function loadRamStats() {
    try {
        const response = await fetch('/api/system/ram');
        if (!response.ok) throw new Error('Failed to fetch RAM stats');
        const stats = await response.json();
        return stats;
    } catch (err) {
        console.error('Error loading RAM stats:', err);
        return { total: 16, used: 4.2, free: 11.8, percent: 26 }; // fallback
    }
}

// ==================== Extract dominant color from image ====================
function getDominantColor(imageUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 20) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        callback(`rgb(${r}, ${g}, ${b})`);
    };
    img.onerror = () => callback('rgb(96, 205, 255)');
    img.src = imageUrl;
}

// ==================== Update profile card ====================
function updateProfileCard(username, avatarUrl, accentColor) {
    const profileName = document.querySelector('#page-system .profile-name');
    const profileSub = document.querySelector('#page-system .profile-sub');
    const profileAvatarDiv = document.querySelector('#page-system .profile-avatar');
    const profileCard = document.querySelector('#page-system .profile-card');

    if (profileName) profileName.textContent = username;
    if (profileSub) profileSub.textContent = 'Local Account · Administrator';

    if (avatarUrl && avatarUrl !== '') {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        if (profileAvatarDiv) {
            profileAvatarDiv.innerHTML = '';
            profileAvatarDiv.appendChild(img);
        }
    }

    if (profileCard && accentColor) {
        const rgbMatch = accentColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [r,g,b] = rgbMatch.slice(1);
            profileCard.style.background = `linear-gradient(135deg, rgba(${r},${g},${b},0.15), rgba(${r},${g},${b},0.02))`;
            profileCard.style.borderColor = `rgba(${r},${g},${b},0.3)`;
        } else {
            profileCard.style.background = `linear-gradient(135deg, rgba(96,205,255,0.08), rgba(96,205,255,0.02))`;
        }
    }
}

// ==================== Update CPU stats in System page ====================
async function updateCpuStats() {
    const stats = await loadCpuStats();
    const cpuValueEl = document.querySelector('#page-system .stat-card:first-child .stat-value');
    const cpuSubEl = document.querySelector('#page-system .stat-card:first-child .stat-sub');
    const cpuFillEl = document.querySelector('#page-system .stat-card:first-child .progress-fill');

    if (cpuValueEl) cpuValueEl.textContent = `${stats.usagePercent}%`;
    if (cpuSubEl) cpuSubEl.textContent = stats.speed ? `${stats.cores}-Core · ${stats.speed}` : `${stats.cores} Cores`;
    if (cpuFillEl) {
        cpuFillEl.style.width = `${stats.usagePercent}%`;
        if (stats.usagePercent > 80) cpuFillEl.classList.add('warn');
        else cpuFillEl.classList.remove('warn');
    }
}

// ==================== Update RAM stats in System page ====================
async function updateRamStats() {
    const stats = await loadRamStats();
    const ramValueEl = document.querySelector('#page-system .stat-card:nth-child(2) .stat-value');
    const ramSubEl = document.querySelector('#page-system .stat-card:nth-child(2) .stat-sub');
    const ramFillEl = document.querySelector('#page-system .stat-card:nth-child(2) .progress-fill');

    if (ramValueEl) ramValueEl.textContent = `${stats.used} GB`;
    if (ramSubEl) ramSubEl.textContent = `of ${stats.total} GB used`;
    if (ramFillEl) {
        ramFillEl.style.width = `${stats.percent}%`;
        if (stats.percent > 80) ramFillEl.classList.add('warn');
        else ramFillEl.classList.remove('warn');
    }
}

// ==================== Update disk stats in System page ====================
async function updateDiskStats() {
    const stats = await loadDiskStats();
    const diskValueEl = document.querySelector('#page-system .stat-card:nth-child(3) .stat-value');
    const diskSubEl = document.querySelector('#page-system .stat-card:nth-child(3) .stat-sub');
    const diskFillEl = document.querySelector('#page-system .stat-card:nth-child(3) .progress-fill');

    if (diskValueEl) diskValueEl.textContent = `${stats.used} GB`;
    if (diskSubEl) diskSubEl.textContent = `of ${stats.total} GB used`;
    if (diskFillEl) {
        diskFillEl.style.width = `${stats.percent}%`;
        if (stats.percent > 80) diskFillEl.classList.add('warn');
        else diskFillEl.classList.remove('warn');
    }
}

// ==================== Handle Manage Account button ====================
function handleManageAccount() {
    navigate('accounts');
}

// ==================== Initialize System page ====================
export async function initSystem() {
    // 1. Load user data and apply avatar accent color
    const user = await loadUserData();
    let avatarUrl = user.avatar || '';
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
        avatarUrl = '/' + avatarUrl; // make absolute path
    }
    getDominantColor(avatarUrl, (accentColor) => {
        updateProfileCard(user.username, avatarUrl, accentColor);
    });

    // 2. Load hardware stats (CPU, RAM, Disk)
    await updateCpuStats();
    await updateRamStats();
    await updateDiskStats();

    // 3. Refresh stats every 5 seconds
    setInterval(updateCpuStats, 5000);
    setInterval(updateRamStats, 5000);
    setInterval(updateDiskStats, 10000); // disk changes less frequently

    // 4. Attach Manage Account button event
    const manageBtn = document.querySelector('#page-system .profile-btn');
    if (manageBtn) {
        manageBtn.removeEventListener('click', handleManageAccount);
        manageBtn.addEventListener('click', handleManageAccount);
    }
}
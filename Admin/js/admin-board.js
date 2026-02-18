/**
 * NAPPS COMMAND ENGINE V3.2
 */

const API_PATH = '/.netlify/functions/api';
let masterData = { schools: [], teachers: [], executives: [] };
let activeTab = 'schools';

// --- 1. BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById('actualPin');
    const gate = document.getElementById('gatekeeper');

    // Always focus the hidden input
    const focusPin = () => pinInput.focus();
    gate.addEventListener('click', focusPin);
    focusPin();

    // PIN logic
    pinInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i < val.length));

        if (val === "2024" || val === "2026") {
            unlockSystem();
        } else if (val.length === 4) {
            e.target.value = '';
            dots.forEach(d => d.classList.remove('active'));
        }
    });

    const addForm = document.getElementById('addForm');
    if (addForm) addForm.onsubmit = handleAdd;
});

// --- 2. SECURITY ---
function pressKey(key) {
    const input = document.getElementById('actualPin');
    if (key === 'back') input.value = input.value.slice(0, -1);
    else if (input.value.length < 4) input.value += key;
    input.dispatchEvent(new Event('input'));
}

function unlockSystem() {
    document.getElementById('gatekeeper').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('gatekeeper').style.display = 'none';
        document.getElementById('app').style.display = 'grid';
        loadAllData();
    }, 600);
}

// --- 3. DATA ENGINE ---
async function loadAllData() {
    updateLoader(true);
    const types = ['schools', 'teachers', 'executives'];
    try {
        const results = await Promise.all(types.map(t => fetch(`${API_PATH}?type=${t}`).then(r => r.json())));
        types.forEach((t, i) => masterData[t] = results[i]);
        updateStats();
        renderGrid();
    } catch (e) { console.error("Sync Error", e); }
    updateLoader(false);
}

function updateStats() {
    const sRev = masterData.schools.filter(s => s.status === 'verified').length * 5000;
    const tRev = masterData.teachers.filter(t => t.status === 'verified').length * 1000;
    
    animateValue("schoolVal", 0, masterData.schools.length, 800);
    animateValue("teacherVal", 0, masterData.teachers.length, 800);
    animateValue("revVal", 0, (sRev + tRev), 1000, true);
}

// --- 4. UI RENDERING ---
function renderGrid() {
    const container = document.getElementById('grid-container');
    const data = masterData[activeTab] || [];
    
    container.innerHTML = data.map(item => `
        <div class="exec-card">
            <div style="padding:20px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span class="status-pill" style="background:rgba(${item.status === 'verified' ? '16,185,129,0.1':'197,160,40,0.1'}); color:${item.status === 'verified' ? 'var(--success)':'var(--gold)'}">
                        ${item.status.toUpperCase()}
                    </span>
                    <i class="fas fa-ellipsis-h" style="color:var(--text-dim)"></i>
                </div>
                <h3 style="font-family:'Cormorant Garamond'; font-size:1.4rem; margin-bottom:5px;">${item.name || item.school}</h3>
                <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:15px;">${item.location || item.role || item.subject}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <button onclick="handleVerify('${activeTab}', '${item.id}')" class="btn-action" style="font-size:0.6rem; background:var(--primary); color:var(--gold);">APPROVE</button>
                    <button onclick="handleDelete('${activeTab}', '${item.id}')" class="btn-action" style="font-size:0.6rem; background:rgba(239,68,68,0.1); color:var(--danger);">DELETE</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 5. ACTIONS ---
async function handleVerify(type, id) {
    updateLoader(true);
    await fetch(API_PATH, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type, action: 'verify', id })
    });
    loadAllData();
}

async function handleDelete(type, id) {
    if(!confirm("Delete record?")) return;
    await fetch(API_PATH, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type, action: 'delete', id })
    });
    loadAllData();
}

async function handleAdd(e) {
    e.preventDefault();
    const type = document.getElementById('fType').value;
    const payload = {
        type, action: 'register',
        data: {
            name: document.getElementById('fName').value,
            school: document.getElementById('fName').value,
            location: document.getElementById('fDetail').value,
            role: document.getElementById('fDetail').value,
            phone: document.getElementById('fPhone').value,
            status: 'verified'
        }
    };
    await fetch(API_PATH, { method: 'POST', body: JSON.stringify(payload) });
    toggleDrawer(false);
    loadAllData();
}

// --- UTILS ---
function switchNav(tab) {
    activeTab = tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderGrid();
}

function toggleDrawer(open) { document.getElementById('sysDrawer').classList.toggle('open', open); }
function updateLoader(show) { document.getElementById('loadBar').style.width = show ? '100%' : '0%'; }

function animateValue(id, start, end, duration, currency = false) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        obj.innerHTML = currency ? `₦${val.toLocaleString()}` : val.toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}
// Global State
let currentRegistry = [];

/**
 * 1. INITIALIZE COMMAND CENTER
 */
async function loadAllData() {
    simulateLoad(); // Visual feedback
    
    try {
        const response = await fetch('/api/admin/dashboard'); 
        const data = await response.json();
        
        // Update Stats with Animation
        animateValue("revVal", 0, data.stats.revenue, 1500, true);
        animateValue("schoolVal", 0, data.stats.schools, 1000);
        animateValue("teacherVal", 0, data.stats.teachers, 1000);
        
        currentRegistry = data.registry;
        renderRegistry('schools'); // Default view
        
    } catch (error) {
        console.error("System Sync Failed:", error);
        // Fallback for demo purposes if API isn't live
        showNotification("Sync Failed. Using Local Cache.", "error");
    }
}

/**
 * 2. DYNAMIC CARD MAPPING
 */
function renderRegistry(filterType) {
    const container = document.getElementById('grid-container');
    const filteredData = currentRegistry.filter(item => item.type === filterType);
    
    container.innerHTML = filteredData.map(item => `
        <div class="exec-card" data-id="${item.id}">
            <div style="padding: 25px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                    <div class="status-pill" style="background:${item.status === 'verified' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color:${item.status === 'verified' ? 'var(--success)' : 'var(--danger)'}">
                        ${item.status.toUpperCase()}
                    </div>
                    <i class="fas fa-ellipsis-v" style="color:var(--text-dim); cursor:pointer;"></i>
                </div>
                
                <h4 style="font-family:'Cormorant Garamond'; font-size:1.4rem; margin-bottom:5px;">${item.name}</h4>
                <p style="font-size:0.8rem; color:var(--text-dim); margin-bottom:20px;">
                    <i class="fas fa-map-marker-alt" style="color:var(--gold); margin-right:5px;"></i> ${item.detail}
                </p>
                
                <div style="display:flex; gap:10px; border-top:1px solid var(--glass-border); padding-top:20px;">
                    <button onclick="handleVerify('${item.id}')" class="btn-action" style="flex:1; font-size:0.6rem; padding:10px; background:var(--primary); color:var(--gold);">
                        APPROVE
                    </button>
                    <button onclick="viewProfile('${item.id}')" class="btn-action" style="flex:1; font-size:0.6rem; padding:10px; background:transparent; border:1px solid var(--glass-border); color:white;">
                        DETAILS
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 3. NUMBER ANIMATION (The "Executive" touch)
 */
function animateValue(id, start, end, duration, isCurrency = false) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        obj.innerHTML = isCurrency 
            ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
            : value.toLocaleString();
            
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
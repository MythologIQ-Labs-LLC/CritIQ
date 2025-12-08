// FailSafe Dashboard Logic (IPC Mode)

const vscode = acquireVsCodeApi();
let currentTaskId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('FailSafe Dashboard initialized (IPC Mode)');
    
    // Initialize Mermaid
    mermaid.initialize({ 
        startOnLoad: false, 
        theme: 'dark',
        securityLevel: 'loose'
    });

    // Start polling via IPC
    setInterval(() => vscode.postMessage({ type: 'getStatus' }), 2000);
    vscode.postMessage({ type: 'getStatus' }); // Initial fetch
    
    // Fetch Graph
    fetchGraph();

    // Button Listeners
    const btnComplete = document.getElementById('btn-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            if (currentTaskId) {
               vscode.postMessage({ type: 'completeTask', taskId: currentTaskId });
            }
        });
    }
});

function fetchGraph() {
    // In IPC mode, we might need a dedicated message or just fetch via HTTP if server is local 
    // BUT we are in a webview. We can't hit localhost:3000 easily unless we proxy.
    // HOWEVER, the plan said "Fetch graph from /api/project/graph". 
    // If the ViewProvider manages content, we're good.
    // Wait, the ViewProvider uses IPC logic for status, but the plan proposed an API route.
    // Let's use fetch since the server is running on localhost:port? 
    // Actually, CSP might block XHR to localhost unless we add it. 
    // BETTER: Use IPC to ask for the graph string to keep it clean.
    
    // LET'S STICK TO THE PLAN: The plan mentioned updating index.ts to add the route.
    // But accessing it from Webview requires localhost access. 
    // Let's see if we can just fetch it. 
    // We don't have the port in the frontend app.js. 
    // I will add a 'getGraph' IPC message handling instead to be safe and consistent with existing patterns.
    // Checking DashboardViewProvider.ts... it handles 'getStatus' and 'completeTask'.
    // I should probably update DashboardViewProvider to handle 'getGraph' too.
    
    vscode.postMessage({ type: 'getGraph' });
}

// Handle Incoming Messages
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'statusUpdate':
            updateDashboard(message.data);
            break;
        case 'taskCompleted':
            console.log('Task completed:', message.data);
            // Refresh after completion
            vscode.postMessage({ type: 'getStatus' });
            // Also refresh graph
            vscode.postMessage({ type: 'getGraph' });
            break;
        case 'graphUpdate':
            renderGraph(message.data.graph);
            break;
    }
});

function renderGraph(graphDef) {
    const container = document.getElementById('mind-map-container');
    if (container) {
        // Clear previous
        container.innerHTML = `<div class="mermaid">${graphDef}</div>`;
        try {
            mermaid.init(undefined, container.querySelectorAll('.mermaid'));
        } catch (e) {
            console.error('Mermaid render error:', e);
            container.innerText = 'Graph Error';
        }
    }
}

function updateDashboard(data) {
    const taskNameEl = document.getElementById('current-task-name');
    const badgeEl = document.getElementById('task-status-badge');
    const timerEl = document.getElementById('task-timer');
    const serverStatusDot = document.querySelector('#server-status .dot');
    const brainStatusDot = document.querySelector('#brain-status .dot');

    // Mark as connected since we received a message
    if (serverStatusDot) serverStatusDot.style.backgroundColor = '#3fb950';
    if (brainStatusDot) brainStatusDot.style.backgroundColor = '#3fb950';

    if (data.currentTask) {
        currentTaskId = data.currentTask.id;
        if (taskNameEl) taskNameEl.textContent = data.currentTask.name;
        if (badgeEl) {
            badgeEl.textContent = 'Active';
            badgeEl.style.backgroundColor = 'var(--accent-primary)';
        }
        
        // Update Timer
        if (data.currentTask.startTime) {
            const start = new Date(data.currentTask.startTime).getTime();
            const now = Date.now();
            const diff = now - start;
            
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            if (timerEl) {
                timerEl.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    } else {
        currentTaskId = null;
        if (taskNameEl) taskNameEl.textContent = data.nextTask ? `Next: ${data.nextTask.name}` : 'All Tasks Completed';
        if (badgeEl) {
             badgeEl.textContent = 'Idle';
             badgeEl.style.backgroundColor = 'grey';
        }
        if (timerEl) timerEl.textContent = '00:00:00';
    }
}

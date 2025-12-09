// FailSafe Dashboard Logic (Universal Bridge Mode)

class TransportAdapter {
    constructor() {
        this.mode = 'unknown';
        this.vscode = null;
        this.listeners = new Set();
        
        try {
            this.vscode = acquireVsCodeApi();
            this.mode = 'ipc';
            console.log('[Transport] Mode: IPC (VS Code)');
        } catch (e) {
            this.mode = 'http';
            console.log('[Transport] Mode: HTTP (Browser/Standalone)');
        }
        
        // Setup Incoming Listeners
        if (this.mode === 'ipc') {
            window.addEventListener('message', event => this.dispatch(event.data));
        } else {
            // Polling for HTTP mode (Simple fallback)
            setInterval(() => this.poll(), 2000);
        }
    }

    send(type, payload = {}) {
        if (this.mode === 'ipc') {
            this.vscode.postMessage({ type, payload });
        } else {
            // HTTP Fetch Router
            let endpoint = '/api/command';
            let method = 'POST';
            
            if (type === 'getGraph') {
                endpoint = '/api/project/graph/d3'; // Switch to D3
                method = 'GET';
            } else if (type === 'cortexQuery') {
                endpoint = '/api/cortex/query';
            }

            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };

            if (method === 'POST') {
                options.body = JSON.stringify(type === 'cortexQuery' ? payload : { type, payload });
            }

            fetch(endpoint, options)
                .then(res => res.json())
                .then(data => {
                    // Self-dispatch events based on response
                    if (type === 'getGraph') {
                        this.dispatch({ type: 'graphUpdate', payload: { graph: data } });
                    } else if (type === 'cortexQuery') {
                        this.dispatch({ type: 'cortexResponse', payload: data });
                    }
                })
                .catch(err => console.error('[Transport] Send Error:', err));
        }
    }

    on(callback) {
        this.listeners.add(callback);
    }

    dispatch(message) {
        this.listeners.forEach(cb => cb(message));
    }

    async poll() {
        try {
            const res = await fetch('/api/events'); // Mock endpoint for polling
            const events = await res.json();
            events.forEach(e => this.dispatch(e));
        } catch (e) {
            // console.debug('Poll failed (expected if local file)');
        }
    }
}

const transport = new TransportAdapter();
let currentTaskId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('FailSafe Dashboard initialized');
    
    // Initialize Mermaid
    mermaid.initialize({ 
        startOnLoad: false, 
        theme: 'dark',
        securityLevel: 'loose'
    });

    // Initial State Request
    transport.send('requestInitialState');
    transport.send('getGraph');

    // Subscribe to Transport
    transport.on(message => {
        switch (message.type) {
            case 'statusUpdate':
                if (message.payload) updateDashboard(message.payload);
                break;
            case 'taskCompleted':
                transport.send('getGraph');
                break;
            case 'graphUpdate':
                if (message.payload && message.payload.graph) {
                    renderGraph(message.payload.graph);
                }
                break;
            case 'cortexResponse':
                handleCortexResponse(message.payload);
                break;
        }
    });

function handleCortexResponse(data) {
    const { intent } = data;
    logStream(`Cortex intent: ${intent.action} (${Math.round(intent.confidence * 100)}%)`);

    // --- DEMO LOGIC FOR VISUAL STATES ---
    if (intent.action === 'cortex_search') {
        setGraphState('INDEXING');
        logStream('Indexing knowledge graph...', 'highlight');
        setTimeout(() => {
             logStream('Found 3 relevant nodes.');
             // Optional: Highlight specific nodes if we had entity extraction
        }, 1500);
    } else if (intent.action === 'audit_workspace') {
        setGraphState('BLOCKED');
        logStream('CRITICAL: Circular Dependency detected in "AuthService"', 'error');
        showBlockerAlert({
            title: 'Circular Dependency',
            details: 'src/utils/auth.js -> src/components/Login.tsx -> src/utils/auth.js'
        });
    } else if (intent.action === 'get_status') {
        setGraphState('RESOLVED');
        logStream('System Verified. Stable.', 'highlight');
        // Update badge
        const badge = document.getElementById('task-status-badge');
        if (badge) {
             badge.textContent = 'KERNEL: ONLINE';
             badge.style.backgroundColor = '#3fb950';
        }
    } else {
        setGraphState('IDLE');
    }
}

function logStream(msg, type = 'info') {
    const stream = document.getElementById('notification-stream');
    if (!stream) return;
    
    const div = document.createElement('div');
    div.className = `notification-item ${type}`;
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    div.innerHTML = `<span class="time">[${time}]</span> <span class="msg">${msg}</span>`;
    
    stream.prepend(div);
}

function showBlockerAlert(data) {
    const overlay = document.getElementById('genesis-lab');
    if (!overlay) return;
    
    // Transform Overlay to Alert Mode
    overlay.classList.remove('hidden');
    overlay.classList.add('prism-alert');
    
    // Inject Alert Content
    const container = overlay.querySelector('.genesis-container');
    container.innerHTML = `
        <header class="genesis-header">
            <h2 style="color: #ff4d4d;">⚠️ TASK BLOCKED</h2>
            <button class="btn-close" onclick="closeAlert()">×</button>
        </header>
        <div class="provocation-box" style="border-color: #ff4d4d; background: rgba(255, 77, 77, 0.1);">
            <div class="alert-icon">⚡</div>
            <h3 style="color: #ff4d4d;">${data.title}</h3>
            <p style="color: #ff9e9e;">${data.details}</p>
        </div>
        <div class="step-actions">
            <button class="btn btn-primary" style="background: #ff4d4d; border: none;" onclick="resolveBlocker()">Auto-Resolve</button>
        </div>
    `;
}

// Global helpers for inline onclicks (quick hack for demo stability)
window.closeAlert = () => {
    document.getElementById('genesis-lab').classList.add('hidden');
    document.getElementById('genesis-lab').classList.remove('prism-alert');
};

window.resolveBlocker = () => {
    window.closeAlert();
    logStream('Applying fix for circular dependency...', 'highlight');
    setTimeout(() => {
        setGraphState('RESOLVED');
        logStream('SUCCESS: Circular Dependency resolved.', 'highlight');
    }, 1000);
};

    // Button Listeners
    const btnComplete = document.getElementById('btn-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            if (currentTaskId) {
               transport.send('completeTask', { taskId: currentTaskId });
            }
        });
    }
    // Genesis Wizard Logic
    initGenesisWizard();
    
    // Omnibar Logic
    const omnibar = document.getElementById('cortex-search-input');
    if (omnibar) {
        omnibar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = omnibar.value;
                if (query) {
                    transport.send('cortexQuery', { query });
                    omnibar.value = ''; // Clear but maybe keep a history?
                    // temporarily show loading state
                    const stream = document.getElementById('notification-stream');
                    if(stream) {
                         const div = document.createElement('div');
                         div.className = 'notification-item';
                         div.innerHTML = `<span class="time">Now</span><span class="msg">Scouting: "${query}"...</span>`;
                         stream.prepend(div);
                    }
                }
            }
        });
    }
});

function initGenesisWizard() {
    const overlay = document.getElementById('genesis-lab');
    const fab = document.createElement('button');
    fab.className = 'fab-genesis';
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>`;
    fab.title = 'New Genesis Spark';
    document.body.appendChild(fab);

    // Toggle Overlay
    fab.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        resetWizard();
    });

    document.getElementById('btn-close-genesis').addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    // Wizard Navigation
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextId = btn.getAttribute('data-next');
            setActiveStep(nextId);
            updatePreview();
        });
    });

    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevId = btn.getAttribute('data-prev');
            setActiveStep(prevId);
        });
    });

    // Oblique Strategies
    const strategies = [
        "What if this feature had zero UI?",
        "What if this was a physical game?",
        "What if the user was 5 years old?",
        "What if this had to be done in 10 seconds?",
        "What if you could only use sound?",
        "What if this was a subscription text message service?",
        "What if this deleted the user's data on failure?"
    ];

    document.getElementById('btn-new-prompt').addEventListener('click', () => {
        const prompt = strategies[Math.floor(Math.random() * strategies.length)];
        document.getElementById('prism-prompt').textContent = `"${prompt}"`;
    });

    // Crystallize (Submit)
    document.getElementById('btn-crystallize').addEventListener('click', () => {
        const concept = gatherConceptData();
        if (concept) {
            transport.send('crystallizeConcept', { concept });
            overlay.classList.add('hidden');
            // Ideally show a success animation or toast
        }
    });

    // Live Preview Update on Input
    const inputs = overlay.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Debounce slightly
            clearTimeout(input.previewTimeout);
            input.previewTimeout = setTimeout(updatePreview, 500);
        });
    });
}

function resetWizard() {
    setActiveStep('step-prism');
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    document.getElementById('prism-prompt').textContent = '"A generic prompt..."';
    updatePreview(); 
}

function setActiveStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    // Show target
    document.getElementById(stepId).classList.add('active');
    
    // Update Progress Bar
    const stepNum = stepId === 'step-prism' ? 1 : stepId === 'step-core' ? 2 : 3;
    document.querySelectorAll('.wizard-progress .step').forEach(s => {
        const num = parseInt(s.getAttribute('data-step'));
        if (num <= stepNum) s.classList.add('active');
        else s.classList.remove('active');
    });
}

function gatherConceptData() {
    return {
        id: 'draft_' + Date.now(),
        featureName: 'New Genesis Spark', // Could add a field for this
        prism: {
            provocations: [document.getElementById('prism-prompt').textContent],
            impossibleIdeas: [
                document.getElementById('prism-input-1').value,
                document.getElementById('prism-input-2').value,
                document.getElementById('prism-input-3').value
            ].filter(i => i)
        },
        strategy: {
            pain: document.getElementById('core-pain').value,
            value: document.getElementById('core-value').value,
            antiGoal: document.getElementById('core-anti').value
        },
        immersion: {
            tools: document.getElementById('immerse-tools').value.split(',').map(t => t.trim()).filter(t => t),
            workspaceZoom: document.getElementById('immerse-zoom').value,
            feeling: document.getElementById('immerse-feeling').value
        },
        status: 'draft'
    };
}

function updatePreview() {
    const concept = gatherConceptData();
    const graphDef = generateConceptPreview(concept);
    const container = document.getElementById('genesis-preview-graph');
    
    container.innerHTML = `<div class="mermaid">${graphDef}</div>`;
    try {
        mermaid.init(undefined, container.querySelectorAll('.mermaid'));
    } catch (e) {
        console.error('Mermaid render error:', e);
    }
}

function generateConceptPreview(concept) {
    let graph = 'graph LR;\n'; 
    
    // Helper to sanitize strings for mermaid
    const clean = (str) => {
        if (!str) return '...';
        const sanitized = str.replace(/["()]/g, '').trim().substring(0, 200);
        // Word wrap every 30 chars
        return sanitized.replace(/(.{1,30})(?:\s+|$)/g, '$1\\n');
    };

    // Define Styles
    graph += 'classDef core fill:#6a1b9a,stroke:#4a148c,stroke-width:3px,color:#fff;\n'; 
    graph += 'classDef prism fill:#00695c,stroke:#004d40,stroke-width:2px,color:#fff;\n'; 
    graph += 'classDef immersion fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff;\n'; 
    graph += 'classDef value fill:#ef6c00,stroke:#e65100,stroke-width:2px,color:#fff;\n'; 

    const rootId = 'root';
    const rootLabel = concept.featureName ? clean(concept.featureName) : 'New Spark';
    graph += `${rootId}(("${rootLabel}")):::core;\n`;

    // Strategy
    const stratId = 'strategy';
    graph += `${stratId}[Strategic Core]:::core;\n`;
    graph += `${rootId} --> ${stratId};\n`;
    
    if (concept.strategy.pain) graph += `pain["Pain: ${clean(concept.strategy.pain)}"]:::value;\n${stratId} --> pain;\n`;
    if (concept.strategy.value) graph += `value["Value: ${clean(concept.strategy.value)}"]:::value;\n${stratId} --> value;\n`;
    if (concept.strategy.antiGoal) graph += `anti["Anti-Goal: ${clean(concept.strategy.antiGoal)}"]:::value;\n${stratId} --> anti;\n`;

    // Immersion
    const immerseId = 'immersion';
    graph += `${immerseId}[Immersion]:::immersion;\n`;
    graph += `${rootId} --> ${immerseId};\n`;
    
    if (concept.immersion.feeling) graph += `feel("Feeling: ${clean(concept.immersion.feeling)}"):::immersion;\n${immerseId} --> feel;\n`;
    if (concept.immersion.workspaceZoom) graph += `zoom("Zoom: ${clean(concept.immersion.workspaceZoom)}"):::immersion;\n${immerseId} --> zoom;\n`;

    if (concept.immersion.tools) {
        concept.immersion.tools.forEach((tool, i) => {
             graph += `tool_${i}("Tool: ${clean(tool)}"):::immersion;\n${immerseId} --> tool_${i};\n`;
        });
    }

    // Prism
    const prismId = 'prism';
    graph += `${prismId}[The Prism]:::prism;\n`;
    graph += `${rootId} --> ${prismId};\n`;
    
    if (concept.prism.impossibleIdeas) {
        concept.prism.impossibleIdeas.forEach((idea, i) => {
            if (idea) graph += `idea_${i}[/"${clean(idea)}"/]:::prism;\n${prismId} --> idea_${i};\n`;
        });
    }

    return graph;
}

function fetchGraph() {
    transport.send('getGraph');
}

// Event listener handled by TransportAdapter


// --- Living Graph Logic ---
let simulation;
let graphState = 'IDLE'; // IDLE, INDEXING, BLOCKED, RESOLVED

function setGraphState(newState) {
    graphState = newState;
    const container = document.getElementById('living-graph');
    
    // UI Effects
    if (newState === 'BLOCKED') {
        document.body.classList.add('state-blocked');
        if (simulation) simulation.alphaTarget(0.3).restart(); // Agitate
    } else {
        document.body.classList.remove('state-blocked');
        if (simulation && newState === 'RESOLVED') {
            simulation.alphaTarget(0).restart();
        }
    }

    // Trigger visual updates in D3 (requires access to d3 selections, handled in render)
    d3.selectAll('.node circle').transition().duration(500)
        .attr('fill', d => getNodeColor(d, newState));
        
    d3.selectAll('.link line').transition().duration(500)
        .attr('stroke', newState === 'BLOCKED' ? '#ff4d4d' : '#999');
}

function getNodeColor(node, state) {
    if (state === 'BLOCKED') return '#ff4d4d'; // Red
    if (state === 'RESOLVED') return '#3fb950'; // Green
    if (state === 'INDEXING') return '#ffd700'; // Gold
    // Default (Idle) - Differentiate by type
    return node.type === 'file' ? '#58a6ff' : '#d2a8ff'; // Blue / Purple
}

function renderGraph(graphData) {
    const container = document.getElementById('living-graph');
    if (!container || !graphData || !window.d3) return;

    // Clear previous
    container.innerHTML = '';
    
    const width = container.clientWidth;
    const height = 400;

    const svg = d3.select('#living-graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    // Defs for glow effects
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Simulation Setup
    simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(100))
        .force('charge', d3.forceBody(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(20));

    // Links Layer
    const linkGroup = svg.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
        .data(graphData.edges)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5);

    // Nodes Layer
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
        .data(graphData.nodes)
        .join('g')
        .call(drag(simulation));

    // Node Circles
    node.append('circle')
        .attr('r', 6)
        .attr('fill', d => getNodeColor(d, graphState))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('filter', 'url(#glow)') // Apply glow
        .on('mouseover', function(event, d) {
             d3.select(this).transition().duration(200).attr('r', 10);
             showTooltip(event, d.id);
        })
        .on('mouseout', function() {
             d3.select(this).transition().duration(200).attr('r', 6);
             hideTooltip();
        });

    // Labels
    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => d.name || d.id.split('/').pop())
        .attr('fill', '#ccc')
        .style('font-size', '10px')
        .style('pointer-events', 'none');

    // Tooltip Helper
    const tooltip = d3.select('body').append('div').attr('class', 'graph-tooltip').style('opacity', 0);
    function showTooltip(event, text) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(text)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }
    function hideTooltip() {
        tooltip.transition().duration(500).style('opacity', 0);
    }

    // Tick Function
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
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

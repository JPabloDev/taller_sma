// --- Variables Globales ---
let agents = [];
let tasks = [];
let simulationInterval;
let simulationSpeed = 1000; // ms

// Constantes para estados de agentes y tareas
const AGENT_STATUS = {
    FREE: 'free',
    BUSY: 'busy',
    RESTING: 'resting'
};

const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
};

// --- Elementos del DOM ---
const agentsContainer = document.getElementById('agents-container');
const pendingTasksList = document.getElementById('pending-tasks');
const inProgressTasksList = document.getElementById('in-progress-tasks');
const completedTasksList = document.getElementById('completed-tasks');
const pendingCountSpan = document.getElementById('pending-count');
const inProgressCountSpan = document.getElementById('in-progress-count');
const completedCountSpan = document.getElementById('completed-count');
const addAgentBtn = document.getElementById('add-agent-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const resetSimBtn = document.getElementById('reset-sim-btn');
const startSimBtn = document.getElementById('start-sim-btn');
const pauseSimBtn = document.getElementById('pause-sim-btn');
const simSpeedInput = document.getElementById('sim-speed');
const speedValueSpan = document.getElementById('speed-value');
const simulationLogs = document.getElementById('simulation-logs');
const logsSection = document.getElementById('logs-section');

// --- Carga de Datos Iniciales ---
let initialData = {};

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        initialData = data;
        setInitialIds();
        initSimulation();
    })
    .catch(error => console.error('Error al cargar data.json:', error));

// --- Inicialización ---
function initSimulation() {
    agents = initialData.initialAgents.map(a => ({
        ...a,
        // HABILIDADES AHORA SON ARRAYS
        skill: Array.isArray(a.skill) ? a.skill : [a.skill],
        status: AGENT_STATUS.FREE,
        currentTaskId: null,
        restCycles: 0,
        tasksCompleted: 0
    }));

    tasks = initialData.initialTasks.map(t => ({
        ...t,
        status: TASK_STATUS.PENDING,
        assignedTo: null
    }));

    if (simulationLogs) simulationLogs.innerHTML = '';
    updateUI();
}

function resetSimulation() {
    clearInterval(simulationInterval);
    simulationInterval = null;
    startSimBtn.textContent = 'Iniciar Simulación';
    startSimBtn.disabled = false;
    pauseSimBtn.disabled = true;
    initSimulation();
}

// --- Renderizado ---
function renderAgents() {
    agentsContainer.innerHTML = '';
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
            <h4>${agent.name} (${agent.id})</h4>
            <p>Habilidad: <strong>${agent.skill.join(', ')}</strong></p>
            <p>Estado: <span class="agent-status ${agent.status}">
                ${
                    agent.status === AGENT_STATUS.FREE
                        ? 'Libre'
                        : agent.status === AGENT_STATUS.BUSY
                        ? `Ocupado (${agent.currentTaskId})`
                        : `Descansando (${agent.restCycles})`
                }
            </span></p>
            <p>Velocidad: ${agent.speed} U/ciclo</p>
            <p>Tareas Completadas: ${agent.tasksCompleted}</p>
        `;
        agentsContainer.appendChild(agentCard);
    });
}

function renderTasks() {
    pendingTasksList.innerHTML = '';
    inProgressTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    let pending = 0, progress = 0, done = 0;

    tasks.forEach(task => {
        const item = document.createElement('li');
        item.className = `task-item priority-${task.priority.toLowerCase()}`;
        item.innerHTML = `
            <h4>${task.name} (${task.id})</h4>
            <p>Habilidad Requerida: <strong>${task.skillRequired}</strong></p>
            <p>Progreso: ${task.progress.toFixed(0)}%</p>
            <p>Asignado a: ${task.assignedTo || 'Nadie'}</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width:${task.progress}%;"></div>
            </div>
        `;

        if (task.status === TASK_STATUS.PENDING) {
            pendingTasksList.appendChild(item);
            pending++;
        } else if (task.status === TASK_STATUS.IN_PROGRESS) {
            inProgressTasksList.appendChild(item);
            progress++;
        } else {
            completedTasksList.appendChild(item);
            done++;
        }
    });

    pendingCountSpan.textContent = pending;
    inProgressCountSpan.textContent = progress;
    completedCountSpan.textContent = done;
}

function updateUI() {
    renderAgents();
    renderTasks();
}

// --- Lógica Multiagente ---
function agentCycle() {
    agents.forEach(agent => {

        // ================================
        // FATIGA (YA ESTABA IMPLEMENTADO)
        // ================================
        if (agent.status === AGENT_STATUS.RESTING) {
            agent.restCycles--;
            if (agent.restCycles <= 0) {
                agent.status = AGENT_STATUS.FREE;
                logAction(agent.name, 'ha terminado de descansar.');
            }
            return;
        }

        // =====================
        // AGENTE LIBRE
        // =====================
        if (agent.status === AGENT_STATUS.FREE) {

            // ----------------------------------
            // MEJORA 3 — COLABORACIÓN / AYUDA
            // ----------------------------------

            // 3A - Tareas abandonadas con ≥75%
            const helpTasks = tasks.filter(t =>
                t.status === TASK_STATUS.IN_PROGRESS &&
                t.assignedTo === null &&
                t.progress >= t.totalWork * 0.75 &&
                agent.skill.includes(t.skillRequired)
            );

            if (helpTasks.length > 0) {
                const task = helpTasks[0];
                task.assignedTo = agent.name;
                agent.currentTaskId = task.id;
                agent.status = AGENT_STATUS.BUSY;
                logAction(agent.name, `está ayudando con una tarea casi terminada: ${task.name}`);
                return;
            }

            // 3B - Tareas grandes
            const bigTasks = tasks.filter(t =>
                t.status === TASK_STATUS.PENDING &&
                t.totalWork > 150 &&
                agent.skill.includes(t.skillRequired)
            );

            if (bigTasks.length > 0) {
                const task = bigTasks[0];
                task.status = TASK_STATUS.IN_PROGRESS;
                task.assignedTo = agent.name;
                agent.currentTaskId = task.id;
                agent.status = AGENT_STATUS.BUSY;
                logAction(agent.name, `ha tomado una tarea grande: ${task.name}`);
                return;
            }

            // ----------------------------------
            // MEJORA 1 — PRIORIZACIÓN MEJORADA
            // ----------------------------------

            // 1A — Retomar tareas abandonadas
            const abandoned = tasks.filter(t =>
                t.status === TASK_STATUS.IN_PROGRESS &&
                t.assignedTo === null &&
                agent.skill.includes(t.skillRequired)
            );

            if (abandoned.length > 0) {
                const task = abandoned[0];
                task.assignedTo = agent.name;
                agent.currentTaskId = task.id;
                agent.status = AGENT_STATUS.BUSY;
                logAction(agent.name, `ha retomado una tarea abandonada: ${task.name}`);
                return;
            }

            // 1B — Afinidad EXACTA de habilidades
            let matchTasks = tasks.filter(t =>
                t.status === TASK_STATUS.PENDING &&
                agent.skill.includes(t.skillRequired)
            );

            matchTasks.sort((a, b) => {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority])
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                return a.totalWork - b.totalWork;
            });

            if (matchTasks.length > 0) {
                const task = matchTasks[0];
                task.status = TASK_STATUS.IN_PROGRESS;
                task.assignedTo = agent.name;
                agent.currentTaskId = task.id;
                agent.status = AGENT_STATUS.BUSY;
                logAction(agent.name, `ha tomado una tarea acorde a su habilidad: ${task.name}`);
                return;
            }

            // 1C — Si es Fullstack, tomar cualquier tarea pendiente
            if (agent.skill.includes("Fullstack")) {
                let fallback = tasks.filter(t => t.status === TASK_STATUS.PENDING);

                fallback.sort((a, b) => {
                    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority])
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    return a.totalWork - b.totalWork;
                });

                if (fallback.length > 0) {
                    const task = fallback[0];
                    task.status = TASK_STATUS.IN_PROGRESS;
                    task.assignedTo = agent.name;
                    agent.currentTaskId = task.id;
                    agent.status = AGENT_STATUS.BUSY;
                    logAction(agent.name, `ha tomado una tarea como Fullstack flexible: ${task.name}`);
                    return;
                }
            }
        }

        // =====================
        // AGENTE OCUPADO
        // =====================
        if (agent.status === AGENT_STATUS.BUSY && agent.currentTaskId) {
            const task = tasks.find(t => t.id === agent.currentTaskId);

            if (task) {
                task.progress += agent.speed;
                if (task.progress >= task.totalWork) {
                    task.progress = 100;
                    task.status = TASK_STATUS.COMPLETED;
                    logAction(agent.name, `ha COMPLETADO la tarea: ${task.name}`);
                    agent.status = AGENT_STATUS.FREE;
                    agent.currentTaskId = null;
                    agent.tasksCompleted++;

                    // Fatiga
                    if (agent.tasksCompleted >= 3) {
                        agent.status = AGENT_STATUS.RESTING;
                        agent.restCycles = 5;
                        agent.tasksCompleted = 0;
                        logAction(agent.name, `está descansando por fatiga.`);
                    }
                }
            } else {
                agent.status = AGENT_STATUS.FREE;
                agent.currentTaskId = null;
            }
        }
    });

    updateUI();
}

// --- Crear agentes aleatorios ---
let nextAgentId = 0;

function getNextAgentId() {
    return `A${++nextAgentId}`;
}

function addRandomAgent() {
    const name = initialData.possibleAgentNames[Math.floor(Math.random() * initialData.possibleAgentNames.length)];

    // MULTI-HABILIDADES
    const numSkills = Math.floor(Math.random() * 3) + 1;
    let randomSkill = [];
    for (let i = 0; i < numSkills; i++) {
        const skill = initialData.possibleSkills[Math.floor(Math.random() * initialData.possibleSkills.length)];
        if (!randomSkill.includes(skill)) randomSkill.push(skill);
    }

    const speed = Math.floor(Math.random() * 11) + 5;

    const newAgent = {
        id: getNextAgentId(),
        name,
        skill: randomSkill,
        speed,
        status: AGENT_STATUS.FREE,
        currentTaskId: null,
        restCycles: 0,
        tasksCompleted: 0
    };

    agents.push(newAgent);
    updateUI();
    logAction('Sistema', `Agente añadido: ${newAgent.name} (${newAgent.skill.join(', ')})`);
}

// --- Crear tareas ---
let nextTaskId = 0;

function getNextTaskId() {
    return `T${++nextTaskId}`;
}

function addRandomTask() {
    const name = initialData.possibleTaskNames[Math.floor(Math.random() * initialData.possibleTaskNames.length)];
    const skillRequired = initialData.possibleSkills[Math.floor(Math.random() * initialData.possibleSkills.length)];
    const totalWork = Math.floor(Math.random() * 151) + 50;
    const priority = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];

    const newTask = {
        id: getNextTaskId(),
        name,
        skillRequired,
        progress: 0,
        totalWork,
        priority,
        status: TASK_STATUS.PENDING,
        assignedTo: null
    };

    tasks.push(newTask);
    updateUI();
    logAction('Sistema', `Nueva tarea añadida: ${newTask.name} (${newTask.priority})`);
}

// --- Control de Simulación ---
function startSimulation() {
    if (!simulationInterval) {
        simulationInterval = setInterval(agentCycle, simulationSpeed);
        startSimBtn.textContent = 'Reanudar Simulación';
        startSimBtn.disabled = true;
        pauseSimBtn.disabled = false;
        logAction('Sistema', 'Simulación iniciada.');
        logsSection.style.display = 'block';
    }
}

function pauseSimulation() {
    clearInterval(simulationInterval);
    simulationInterval = null;
    startSimBtn.disabled = false;
    pauseSimBtn.disabled = true;
    startSimBtn.textContent = 'Reanudar Simulación';
    logAction('Sistema', 'Simulación pausada.');
}

function updateSimulationSpeed() {
    simulationSpeed = parseInt(simSpeedInput.value);
    const speedFactor = (2000 / simulationSpeed).toFixed(1);
    speedValueSpan.textContent = `${speedFactor}x`;
    if (simulationInterval) {
        pauseSimulation();
        startSimulation();
    }
}

// --- Logs ---
function logAction(actor, message) {
    if (simulationLogs) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.innerHTML = `<strong>[${timestamp}] ${actor}:</strong> ${message}`;
        simulationLogs.prepend(logEntry);

        if (simulationLogs.children.length > 50) {
            simulationLogs.removeChild(simulationLogs.lastChild);
        }
    }
}

// --- Listeners ---
addAgentBtn.addEventListener('click', addRandomAgent);
addTaskBtn.addEventListener('click', addRandomTask);
resetSimBtn.addEventListener('click', resetSimulation);
startSimBtn.addEventListener('click', startSimulation);
pauseSimBtn.addEventListener('click', pauseSimulation);
simSpeedInput.addEventListener('input', updateSimulationSpeed);

// --- IDs iniciales ---
function setInitialIds() {
    if (initialData.initialAgents.length > 0) {
        nextAgentId = Math.max(...initialData.initialAgents.map(a => parseInt(a.id.substring(1)))) || 0;
    }
    if (initialData.initialTasks.length > 0) {
        nextTaskId = Math.max(...initialData.initialTasks.map(t => parseInt(t.id.substring(1)))) || 0;
    }
}

pauseSimBtn.disabled = true;
speedValueSpan.textContent = `${(2000 / simSpeedInput.value).toFixed(1)}x`;
logsSection.style.display = 'none';

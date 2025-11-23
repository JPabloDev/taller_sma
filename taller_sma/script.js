// --- Variables Globales ---
let agents = [];
let tasks = [];
let simulationInterval;
let simulationSpeed = 1000; // ms
// Constantes para estados de agentes y tareas
const AGENT_STATUS = {
    FREE: 'free',
    BUSY: 'busy',
    RESTING: 'resting' // Nuevo estado para la mejora de fatiga
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
const simulationLogs = document.getElementById('simulation-logs'); // Para la mejora de logs
const logsSection = document.getElementById('logs-section'); // Para mostrar/ocultar logs
// --- Carga de Datos Iniciales desde data.json ---
let initialData = {};
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        initialData = data;
        setInitialIds(); // Asegurarse de que los IDs se inicien correctamente
        initSimulation();
    })
    .catch(error => console.error('Error al cargar data.json:', error));
// --- Funciones de Inicialización y Reseteo ---
function initSimulation() {
    // Clona los datos para no modificar los originales
    agents = initialData.initialAgents.map(a => ({
        ...a,
        status: AGENT_STATUS.FREE,
        currentTaskId: null,
        restCycles: 0, // Para la mejora de fatiga
        tasksCompleted: 0 // Para la mejora de fatiga
    }));
    tasks = initialData.initialTasks.map(t => ({
        ...t, status:
            TASK_STATUS.PENDING, assignedTo: null
    }));
    // Limpiar logs al reiniciar
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
// --- Funciones de Renderizado de UI ---
function renderAgents() {
    agentsContainer.innerHTML = '';
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.innerHTML = `
 <h4>${agent.name} (${agent.id})</h4>
 <p>Habilidad: <strong>${Array.isArray(agent.skill) ?
                agent.skill.join(', ') : agent.skill}</strong></p>
 <p>Estado: <span class="agent-status ${agent.status}">
 ${agent.status === AGENT_STATUS.FREE ? 'Libre' :
                agent.status === AGENT_STATUS.BUSY ? `Ocupado
(${agent.currentTaskId})` :
                    `Descansando (${agent.restCycles})`}
 </span></p>
 <p>Velocidad: ${agent.speed} U/ciclo</p>
 ${agent.tasksCompleted !== undefined ? `<p>Tareas Completadas:
${agent.tasksCompleted}</p>` : ''}
 `;
        agentsContainer.appendChild(agentCard);
    });
}
function renderTasks() {
    pendingTasksList.innerHTML = '';
    inProgressTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item priority-${task.priority.toLowerCase()}`;
        taskItem.innerHTML = `
 <h4>${task.name} (${task.id})</h4>
 <p>Habilidad Requerida: <strong>${task.skillRequired}</strong></p>
 <p>Progreso: ${task.progress.toFixed(0)}%</p>
 <p>Asignado a: ${task.assignedTo || 'Nadie'}</p>
 <div class="progress-bar-container">
 <div class="progress-bar" style="width:
${task.progress}%;"></div>
 </div>
 `;
        if (task.status === TASK_STATUS.PENDING) {
            pendingTasksList.appendChild(taskItem);
            pendingCount++;
        } else if (task.status === TASK_STATUS.IN_PROGRESS) {
            inProgressTasksList.appendChild(taskItem);
            inProgressCount++;
        } else {
            completedTasksList.appendChild(taskItem);
            completedCount++;
        }
    });
    pendingCountSpan.textContent = pendingCount;
    inProgressCountSpan.textContent = inProgressCount;
    completedCountSpan.textContent = completedCount;
}
function updateUI() {
    renderAgents();
    renderTasks();
}
// --- Lógica del Sistema Multiagente (¡Aquí es donde los alumnos trabajarán!) -
--
    function agentCycle() {
        agents.forEach(agent => {
            // --- LÓGICA DE FATIGA (MEJORA OPCIONAL) ---
            // Si el agente está descansando, decrementa su contador de descanso y salta el resto de la lógica.
            if (agent.status === AGENT_STATUS.RESTING) {
                agent.restCycles--;
                if (agent.restCycles <= 0) {
                    agent.status = AGENT_STATUS.FREE;
                    logAction(agent.name, 'ha terminado de descansar y está libre.');
                }
                return; // El agente descansando no hace nada más este ciclo
            }
            if (agent.status === AGENT_STATUS.FREE) {
                // Agente en estado LIBRE: Busca una tarea
                // TODO: Los alumnos deben mejorar esta sección para implementar la
                "Política de Priorización de Tareas Mejorada"
                // y la lógica de "Ayuda/Colaboración Simple".
                // BDI Simplificado (estado actual):
                // Creencias: Agente libre, conoce tareas pendientes, sus habilidades.
                // Deseos: Quiere completar una tarea.
                // Intenciones: Buscar la mejor tarea disponible.
                const availableTasks = tasks.filter(t =>
                    t.status === TASK_STATUS.PENDING &&
                    (Array.isArray(agent.skill) ?
                        agent.skill.includes(t.skillRequired) : t.skillRequired === agent.skill ||
                        agent.skill === 'Fullstack')
                ).sort((a, b) => {
                    // Prioridad actual: Tareas de alta prioridad primero, luego por
                    dificultad(totalWork)
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                        // Mayor prioridad primero
                    }
                    return a.totalWork - b.totalWork; // Menos trabajo primero
                });
                if (availableTasks.length > 0) {
                    const taskToTake = availableTasks[0]; // Toma la tarea de mayor prioridad/menor trabajo
                    taskToTake.status = TASK_STATUS.IN_PROGRESS;
                    taskToTake.assignedTo = agent.name;
                    agent.status = AGENT_STATUS.BUSY;
                    agent.currentTaskId = taskToTake.id;
                    logAction(agent.name, `ha tomado la tarea: ${taskToTake.name}`);
                    // Para la mejora de logs
                }
            } else if (agent.status === AGENT_STATUS.BUSY && agent.currentTaskId) {
                // Agente en estado OCUPADO: Trabaja en su tarea actual
                const currentTask = tasks.find(t => t.id === agent.currentTaskId);
                if (currentTask) {
                    currentTask.progress += agent.speed;
                    if (currentTask.progress >= currentTask.totalWork) {
                        currentTask.progress = 100; // Asegura que el progreso no exceda 100
                        currentTask.status = TASK_STATUS.COMPLETED;
                        agent.status = AGENT_STATUS.FREE;
                        agent.currentTaskId = null;
                        agent.tasksCompleted = (agent.tasksCompleted || 0) + 1; //Incrementa contador para la mejora de fatiga
                        logAction(agent.name, `ha COMPLETADO la tarea:
${currentTask.name}`); // Para la mejora de logs
                        // --- LÓGICA DE FATIGA (MEJORA OPCIONAL) ---
                        // Si ha completado suficientes tareas, que descanse
                        const FATIGUE_THRESHOLD = 3; // Número de tareas antes de
                        descansar
                        const REST_CYCLES = 5; // Ciclos de simulación para descansar
                        if (agent.tasksCompleted >= FATIGUE_THRESHOLD) {
                            agent.status = AGENT_STATUS.RESTING;
                            agent.restCycles = REST_CYCLES;
                            agent.tasksCompleted = 0; // Reiniciar contador de tareas
                            completadas
                            logAction(agent.name, `ha completado ${FATIGUE_THRESHOLD}
tareas y ahora está descansando por ${REST_CYCLES} ciclos.`);
                        }
                    }
                } else {
                    // Caso excepcional: La tarea asignada no existe (ej. fue eliminada)
                    agent.status = AGENT_STATUS.FREE;
                    agent.currentTaskId = null;
                    logAction(agent.name, 'su tarea asignada ya no existe, volviendo al estado libre.'); // Para la mejora de logs
                }
            }
        });
        updateUI(); // Actualiza la interfaz después de cada ciclo de agentes
    }
// --- Funciones para Añadir Agentes/Tareas Dinámicamente ---
let nextAgentId = 0;
function getNextAgentId() {
    return `A${++nextAgentId}`;
}
let nextTaskId = 0;
function getNextTaskId() {
    return `T${++nextTaskId}`;
}
function addRandomAgent() {
    const randomName = initialData.possibleAgentNames[Math.floor(Math.random() *
        initialData.possibleAgentNames.length)];
    // TODO: Los alumnos pueden modificar esta parte para la mejora de "Agentes con Múltiples Habilidades"
    const randomSkill = initialData.possibleSkills[Math.floor(Math.random() *
        initialData.possibleSkills.length)];
    const randomSpeed = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // Velocidad entre 5 y 15
    const newAgent = {
        id: getNextAgentId(),
        name: randomName,
        skill: randomSkill,
        speed: randomSpeed,
        status: AGENT_STATUS.FREE,
        currentTaskId: null,
        restCycles: 0,
        tasksCompleted: 0
    };
    agents.push(newAgent);
    updateUI();
    logAction('Sistema', `Se ha añadido un nuevo agente: ${newAgent.name}
(${newAgent.skill}).`);
}
function addRandomTask() {
    const randomName = initialData.possibleTaskNames[Math.floor(Math.random() *
        initialData.possibleTaskNames.length)];
    const randomSkillRequired =
        initialData.possibleSkills[Math.floor(Math.random() *
            initialData.possibleSkills.length)];
    const randomTotalWork = Math.floor(Math.random() * (200 - 50 + 1)) + 50; //Trabajo entre 50 y 200
    const randomPriority = ['Low', 'Medium', 'High'][Math.floor(Math.random() *
        3)];
    const newTask = {
        id: getNextTaskId(),
        name: randomName,
        skillRequired: randomSkillRequired,
        progress: 0,
        totalWork: randomTotalWork,
        priority: randomPriority,
        status: TASK_STATUS.PENDING,
        assignedTo: null
    };
    tasks.push(newTask);
    updateUI();
    logAction('Sistema', `Se ha añadido una nueva tarea: ${newTask.name}
(Prioridad: ${newTask.priority}).`);
}
// --- Control de la Simulación ---
function startSimulation() {
    if (!simulationInterval) {
        simulationInterval = setInterval(agentCycle, simulationSpeed);
        startSimBtn.textContent = 'Reanudar Simulación';
        startSimBtn.disabled = true;
        pauseSimBtn.disabled = false;
        logAction('Sistema', 'Simulación iniciada.');
        // Mostrar la sección de logs cuando la simulación inicie (si se implementa)
        if (logsSection) logsSection.style.display = 'block';
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
        pauseSimulation(); // Pausa para aplicar la nueva velocidad
        startSimulation();
    }
}
// --- Función para la mejora de "Comunicación Explícita (Logs)" ---
function logAction(actor, message) {
    if (simulationLogs) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.innerHTML = `<strong>[${timestamp}] ${actor}:</strong>
${message}`;
        simulationLogs.prepend(logEntry); // Añadir al principio para ver lo más
        reciente
        // Limitar el número de logs para evitar desbordamiento
        if (simulationLogs.children.length > 50) {
            simulationLogs.removeChild(simulationLogs.lastChild);
        }
    }
}
// --- Event Listeners ---
addAgentBtn.addEventListener('click', addRandomAgent);
addTaskBtn.addEventListener('click', addRandomTask);
resetSimBtn.addEventListener('click', resetSimulation);
startSimBtn.addEventListener('click', startSimulation);
pauseSimBtn.addEventListener('click', pauseSimulation);
simSpeedInput.addEventListener('input', updateSimulationSpeed);
// Inicializar IDs para las funciones de añadir dinámicamente
function setInitialIds() {
    // Busca el ID numérico más alto en los agentes iniciales y lo usa como base
    if (initialData.initialAgents.length > 0) {
        nextAgentId = Math.max(...initialData.initialAgents.map(a =>
            parseInt(a.id.substring(1)))) || 0;
    }
    // Busca el ID numérico más alto en las tareas iniciales y lo usa como base
    if (initialData.initialTasks.length > 0) {
        nextTaskId = Math.max(...initialData.initialTasks.map(t =>
            parseInt(t.id.substring(1)))) || 0;
    }
}
// Deshabilitar el botón de pausa al inicio
pauseSimBtn.disabled = true;
speedValueSpan.textContent = `${(2000 / simSpeedInput.value).toFixed(1)}x`;
// Ocultar la sección de logs por defecto
if (logsSection) logsSection.style.display = 'none';
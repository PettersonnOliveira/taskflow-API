// API Configuration
const RENDER_API_URL = 'https://taskflow-api-olrd.onrender.com';
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalHost ? window.location.origin : RENDER_API_URL;
const API_TIMEOUT_MS = 70000; // >= 65s to accommodate cloud server cold start
const PING_BANNER_DELAY_MS = 2500;
const REQUEST_BANNER_DELAY_MS = 3000;
const CONNECTED_TOAST_DURATION_MS = 2000;

// Server Wake-Up Toast Management
const serverStatusUI = (() => {
    let toastEl = null;
    let messageEl = null;
    let hideTimeoutId = null;
    let activeSlowCount = 0;

    function ensureElements() {
        if (toastEl) return;
        toastEl = document.createElement('div');
        toastEl.className = 'server-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');

        const spinnerEl = document.createElement('span');
        spinnerEl.className = 'server-toast-spinner';
        spinnerEl.setAttribute('aria-hidden', 'true');

        messageEl = document.createElement('span');
        messageEl.className = 'server-toast-message';

        toastEl.appendChild(spinnerEl);
        toastEl.appendChild(messageEl);
        document.body.appendChild(toastEl);
    }

    function showConnecting(message) {
        ensureElements();
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        toastEl.classList.remove('connected');
        messageEl.textContent = message;
        toastEl.classList.add('visible');
    }

    function showConnectedAndClose() {
        if (!toastEl || !toastEl.classList.contains('visible')) return;
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
        }
        toastEl.classList.add('connected');
        messageEl.textContent = '✅ Servidor conectado!';
        hideTimeoutId = setTimeout(() => {
            toastEl.classList.remove('visible', 'connected');
            hideTimeoutId = null;
        }, CONNECTED_TOAST_DURATION_MS);
    }

    function hideImmediately() {
        if (!toastEl) return;
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        toastEl.classList.remove('visible', 'connected');
    }

    function beginSlowOperation(message) {
        activeSlowCount += 1;
        showConnecting(message);
    }

    function endSlowOperation(succeeded) {
        activeSlowCount = Math.max(0, activeSlowCount - 1);
        if (activeSlowCount === 0) {
            if (succeeded) {
                showConnectedAndClose();
            } else {
                hideImmediately();
            }
        }
    }

    return {
        beginSlowOperation,
        endSlowOperation,
    };
})();

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

async function pingServerOnStartup() {
    // The ping checks server availability regardless of HTTP status (e.g., 200, 403, 404).
    // Any resolved fetch call counts as the server being reachable, ensuring the banner clears.

    let slowTriggered = false;
    let reachedServer = false;

    const slowTimer = setTimeout(() => {
        slowTriggered = true;
        serverStatusUI.beginSlowOperation(
            '⏳ Iniciando o servidor na nuvem... O primeiro acesso pode levar até 50 segundos. Aguarde um instante.'
        );
    }, PING_BANNER_DELAY_MS);

    try {
        await fetchWithTimeout(`${API_BASE_URL}/`, {
            method: 'GET',
            cache: 'no-store',
        });
        reachedServer = true;
    } catch (error) {
        console.warn('Ping inicial ao servidor falhou:', error.message);
    } finally {
        clearTimeout(slowTimer);
        if (slowTriggered) {
            serverStatusUI.endSlowOperation(reachedServer);
        }
    }
}

// Token Management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getEmail = () => localStorage.getItem('email');
const setEmail = (email) => localStorage.setItem('email', email);
const removeEmail = () => localStorage.removeItem('email');
const getName = () => localStorage.getItem('name');
const setName = (name) => localStorage.setItem('name', name);
const removeName = () => localStorage.removeItem('name');

// API Helper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    console.log('apiCall token:', token);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const isPublicAuthEndpoint = endpoint.startsWith('/auth/');
    if (token && !isPublicAuthEndpoint) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const isPublicAuthEndpoint = endpoint.startsWith('/auth/');
    if (token && !isPublicAuthEndpoint) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let slowTriggered = false;
    let reachedServer = false;
    const slowTimer = setTimeout(() => {
        slowTriggered = true;
        serverStatusUI.beginSlowOperation(
            '⏳ Conectando ao servidor... Aguarde enquanto a API finaliza a inicialização.'
        );
    }, REQUEST_BANNER_DELAY_MS);

    let response;
    try {
        response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        reachedServer = true;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Tempo limite de conexão excedido. Tente novamente em instantes.');
        }
        throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
    } finally {
        clearTimeout(slowTimer);
        if (slowTriggered) {
            serverStatusUI.endSlowOperation(reachedServer);
        }
    }

    if (!response.ok) {
        const error = await response.text();
        if (response.status === 401 && !isPublicAuthEndpoint) {
            removeToken();
            removeEmail();
            removeName();
        }
        throw new Error(error || 'Erro na requisição');
    }

    return response.json();
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Redirect based on authentication
function checkAuth() {
    const currentPath = window.location.pathname;
    if (isAuthenticated() && currentPath.includes('index.html')) {
        window.location.href = 'dashboard.html';
        return true;
    } else if (!isAuthenticated() && currentPath.includes('dashboard.html')) {
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

// Auth Page Logic
if (document.querySelector('.auth-box')) {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('loginError');
            errorEl.textContent = '';
            
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiCall('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                
                setToken(response.token ?? response.jwt);
                setEmail(response.email);
                setName(response.name);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorEl.textContent = error.message || 'Erro ao fazer login';
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('registerError');
            errorEl.textContent = '';
            
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiCall('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password
                    }),
                });
                
                setToken(response.token ?? response.jwt);
                setEmail(response.email);
                setName(response.name);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorEl.textContent = error.message || 'Erro ao criar conta';
            }
        });
    }
}

// Dashboard Logic
if (document.querySelector('.dashboard-container')) {
    // Display user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl && getName()) {
        userNameEl.textContent = getName();
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeToken();
            removeEmail();
            removeName();
            window.location.href = 'index.html';
        });
    }

    // Load Tasks
    let allTasks = [];
    let currentFilter = 'all';

    async function loadTasks() {
        try {
            allTasks = await apiCall('/tasks');
            renderTasks();
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    }

    function renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const noTasks = document.getElementById('noTasks');
        
        const filteredTasks = currentFilter === 'all' 
            ? allTasks 
            : allTasks.filter(task => task.status === currentFilter);
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            noTasks.style.display = 'block';
            return;
        }
        
        noTasks.style.display = 'none';
        
        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-card">
                <div class="task-info">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span>Criado: ${formatDate(task.createdAt)}</span>
                        <span>Atualizado: ${formatDate(task.updatedAt)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="task-status status-${task.status}">${translateStatus(task.status)}</span>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal(${task.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Add Task
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addTaskForm);
            const data = Object.fromEntries(formData);
            
            try {
                await apiCall('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                
                addTaskForm.reset();
                loadTasks();
            } catch (error) {
                alert('Erro ao criar tarefa: ' + error.message);
            }
        });
    }

    // Filter Tasks
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Edit Modal
    const editModal = document.getElementById('editModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const closeModals = document.querySelectorAll('.close-modal, .close-modal-btn');

    window.openEditModal = async (taskId) => {
        try {
            const task = await apiCall(`/tasks/${taskId}`);
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTitle').value = task.title;
            document.getElementById('editDescription').value = task.description || '';
            document.getElementById('editStatus').value = task.status;
            editModal.classList.add('active');
        } catch (error) {
            alert('Erro ao carregar tarefa: ' + error.message);
        }
    };

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            editModal.classList.remove('active');
        });
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('active');
        }
    });

    editTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskId = document.getElementById('editTaskId').value;
        const formData = new FormData(editTaskForm);
        const data = Object.fromEntries(formData);
        delete data.id;
        
        try {
            await apiCall(`/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            
            editModal.classList.remove('active');
            loadTasks();
        } catch (error) {
            alert('Erro ao atualizar tarefa: ' + error.message);
        }
    });

    // Delete Task
    window.deleteTask = async (taskId) => {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }
        
        try {
            await apiCall(`/tasks/${taskId}`, {
                method: 'DELETE',
            });
            loadTasks();
        } catch (error) {
            alert('Erro ao excluir tarefa: ' + error.message);
        }
    };

    // Initial load
    loadTasks();
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function translateStatus(status) {
    const translations = {
        'PENDING': 'Pendente',
        'IN_PROGRESS': 'Em Progresso',
        'COMPLETED': 'Concluída'
    };
    return translations[status] || status;
}

// Check authentication on page load and proactively wake up server
if (!checkAuth()) {
    pingServerOnStartup();
}

document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://student-tasks-api-nmvy.onrender.com';

    // Referencias a los formularios y botones
    const registerForm = document.getElementById('register');
    const loginForm = document.getElementById('login');
    const addTaskForm = document.getElementById('add-task-form');
    const logoutButton = document.getElementById('logout-button');

    // Función para limpiar todos los campos
    function clearForms() {
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
    }

    // Funciones para mostrar u ocultar secciones
    function showTasksPage() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('tasks-section').style.display = 'block';
        fetchTasks();
    }

    function showAuthPage() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('tasks-section').style.display = 'none';
        clearForms(); // **Aquí se llama a la función para limpiar los campos**
    }

    // Lógica para el registro (solo si el formulario existe)
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            try {
                const response = await fetch(`${API_BASE_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Usuario registrado exitosamente.');
                } else {
                    alert('Error en el registro: ' + data.message);
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                alert('Error al conectar con el servidor.');
            }
        });
    }

    // Lógica para el login (solo si el formulario existe)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Inicio de sesión exitoso.');
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('userName', data.userName);
                    showTasksPage();
                } else {
                    alert('Error en el login: ' + data.message);
                }
            } catch (error) {
                console.error('Error en el login:', error);
                alert('Error al conectar con el servidor.');
            }
        });
    }

    // Lógica para agregar tareas (solo si el formulario existe)
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;

            if (!userId) {
                alert('Por favor, inicia sesión para agregar tareas.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, title, description })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Tarea creada exitosamente.');
                    document.getElementById('task-title').value = '';
                    document.getElementById('task-description').value = '';
                    fetchTasks();
                } else {
                    alert('Error al crear la tarea: ' + data.message);
                }
            } catch (error) {
                console.error('Error al crear la tarea:', error);
                alert('Error al conectar con el servidor para crear la tarea.');
            }
        });
    }

    // Lógica para cerrar sesión (solo si el botón existe)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            showAuthPage();
            alert('Sesión cerrada exitosamente.');
        });
    }

    // Función para obtener y mostrar las tareas
    async function fetchTasks() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${userId}`);
            const tasks = await response.json();
            const tasksList = document.getElementById('tasks-list');
            tasksList.innerHTML = '';
            if (tasks.length === 0) {
                tasksList.innerHTML = '<p>No tienes tareas aún. ¡Crea una!</p>';
                return;
            }
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                taskElement.innerHTML = `
                    <h3>${task.title}</h3>
                    <p>${task.description || 'Sin descripción'}</p>
                    <small>Estado: ${task.status}</small>
                    <button class="complete-button" data-id="${task.id}">Completar</button>
                `;
                tasksList.appendChild(taskElement);
            });

            // Lógica para los nuevos botones de completar
            document.querySelectorAll('.complete-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const taskId = e.target.getAttribute('data-id');
                    try {
                        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            alert('Tarea completada exitosamente.');
                            fetchTasks(); // Vuelve a cargar las tareas para ver el cambio
                        } else {
                            const data = await response.json();
                            alert('Error al completar la tarea: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Error al completar la tarea:', error);
                        alert('Error al conectar con el servidor.');
                    }
                });
            });

        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            alert('Error al cargar las tareas.');
        }
    }

    // Comprobación de autenticación al cargar la página
    const userId = localStorage.getItem('userId');
    if (userId) {
        showTasksPage();
    } else {
        showAuthPage();
    }
});
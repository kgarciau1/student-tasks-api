# Student Tasks API y Frontend

Este es un proyecto completo de una aplicación de gestión de tareas que incluye un backend (API), una base de datos y un frontend. La aplicación permite a los usuarios registrarse, iniciar sesión y administrar sus tareas.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (puro)
- **Despliegue**: Render
- **Control de versiones**: Git y GitHub

## Estructura de la Base de Datos

La base de datos se llama `student_tasks_db` y contiene las siguientes tablas:

### `users`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | serial | PRIMARY KEY |
| name | varchar | NOT NULL |
| email | varchar | UNIQUE, NOT NULL |
| password | varchar | NOT NULL |

### `tasks`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | serial | PRIMARY KEY |
| user_id | int | FOREIGN KEY -> users.id |
| title | varchar | NOT NULL |
| description | text | |
| status | varchar(50) | DEFAULT 'pending', CHECK (status IN ('pending', 'in_progress', 'done')) |
| created_at | timestamp | DEFAULT now() |

**Nota:** El script SQL para crear estas tablas se encuentra en la raíz de este repositorio (`schema.sql`).

## Instrucciones de Configuración y Ejecución

Sigue estos pasos para ejecutar la aplicación localmente y desplegarla en Render.

### 1. Requisitos

- Node.js y npm instalados.
- PostgreSQL instalado y corriendo.
- Una cuenta de Render para el despliegue.

### 2. Configuración de la base de datos

1.  Crea una base de datos en PostgreSQL llamada `student_tasks_db`.
2.  Ejecuta el script SQL (`schema.sql`) para crear las tablas necesarias.
3.  Crea un archivo `.env` en la raíz del proyecto con tus credenciales de base de datos:

    ```plaintext
    DB_USER=tu_usuario
    DB_HOST=localhost
    DB_DATABASE=student_tasks_db
    DB_PASSWORD=tu_contraseña
    DB_PORT=5432
    ```

### 3. Ejecución del Backend

1.  Instala las dependencias del proyecto:
    `npm install`
2.  Inicia el servidor Node.js:
    `node index.js`

### 4. Ejecución del Frontend

1.  Abre el archivo `public/index.html` en tu navegador.
2.  El frontend se conectará automáticamente a tu backend local si estás desarrollando, o al backend de Render si has actualizado la URL en `public/script.js`.

### 5. Despliegue en Render

1.  Sube el código a un repositorio de GitHub.
2.  En tu cuenta de Render, crea un **Web Service** para el backend y conecta tu repositorio de GitHub.
3.  Configura las variables de entorno (`DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`) con las credenciales de tu base de datos de Render.
4.  Configura el `Start Command` a `node index.js`.
5.  Para el frontend, puedes servir los archivos estáticos desde el mismo servidor de Node.js o, si lo prefieres, crear un **Static Site** en Render y apuntarlo a la carpeta `public`.


## Cómo usar la aplicación

Sigue estos pasos para interactuar con la aplicación:

1.  **Registro**: Crea una nueva cuenta en la sección "Registro" con tu nombre, email y contraseña. El sistema validará que el email no esté en uso.
2.  **Inicio de Sesión**: Usa tus credenciales de email y contraseña en la sección "Login" para acceder a la gestión de tareas. Si las credenciales son correctas, se te redirigirá a la página principal de tareas.
3.  **Visualizar Tareas**: Una vez que inicies sesión, se mostrará una lista de todas tus tareas. Verás el título, descripción y estado de cada una.
4.  **Crear una Nueva Tarea**: En el formulario "Añadir Tarea", puedes ingresar el título y la descripción de una nueva tarea. Al presionar "Añadir Tarea", se creará una nueva tarea en la base de datos con el estado inicial "pending".
5.  **Completar una Tarea**: Cada tarea tiene un botón "Completar". Al hacer clic en él, el estado de la tarea cambiará a "done" en la base de datos.
6.  **Cerrar Sesión**: El botón "Cerrar Sesión" te desconectará de la aplicación y te llevará de vuelta a la pantalla de login.

## Autor

- Kimberly Alejandra Urizar García
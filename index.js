const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Asegúrate de tener esta línea

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar el pool de conexión a la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Verificar la conexión a la base de datos
pool.connect()
    .then(() => console.log('Conexión a la base de datos exitosa.'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

// Rutas

// Ruta de registro con bcrypt
app.post('/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            userId: result.rows[0].id 
        });

    } catch (error) {
        if (error.code === '23505') { // Código de error para restricción única
            res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        } else {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
});

// Ruta de login con bcrypt
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        res.status(200).json({ 
            message: 'Inicio de sesión exitoso.', 
            userId: user.id,
            userName: user.name
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para crear una nueva tarea
app.post('/tasks', async (req, res) => {
    const client = await pool.connect();
    const { userId, title, description } = req.body;

    try {
        await client.query('BEGIN');

        // 1. Insertar la nueva tarea en la tabla `tasks` con el estado 'pending'
        const taskResult = await client.query(
            'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id',
            [title, description, 'pending']
        );
        const taskId = taskResult.rows[0].id;

        // 2. Asociar la tarea con el usuario en la tabla `user_tasks`
        await client.query(
            'INSERT INTO user_tasks (user_id, task_id) VALUES ($1, $2)',
            [userId, taskId]
        );

        await client.query('COMMIT');

        res.status(201).json({ 
            message: 'Tarea creada exitosamente.', 
            taskId 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear la tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
});

// Ruta para obtener las tareas de un usuario
app.get('/tasks/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const tasks = await pool.query(`
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.created_at
            FROM
                tasks AS t
            INNER JOIN
                user_tasks AS ut ON t.id = ut.task_id
            WHERE
                ut.user_id = $1
            ORDER BY
                t.created_at DESC;
        `, [userId]);

        res.status(200).json(tasks.rows);

    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para marcar una tarea como completada (simplificada)
app.put('/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            ['done', id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }
        res.status(200).json({ 
            message: 'Tarea actualizada exitosamente.', 
            task: result.rows[0] 
        });

    } catch (error) {
        console.error('Error al completar la tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create the joining table for users and tasks
CREATE TABLE user_tasks (
    user_id INT NOT NULL REFERENCES users(id),
    task_id INT NOT NULL REFERENCES tasks(id),
    PRIMARY KEY (user_id, task_id)
);

-- Add a CHECK constraint to the status column
ALTER TABLE tasks
ADD CONSTRAINT check_status_valid_values
CHECK (status IN ('pending', 'in_progress', 'done'));

SELECT * FROM users;


ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
#! /usr/bin/env node

import * as fs from 'node:fs/promises'

// Define constants

const taskFile = 'tasks.json' // File to store tasks
const tasks = [...await loadTasks()]; // Array to store tasks. Tasks are already loaded from the file.

// Check arguments passed to the program

function checkArguments() {
    switch (process.argv[2]) {
        case 'add':
            add(process.argv[3]);
            break;
        case 'list':
            list();
            break;
        case 'delete':
            deleteTask(process.argv[3]);
            break;
        case 'mark-in-progress':
            changeStatus(process.argv[3], "in-progress");
            break;
        case 'mark-done':
            changeStatus(process.argv[3], "done");
            break;
        case 'update':
            updateTask(process.argv[3], process.argv[4]);
            break;
        default:
            console.log('Invalid command');
    }
}

// Check if the task file exists

async function checkIfFileExists(file) {
    try {
        await fs.access(file);
        return true;
    } catch (error) {
        return false;
    }
}

// Load tasks from file

async function loadTasks() {
    const fileExists = await checkIfFileExists(taskFile);
    if (!fileExists) {
        console.log('No tasks file found. Creating new task file...');
        await fs.writeFile(taskFile, '[]');
        return [];
    }

    const data = await fs.readFile(taskFile, 'utf-8');
    return JSON.parse(data);
}

// Save tasks to file

async function saveTasks() {
    await fs.writeFile(taskFile, JSON.stringify(tasks, null, 2));
}

// Print task

function printTask(task) {
    console.log(`
        Task ID: ${task.id}
        Description: ${task.description}
        Status: ${task.status}
        Created At: ${task.createdAt}
        Updated At: ${task.updatedAt}
        ====================================
        `)
}

// The following functions represent the core functionality of the task manager

function add(task) {
    const newTask = {
        id: ((tasks.length > 0) ? Math.max(...tasks.map(task => task.id)) + 1 : 1),
        description: task,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    tasks.push(newTask)

    console.log(`Task added successfully (ID: ${newTask.id})`)
}

// List all tasks, regarding parameters passed to the program

function list() {
    function listDone() {
        for (const task of tasks) {
            if (task.status === 'done') {
                printTask(task);
            }
        }
    }

    function listTodo() {
        for (const task of tasks) {
            if (task.status === 'todo') {
                printTask(task);
            }
        }
    }

    function listInProgress() {
        for (const task of tasks) {
            if (task.status === 'in-progress') {
                printTask(task);
            }
        }
    }

    if (process.argv.length > 3) {
        switch (process.argv[3]) {
            case 'done':
                listDone();
                return;
            case 'todo':
                listTodo();
                return;
            case 'in-progress':
                listInProgress();
                return;
            default:
                console.log('Invalid option for list command.');
                return;
        }
    }

    tasks.forEach(printTask)
    return;
}

// Remove task

function deleteTask(id) {
    const index = tasks.findIndex(task => task.id == id);
    if (index === -1) {
        console.log('Task not found.');
        return;
    }
    tasks.splice(index, 1);
    console.log('Task deleted successfully.');
}

// Mark task as in progress

function changeStatus(id, status) {
    const index = tasks.findIndex(task => task.id == id);
    if (index === -1) {
        console.log('Task not found.');
        return;
    }
    tasks[index].status = status;
    tasks[index].updatedAt = new Date().toISOString();
    console.log('Task marked as in progress successfully.');
}

// Update task

function updateTask(id, description) {
    const index = tasks.findIndex(task => task.id == id);
    if (index === -1) {
        console.log('Task not found.');
        return;
    }
    tasks[index].description = description;
    tasks[index].updatedAt = new Date().toISOString();
    console.log('Task updated successfully.');
}

// Program execution

checkArguments();
saveTasks();
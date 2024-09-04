document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [],
    });
    calendar.render();
    loadTasks(); // Load tasks from localStorage on page load
});

let tasks = [];
let filter = 'all'; // Current filter: 'all', 'pending', 'completed'
let selectedCategory = ''; // Selected category filter

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const taskText = taskInput.value.trim();
    const taskCategory = document.getElementById('taskCategory').value;
    const taskReminder = parseInt(document.getElementById('taskReminder').value);

    if (taskText === "" || taskDate === "") {
        alert("Please enter a task and select a date.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        deadline: taskDeadline,
        category: taskCategory,
        completed: false,
        reminder: taskReminder
    };

    tasks.push(newTask);
    saveTasks(); // Save tasks to localStorage
    taskInput.value = "";
    document.getElementById('taskDate').value = "";
    document.getElementById('taskDeadline').value = "";
    document.getElementById('taskReminder').value = "";
    renderTasks();
    updateCalendar();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = "";

    // Filter tasks based on the current filter and selected category
    let filteredTasks = tasks;
    if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (selectedCategory) {
        filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
    }

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';

        taskElement.innerHTML = `
            <div>
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${task.id})">
                <span>${task.text} - ${task.date} ${task.deadline ? 'Deadline: ' + task.deadline : ''} (${task.category})</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(taskElement);
    });
}

function toggleComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.completed = !task.completed;
        }
        return task;
    });
    saveTasks(); // Save tasks to localStorage
    renderTasks();
    updateCalendar();
}

function editTask(taskId) {
    const newTaskText = prompt("Edit your task:");
    if (newTaskText === null || newTaskText.trim() === "") return;

    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.text = newTaskText.trim();
        }
        return task;
    });
    saveTasks(); // Save tasks to localStorage
    renderTasks();
    updateCalendar();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks(); // Save tasks to localStorage
    renderTasks();
    updateCalendar();
}

function filterTasks(taskFilter) {
    filter = taskFilter;
    selectedCategory = ''; // Reset category filter

    // Update active class for menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeMenuItem = document.querySelector(`.menu-item[onclick="filterTasks('${taskFilter}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    renderTasks();
}

function filterByCategory() {
    selectedCategory = prompt("Enter category to filter by (leave empty to show all):");

    // Update active class for menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeMenuItem = document.querySelector('.menu-item[onclick="filterByCategory()"]');
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    renderTasks();
}

function showCalendar() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeMenuItem = document.querySelector('.menu-item[onclick="showCalendar()"]');
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    document.getElementById('calendar').style.display = 'block';
    updateCalendar();
}

function updateCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: tasks.map(task => ({
            title: task.text,
            start: task.date,
            description: task.deadline ? 'Deadline: ' + task.deadline : ''
        }))
    });
    calendar.render();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        renderTasks();
        updateCalendar();
        tasks.forEach(task => {
            if (task.reminder && !task.completed) {
                setReminder(task);
            }
        });
    }
}

function setReminder(task) {
    const deadlineDate = new Date(task.date + 'T' + task.deadline);
    const reminderDate = new Date(deadlineDate.getTime() - task.reminder * 60000);

    const now = new Date();
    const timeUntilReminder = reminderDate - now;

    if (timeUntilReminder > 0) {
        setTimeout(() => {
            alert(`Reminder: ${task.text} is due soon!`);
        }, timeUntilReminder);
    }
}

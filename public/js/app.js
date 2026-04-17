// public/js/app.js - Clean & Working Version

const API_BASE = '/api/tasks';
let currentTaskId = null;

// Toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// Render Tasks
function renderTasks(tasks) {
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('taskCount');

  countEl.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  if (tasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  taskList.innerHTML = tasks.map(task => `
    <div class="task-card ${task.status}" data-id="${task.id}">
      <div class="task-title">${task.title}</div>
      ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      <div class="task-footer">
        <span class="status">${task.status}</span>
        <span class="task-date">${new Date(task.created_at).toLocaleDateString()}</span>
      </div>
      <div class="task-actions">
        <button class="btn-change" data-id="${task.id}">Change Status</button>
        <button class="btn-delete" data-id="${task.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

// Load Tasks
async function loadTasks() {
  try {
    const res = await fetch(API_BASE);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    showToast('Failed to load tasks', 'error');
  }
}

// Open Modal
function openModal(id) {
  currentTaskId = id;
  document.getElementById('statusModal').classList.add('active');
}

// Close Modal
function closeModal() {
  document.getElementById('statusModal').classList.remove('active');
  currentTaskId = null;
}

// Event Listeners
document.getElementById('taskList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains('btn-delete')) {
    if (confirm('Delete this task?')) {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        showToast('Task deleted successfully');
        loadTasks();
      } catch (err) {
        showToast('Failed to delete', 'error');
      }
    }
  } else if (btn.classList.contains('btn-change')) {
    openModal(id);
  }
});

// Save Status
document.getElementById('saveStatusBtn').addEventListener('click', async () => {
  if (!currentTaskId) return;

  const newStatus = document.getElementById('modalStatusSelect').value;

  try {
    await fetch(`${API_BASE}/${currentTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    showToast('Status updated successfully');
    closeModal();
    loadTasks();
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
});

document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

// Add Task
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const status = document.getElementById('status').value;

  if (!title) return showToast('Title is required', 'error');

  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status })
    });
    e.target.reset();
    showToast('Task created successfully');
    loadTasks();
  } catch (err) {
    showToast('Failed to create task', 'error');
  }
});

// Initialize
window.onload = () => {
  loadTasks();
  setInterval(loadTasks, 8000);
};
// ─── Supabase Configuration ───
// Replace these with your Supabase project credentials
const SUPABASE_URL = 'https://qqnrboeuwdtokcqsslwu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbnJib2V1d2R0b2tjcXNzbHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTcyMDYsImV4cCI6MjA5MDc3MzIwNn0.B44ttbGOqx2UfBNGyLZLrXklGlHcIPBQE3b9LUk-Cxw';

let supabaseClient = null;
let currentFilter = 'all';

// ─── Initialize Supabase ───
function initSupabase() {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('status-text');

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    statusDot.classList.add('error');
    statusText.textContent = 'Set your Supabase credentials in app.js';
    console.warn('Please set SUPABASE_URL and SUPABASE_ANON_KEY in app.js');
    return false;
  }

  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    statusDot.classList.add('error');
    statusText.textContent = 'Supabase library failed to load';
    console.error('window.supabase is not available. CDN script may have failed to load.');
    return false;
  }

  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected to Supabase';
    return true;
  } catch (err) {
    statusDot.classList.add('error');
    statusText.textContent = 'Failed to connect to Supabase';
    console.error('Supabase init error:', err);
    return false;
  }
}

// ─── CRUD Operations ───
async function fetchTodos() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
  return data;
}

async function addTodo(text) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('todos')
    .insert([{ text, is_completed: false }])
    .select()
    .single();

  if (error) {
    console.error('Error adding todo:', error);
    return null;
  }
  return data;
}

async function toggleTodo(id, isCompleted) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient
    .from('todos')
    .update({ is_completed: isCompleted })
    .eq('id', id);

  if (error) console.error('Error updating todo:', error);
}

async function deleteTodo(id) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting todo:', error);
}

async function clearCompletedTodos() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient
    .from('todos')
    .delete()
    .eq('is_completed', true);

  if (error) console.error('Error clearing completed:', error);
}

// ─── Rendering ───
function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');

  const filtered = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.is_completed;
    if (currentFilter === 'completed') return todo.is_completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.is_completed).length;
  itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

  list.innerHTML = filtered.map(todo => `
    <li class="todo-item ${todo.is_completed ? 'completed' : ''}" data-id="${todo.id}">
      <input type="checkbox" ${todo.is_completed ? 'checked' : ''} />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" title="Delete">&times;</button>
    </li>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Event Handlers ───
let todos = [];

async function refreshTodos() {
  todos = await fetchTodos();
  renderTodos(todos);
}

document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  const newTodo = await addTodo(text);
  if (newTodo) {
    todos.push(newTodo);
    renderTodos(todos);
  }
});

document.getElementById('todo-list').addEventListener('click', async (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.type === 'checkbox') {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.is_completed = e.target.checked;
      await toggleTodo(id, todo.is_completed);
      renderTodos(todos);
    }
  }

  if (e.target.classList.contains('delete-btn')) {
    await deleteTodo(id);
    todos = todos.filter(t => t.id !== id);
    renderTodos(todos);
  }
});

document.getElementById('clear-completed').addEventListener('click', async () => {
  await clearCompletedTodos();
  todos = todos.filter(t => !t.is_completed);
  renderTodos(todos);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos(todos);
  });
});

// ─── Init ───
const connected = initSupabase();
if (connected) {
  refreshTodos();
}

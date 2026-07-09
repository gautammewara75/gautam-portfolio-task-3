/* ============================================================
   todo.js — Gautam Mewara Portfolio
   Task 3 — Todo List Application
   Uses localStorage for persistence
   ============================================================ */

(function initTodoApp() {
  /* ── DOM refs ─────────────────────────────────────────────── */
  const addForm      = document.getElementById('todo-add-form');
  const addInput     = document.getElementById('todo-add-input');
  const filterBtns   = document.querySelectorAll('.todo-filter-btn');
  const listEl       = document.getElementById('todo-list');
  const emptyMsg     = document.getElementById('todo-empty');
  const countEl      = document.getElementById('todo-count');
  const clearDoneBtn = document.getElementById('todo-clear-done');

  if (!addForm) return; // not on the tools page

  /* ── State ────────────────────────────────────────────────── */
  const STORAGE_KEY = 'gm_todo_tasks';
  let tasks  = [];
  let filter = 'all';
  let editingId = null;

  /* ── localStorage ─────────────────────────────────────────── */
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* unavailable */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) { tasks = []; }
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function filteredTasks() {
    if (filter === 'active')    return tasks.filter(t => !t.done);
    if (filter === 'completed') return tasks.filter(t => t.done);
    return tasks;
  }

  function updateCount() {
    const active = tasks.filter(t => !t.done).length;
    if (!countEl) return;
    countEl.textContent = active === 1 ? '1 task left' : `${active} tasks left`;
  }

  /* ── Render ───────────────────────────────────────────────── */
  function render() {
    const visible = filteredTasks();

    if (emptyMsg) emptyMsg.hidden = visible.length > 0;

    // Remove all existing task items (leave non-task children untouched)
    listEl.querySelectorAll('.todo-item').forEach(el => el.remove());

    visible.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.done ? ' todo-item--done' : '');
      li.dataset.id = task.id;

      if (editingId === task.id) {
        /* Inline edit mode */
        li.innerHTML = `
          <form class="todo-edit-form" data-id="${task.id}">
            <input class="todo-edit-input" type="text" value="${escHtml(task.text)}" maxlength="200" aria-label="Edit task" />
            <div class="todo-edit-actions">
              <button type="submit" class="todo-btn todo-btn--save" aria-label="Save">✓ Save</button>
              <button type="button" class="todo-btn todo-cancel-btn" data-id="${task.id}" aria-label="Cancel">✕ Cancel</button>
            </div>
          </form>`;
      } else {
        /* Normal view */
        li.innerHTML = `
          <button class="todo-check-btn" aria-label="${task.done ? 'Mark incomplete' : 'Mark complete'}" aria-pressed="${task.done}" data-id="${task.id}">
            ${task.done ? '✓' : ''}
          </button>
          <span class="todo-text">${escHtml(task.text)}</span>
          <div class="todo-actions">
            <button class="todo-btn todo-btn--edit" aria-label="Edit task" data-id="${task.id}">✎</button>
            <button class="todo-btn todo-btn--delete" aria-label="Delete task" data-id="${task.id}">✕</button>
          </div>`;
      }

      listEl.appendChild(li);
    });

    updateCount();
    updateFilterBtns();
  }

  function updateFilterBtns() {
    filterBtns.forEach(btn => {
      btn.classList.toggle('todo-filter-btn--active', btn.dataset.filter === filter);
    });
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Add task ─────────────────────────────────────────────── */
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = addInput.value.trim();
    if (!text) return;
    tasks.unshift({ id: uid(), text, done: false, createdAt: Date.now() });
    save();
    addInput.value = '';
    editingId = null;
    render();
    addInput.focus();
  });

  /* ── Delegated list events ────────────────────────────────── */
  listEl.addEventListener('click', (e) => {
    const id = e.target.closest('[data-id]')?.dataset?.id;
    if (!id) return;

    /* Toggle complete */
    if (e.target.classList.contains('todo-check-btn')) {
      const t = tasks.find(t => t.id === id);
      if (t) { t.done = !t.done; save(); render(); }
    }

    /* Delete */
    if (e.target.classList.contains('todo-btn--delete')) {
      tasks = tasks.filter(t => t.id !== id);
      save(); render();
    }

    /* Start edit */
    if (e.target.classList.contains('todo-btn--edit')) {
      editingId = id; render();
      const editInput = listEl.querySelector(`.todo-edit-input`);
      if (editInput) { editInput.focus(); editInput.select(); }
    }

    /* Cancel edit */
    if (e.target.classList.contains('todo-cancel-btn')) {
      editingId = null; render();
    }
  });

  /* ── Submit inline edit form ──────────────────────────────── */
  listEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!e.target.classList.contains('todo-edit-form')) return;
    const id = e.target.dataset.id;
    const newText = e.target.querySelector('.todo-edit-input').value.trim();
    if (!newText) return;
    const t = tasks.find(t => t.id === id);
    if (t) { t.text = newText; save(); }
    editingId = null;
    render();
  });

  /* ── Filter ───────────────────────────────────────────────── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      editingId = null;
      render();
    });
  });

  /* ── Clear completed ──────────────────────────────────────── */
  if (clearDoneBtn) {
    clearDoneBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => !t.done);
      save(); render();
    });
  }

  /* ── Keyboard shortcuts: Escape cancels edit, Enter adds task ─ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingId) { editingId = null; render(); }
  });

  /* ── Init ─────────────────────────────────────────────────── */
  load();
  render();

})();

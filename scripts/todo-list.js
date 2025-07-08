// Load todos from localStorage on page load
let todoList = JSON.parse(localStorage.getItem('todos')) || [];

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todoList));
}

// Generate a unique id
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// Statistics
function updateStats() {
  const total = todoList.length;
  const completed = todoList.filter(todo => todo.completed).length;
  const pending = total - completed;
  
  document.querySelector('.stats').innerHTML = `
    <div class="stat-item">
      <span class="stat-number">${total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${completed}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${pending}</span>
      <span class="stat-label">Pending</span>
    </div>
  `;
}

function renderTodoList() {
  let todoListHTML = '';

  // Sort todos by priority (high first) and completion status
  const sortedTodos = [...todoList].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  sortedTodos.forEach((todoObject) => {
    const { id, name, dueDate, priority, completed } = todoObject;
    const priorityClass = `priority-${priority}`;
    const completedClass = completed ? 'completed' : '';
    const overdueClass = isOverdue(dueDate) && !completed ? 'overdue' : '';
    
    const html = `
      <div class="todo-row ${priorityClass} ${completedClass} ${overdueClass}" data-id="${id}">
        <div class="todo-name">
          <input type="checkbox" class="js-complete-checkbox" ${completed ? 'checked' : ''} data-id="${id}">
          <span class="todo-text">${name}</span>
        </div>
        <div class="todo-date">${formatDate(dueDate)}</div>
        <div class="priority-badge ${priorityClass}">${priority}</div>
        <div class="todo-actions">
          <button class="edit-button js-edit-button" data-id="${id}">Edit</button>
          <button class="delete-button js-delete-button" data-id="${id}">Delete</button>
        </div>
      </div>
    `;
    todoListHTML += html;
  });

  document.querySelector('.js-contain').innerHTML = todoListHTML;

  // Add event listeners
  addEventListeners();
  updateStats();
}

function addEventListeners() {
  // Delete buttons
  document.querySelectorAll('.js-delete-button').forEach(deleteButton => {
    deleteButton.addEventListener('click', () => {
      const id = deleteButton.dataset.id;
      const idx = todoList.findIndex(todo => todo.id === id);
      if (idx !== -1) {
        todoList.splice(idx, 1);
        saveTodos();
        renderTodoList();
      }
    });
  });

  // Complete checkboxes
  document.querySelectorAll('.js-complete-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.id;
      const todo = todoList.find(todo => todo.id === id);
      if (todo) {
        todo.completed = checkbox.checked;
        saveTodos();
        renderTodoList();
      }
    });
  });

  // Edit buttons
  document.querySelectorAll('.js-edit-button').forEach(editButton => {
    editButton.addEventListener('click', () => {
      const id = editButton.dataset.id;
      editTodo(id);
    });
  });
}

function editTodo(id) {
  const todo = todoList.find(todo => todo.id === id);
  const todoRow = document.querySelector(`.todo-row[data-id="${id}"]`);
  
  todoRow.innerHTML = `
    <input type="text" class="js-edit-name name-input" value="${todo.name}">
    <input type="date" class="js-edit-date due-date-input" value="${todo.dueDate}">
    <select class="js-edit-priority priority-select">
      <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
      <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
      <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
    </select>
    <div class="todo-actions">
      <button class="save-button js-save-button" data-id="${id}">Save</button>
      <button class="cancel-button js-cancel-button" data-id="${id}">Cancel</button>
    </div>
  `;

  // Add save/cancel event listeners
  todoRow.querySelector('.js-save-button').addEventListener('click', () => {
    const newName = todoRow.querySelector('.js-edit-name').value;
    const newDate = todoRow.querySelector('.js-edit-date').value;
    const newPriority = todoRow.querySelector('.js-edit-priority').value;
    
    todo.name = newName;
    todo.dueDate = newDate;
    todo.priority = newPriority;
    saveTodos();
    renderTodoList();
  });

  todoRow.querySelector('.js-cancel-button').addEventListener('click', () => {
    renderTodoList();
  });
}

function addTodo() {
  const inputElement = document.querySelector('.js-input');
  const name = inputElement.value.trim();

  if (!name) return;

  const dateInputElement = document.querySelector('.js-due-date-input');
  const dueDate = dateInputElement.value;
  
  const priorityElement = document.querySelector('.js-priority-select');
  const priority = priorityElement.value;
  
  todoList.push({
    id: generateId(),
    name,
    dueDate,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });

  inputElement.value = '';
  dateInputElement.value = '';
  priorityElement.value = 'medium';

  saveTodos();
  renderTodoList();
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date().setHours(0, 0, 0, 0);
}

function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Search functionality
function setupSearch() {
  const searchInput = document.querySelector('.js-search-input');
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const todoRows = document.querySelectorAll('.todo-row');
    
    todoRows.forEach(row => {
      const todoName = row.querySelector('.todo-text').textContent.toLowerCase();
      const todoDate = row.querySelector('.todo-date').textContent.toLowerCase();
      const todoPriority = row.querySelector('.priority-badge').textContent.toLowerCase();
      
      const matches = todoName.includes(searchTerm) || 
                     todoDate.includes(searchTerm) || 
                     todoPriority.includes(searchTerm);
      
      row.style.display = matches ? 'grid' : 'none';
    });
  });
}

// Filter functionality
function setupFilters() {
  document.querySelectorAll('.js-filter-button').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      const todoRows = document.querySelectorAll('.todo-row');
      
      // Update active filter button
      document.querySelectorAll('.js-filter-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      todoRows.forEach(row => {
        if (filter === 'all') {
          row.style.display = 'grid';
        } else if (filter === 'completed') {
          row.style.display = row.classList.contains('completed') ? 'grid' : 'none';
        } else if (filter === 'pending') {
          row.style.display = !row.classList.contains('completed') ? 'grid' : 'none';
        } else if (filter === 'overdue') {
          row.style.display = row.classList.contains('overdue') ? 'grid' : 'none';
        } else if (['high', 'medium', 'low'].includes(filter)) {
          row.style.display = row.classList.contains(`priority-${filter}`) ? 'grid' : 'none';
        }
      });
    });
  });
}

// Dark mode toggle
function setupDarkMode() {
  const darkModeToggle = document.querySelector('.js-dark-mode-toggle');
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  // Add button event listener
  document.querySelector('.js-button').addEventListener('click', addTodo);
  
  // Enter key support
  document.querySelector('.js-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // Setup search and filters
  setupSearch();
  setupFilters();
  setupDarkMode();
  
  // Initial render
  renderTodoList();
});
const taskInput = document.getElementById("taskInput");
const endDateInput = document.getElementById("endDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const userId = localStorage.getItem("userId");

// ✅ CHANGED HERE (Render backend URL)
const API_URL = "https://to-do-list-xrbb.onrender.com/todos";

// Block if not logged in
if (!userId) {
  alert("Please login first");
  window.location.href = "login.html";
}

// ---------- LOAD TODOS ----------
async function loadTodos() {
  const res = await fetch(`${API_URL}/${userId}`);
  const todos = await res.json();

  taskList.innerHTML = "";
  todos.forEach(renderTodo);
}

loadTodos();

// ---------- ADD TODO ----------
addBtn.addEventListener("click", async () => {
  const title = taskInput.value.trim();
  const endDate = endDateInput.value || null;

  if (!title) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title, endDate })
  });

  taskInput.value = "";
  endDateInput.value = "";
  loadTodos();
});

function renderTodo(todo) {
  const li = document.createElement("li");
  li.className = `task ${todo.is_completed ? "completed" : ""}`;

  const today = new Date().toISOString().split("T")[0];
  const isOverdue =
    todo.end_date && todo.end_date < today && !todo.is_completed;

  li.innerHTML = `
    <div class="task-info">
      <input 
        type="text" 
        value="${todo.title}" 
        class="edit-title" 
        disabled
      />

      <input 
        type="date" 
        value="${todo.end_date || ""}" 
        class="edit-date"
        disabled
      />

      ${isOverdue ? `<span class="due-date overdue">Overdue</span>` : ""}
    </div>

    <div class="actions">
      <button class="edit-btn">✏</button>
      <button class="save-btn" style="display:none;">💾</button>
      <button class="complete-btn">✔</button>
      <button class="delete-btn">✖</button>
    </div>
  `;

  const titleInput = li.querySelector(".edit-title");
  const dateInput = li.querySelector(".edit-date");
  const editBtn = li.querySelector(".edit-btn");
  const saveBtn = li.querySelector(".save-btn");

  // ---------- EDIT ----------
  editBtn.onclick = () => {
    titleInput.disabled = false;
    dateInput.disabled = false;
    titleInput.focus();
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
  };

  // ---------- SAVE ----------
  saveBtn.onclick = async () => {
    await fetch(`${API_URL}/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleInput.value,
        endDate: dateInput.value || null
      })
    });

    loadTodos();
  };

  // ---------- COMPLETE ----------
  li.querySelector(".complete-btn").onclick = async () => {
    await fetch(`${API_URL}/${todo.id}/complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_completed: !todo.is_completed
      })
    });
    loadTodos();
  };

  // ---------- DELETE ----------
  li.querySelector(".delete-btn").onclick = async () => {
    await fetch(`${API_URL}/${todo.id}`, {
      method: "DELETE"
    });
    loadTodos();
  };

  taskList.appendChild(li);
}

function view() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

function viewSignup() {
  const input = document.getElementById("su-password");
  input.type = input.type === "password" ? "text" : "password";
}

function move() {
  let cover = document.getElementById("cover");
  cover.style.right = cover.style.right === "20vw" ? "50vw" : "20vw";
  cover.style.borderRadius =
    cover.style.borderRadius === "25px 0px 0px 25px"
      ? "0px 25px 25px 0px"
      : "25px 0px 0px 25px";
}

/* ================= LOGIN ================= */
function login(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const output = document.getElementById("output");

  fetch("https://to-do-list-xrbb.onrender.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);

        output.style.color = "green";
        output.innerText = "Login successful";

        setTimeout(() => {
          window.location.href = "to-do-list.html";
        }, 800);
      } else {
        output.style.color = "red";
        output.innerText = data.message;
      }
    })
    .catch(() => {
      output.style.color = "red";
      output.innerText = "Server error. Try again.";
    });
}

/* ================= SIGNUP ================= */
function signup(e) {
  e.preventDefault();

  const username = document.getElementById("su-username").value;
  const password = document.getElementById("su-password").value;
  const output = document.getElementById("output2");

  fetch("https://to-do-list-xrbb.onrender.com/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      output.style.color = data.message.includes("successful") ? "green" : "red";
      output.innerText = data.message;
    })
    .catch(() => {
      output.style.color = "red";
      output.innerText = "Server error. Try again.";
    });
}

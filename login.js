const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    showMessage('Please enter both email and password.', 'error');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
        showMessage(`Welcome back, ${data.name}!`, 'success');
        localStorage.setItem('skilllinkUser', JSON.stringify({ name: data.name, email: data.email }));
        form.reset();
        // redirect to dashboard
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

  } catch (err) {
    showMessage('Error connecting to server.', 'error');
  }
});

function showMessage(msg, type) {
  message.textContent = msg;
  message.className = type;
}

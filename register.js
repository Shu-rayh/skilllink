const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Grab form values
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  // Basic client-side validation
  if (!name || !email || !password) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }

  try {
    const res = await fetch('https://skilllink-cls2.onrender.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      showMessage('Registration successful! You can now log in.', 'success');
      form.reset();
    } else {
      showMessage(data.error || 'Registration failed.', 'error');
    }
  } catch (err) {
    showMessage('Error connecting to server.', 'error');
  }
});

function showMessage(msg, type) {
  message.textContent = msg;
  message.className = type;
}

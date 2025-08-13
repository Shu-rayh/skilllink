const usersList = document.getElementById('usersList');
const logoutBtn = document.getElementById('logoutBtn');



const loggedInUser = JSON.parse(localStorage.getItem('skilllinkUser'));
if (!loggedInUser) {
  window.location.href = 'login.html';
}


async function loadUsers() {
  try {
    const res = await fetch('https://skilllink-cls2.onrender.com/users');
    const users = await res.json();

    usersList.innerHTML = '';

    users.forEach(user => {
      if (user.email === loggedInUser.email) return; // skip self

      const userDiv = document.createElement('div');
      userDiv.classList.add('user-card');
      userDiv.innerHTML = `
        <h3>${user.name}</h3>
        <p><strong>Offers:</strong> ${user.skillsOffered ? user.skillsOffered.join(', ') : 'None'}</p>
        <p><strong>Needs:</strong> ${user.skillsNeeded ? user.skillsNeeded.join(', ') : 'None'}</p>

        <form class="tradeForm">
          <label>Offer a skill you have:
            <input type="text" name="offeredSkill" placeholder="Your skill" required />
          </label>
          <label>Request a skill they have:
            <input type="text" name="requestedSkill" placeholder="Their skill" required />
          </label>
          <button type="submit">Send Trade Request</button>
          <p class="tradeMessage"></p>
        </form>
      `;

      // Handle trade request form submit
      const form = userDiv.querySelector('.tradeForm');
      const tradeMessage = userDiv.querySelector('.tradeMessage');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const offeredSkill = form.offeredSkill.value.trim();
        const requestedSkill = form.requestedSkill.value.trim();
        if (!offeredSkill || !requestedSkill) return;

        try {
          const res = await fetch('https://skilllink-cls2.onrender.com/trades/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUserEmail: loggedInUser.email,
              toUserEmail: user.email,
              offeredSkill,
              requestedSkill
            }),
          });

          const data = await res.json();
          if (res.ok) {
            tradeMessage.textContent = 'Trade request sent!';
            tradeMessage.style.color = '#2a9d8f';
            form.reset();
          } else {
            tradeMessage.textContent = data.error || 'Failed to send trade request.';
            tradeMessage.style.color = '#e63946';
          }
        } catch {
          tradeMessage.textContent = 'Error sending trade request.';
          tradeMessage.style.color = '#e63946';
        }
      });

      usersList.appendChild(userDiv);
    });
  } catch {
    usersList.innerHTML = '<p>Failed to load users.</p>';
  }
}

loadUsers();

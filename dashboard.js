const userNameEl = document.getElementById('userName');
const skillsOfferedList = document.getElementById('skillsOfferedList');
const skillsNeededList = document.getElementById('skillsNeededList');
const addOfferForm = document.getElementById('addOfferForm');
const addNeedForm = document.getElementById('addNeedForm');
const logoutBtn = document.getElementById('logoutBtn');



// Get logged-in user info from localStorage
const user = JSON.parse(localStorage.getItem('skilllinkUser'));
if (!user) {
  // No user logged in, redirect to login page
  window.location.href = 'login.html';
} else {
  userNameEl.textContent = user.name;
  loadUserSkills();
}

// Load user skills from backend
async function loadUserSkills() {
  try {
    const res = await fetch('http://127.0.0.1:5000/users');
    const users = await res.json();
    const currentUser = users.find(u => u.email === user.email);
    if (!currentUser) {
      alert('User not found, please login again.');
      localStorage.removeItem('skilllinkUser');
      window.location.href = 'login.html';
      return;
    }

    // Display skills offered
    skillsOfferedList.innerHTML = '';
    (currentUser.skillsOffered || []).forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      skillsOfferedList.appendChild(li);
    });

    // Display skills needed
    skillsNeededList.innerHTML = '';
    (currentUser.skillsNeeded || []).forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      skillsNeededList.appendChild(li);
    });

  } catch (err) {
    alert('Failed to load skills');
  }
}

// Add skill offer form submit
addOfferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const skill = document.getElementById('offerSkillInput').value.trim();
  if (!skill) return;

  try {
    const res = await fetch('http://127.0.0.1:5000/skills/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, skill })
    });
    if (res.ok) {
      document.getElementById('offerSkillInput').value = '';
      loadUserSkills();
    } else {
      alert('Failed to add skill offer');
    }
  } catch {
    alert('Error adding skill offer');
  }
});

// Add skill need form submit
addNeedForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const skill = document.getElementById('needSkillInput').value.trim();
  if (!skill) return;

  try {
    const res = await fetch('http://127.0.0.1:5000/skills/need', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, skill })
    });
    if (res.ok) {
      document.getElementById('needSkillInput').value = '';
      loadUserSkills();
    } else {
      alert('Failed to add skill need');
    }
  } catch {
    alert('Error adding skill need');
  }
});

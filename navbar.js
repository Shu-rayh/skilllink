// navbar.js

function createNavbar() {
  const user = JSON.parse(localStorage.getItem('skilllinkUser'));

  const nav = document.createElement('nav');
  nav.classList.add('navbar');

  nav.innerHTML = `
    <div class="nav-left">
      <div class="logo">SkillLink</div>
    </div>
    <div class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="nav-right">
      <a href="index.html" class="nav-link home">Home</a>
      ${user ? `
        <a href="dashboard.html" class="nav-link">Dashboard</a>
        <a href="browse.html" class="nav-link">Browse</a>
        <a href="trades.html" class="nav-link">Trade Requests</a>
        <button id="logoutBtn" class="btn-logout">Logout</button>
      ` : `
        <a href="login.html" class="nav-link">Login</a>
        <a href="register.html" class="nav-link">Register</a>
      `}
    </div>
  `;

  if (user) {
    nav.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('skilllinkUser');
      window.location.href = 'login.html';
    });
  }

  document.body.prepend(nav);

  const hamburger = document.getElementById('hamburger');
  const navRight = nav.querySelector('.nav-right');

  hamburger.addEventListener('click', () => {
    navRight.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  navRight.querySelectorAll('.nav-link, #logoutBtn').forEach(el => {
    el.addEventListener('click', () => {
      navRight.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', createNavbar);

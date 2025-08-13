const tradeRequestsDiv = document.getElementById('tradeRequests');
const logoutBtn = document.getElementById('logoutBtn');

const user = JSON.parse(localStorage.getItem('skilllinkUser'));
if (!user) {
  window.location.href = 'login.html';
}


async function loadTrades() {
  try {
    const res = await fetch(`https://skilllink-cls2.onrender.com/trades/${user.email}`);
    const trades = await res.json();

    if (!Array.isArray(trades) || trades.length === 0) {
      tradeRequestsDiv.innerHTML = '<p>No trade requests found.</p>';
      return;
    }

    tradeRequestsDiv.innerHTML = '';

    trades.forEach(trade => {
      const tradeDiv = document.createElement('div');
      tradeDiv.classList.add('trade-card');

      const isIncoming = trade.toUserEmail === user.email;

      tradeDiv.innerHTML = `
        <p><strong>${isIncoming ? 'From' : 'To'}:</strong> ${isIncoming ? trade.fromUserEmail : trade.toUserEmail}</p>
        <p><strong>Offered Skill:</strong> ${trade.offeredSkill}</p>
        <p><strong>Requested Skill:</strong> ${trade.requestedSkill}</p>
        <p><strong>Status:</strong> ${trade.status}</p>
      `;

      if (isIncoming && trade.status === 'pending') {
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';
        acceptBtn.style.marginRight = '1rem';
        acceptBtn.addEventListener('click', () => updateTradeStatus(trade._id, 'accepted'));

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () => updateTradeStatus(trade._id, 'rejected'));

        const btnContainer = document.createElement('div');
        btnContainer.appendChild(acceptBtn);
        btnContainer.appendChild(rejectBtn);
        tradeDiv.appendChild(btnContainer);
      }

      tradeRequestsDiv.appendChild(tradeDiv);
    });
  } catch {
    tradeRequestsDiv.innerHTML = '<p>Failed to load trades.</p>';
  }
}

async function updateTradeStatus(tradeId, status) {
  try {
    const res = await fetch(`https://skilllink-cls2.onrender.com/trades/${tradeId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      alert(`Trade ${status}`);
      loadTrades();
    } else {
      alert('Failed to update trade status.');
    }
  } catch {
    alert('Error updating trade status.');
  }
}

loadTrades();

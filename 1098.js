// Helper: Get JWT from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Generate 1098
document.getElementById('generate-1098-btn').addEventListener('click', async function() {
  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/generate-1098', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const msgDiv = document.getElementById('generate-message');
  if (data.success) {
    msgDiv.innerHTML = '<span class="success-message">1098 form generated!</span>';
    load1098Data();
  } else {
    msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Generation failed') + '</span>';
  }
});

// Load and display 1098 data
async function load1098Data() {
  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/1098-data', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const form = document.getElementById('form1098-data-form');
  const fieldsDiv = document.getElementById('form1098-fields');
  const msgDiv = document.getElementById('form1098-data-message');

  if (data.success && data.data) {
    form.style.display = '';
    fieldsDiv.innerHTML = '';
    Object.entries(data.data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) return; // skip nested objects
      fieldsDiv.innerHTML += `
        <div class="form-group">
          <label for="${key}">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
          <input type="text" id="${key}" name="${key}" value="${value !== null ? value : ''}">
        </div>
      `;
    });
    msgDiv.innerHTML = '';
  } else {
    form.style.display = 'none';
    msgDiv.innerHTML = '<span class="error-message">No 1098 data found.</span>';
  }
}

// Save edited 1098 data
document.getElementById('form1098-data-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const body = {};
  for (let [key, value] of formData.entries()) {
    body[key] = isNaN(value) ? value : Number(value);
  }

  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/1098-data', {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const msgDiv = document.getElementById('form1098-data-message');
  if (data.success) {
    msgDiv.innerHTML = '<span class="success-message">1098 data updated!</span>';
    load1098Data();
  } else {
    msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Update failed') + '</span>';
  }
});

// Download 1098 PDF
document.getElementById('download-1098-btn').addEventListener('click', async function() {
  const msgDiv = document.getElementById('download-message');
  try {
    const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/download-1098', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!res.ok) {
      const data = await res.json();
      msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Download failed') + '</span>';
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Form1098.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    msgDiv.innerHTML = '<span class="success-message">1098 PDF downloaded!</span>';
  } catch (err) {
    msgDiv.innerHTML = '<span class="error-message">Download failed.</span>';
  }
});

// Load 1098 data on page load
window.addEventListener('DOMContentLoaded', load1098Data);
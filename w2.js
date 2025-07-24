// Helper: Get JWT from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Upload W-2
document.getElementById('w2-upload-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('w2Form');
  const formData = new FormData();
  formData.append('w2Form', fileInput.files[0]);

 const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/upload-w2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getToken() },
    body: formData
  });

  const data = await res.json();
  const msgDiv = document.getElementById('upload-message');
  if (data.success) {
    msgDiv.innerHTML = '<span class="success-message">W-2 uploaded successfully!</span>';
  } else {
    msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Upload failed') + '</span>';
  }
});

// Extract W-2 Data
document.getElementById('extract-w2-btn').addEventListener('click', async function() {
  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/extract-w2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const msgDiv = document.getElementById('extract-message');
  if (data.success) {
    msgDiv.innerHTML = '<span class="success-message">W-2 data extracted!</span>';
    loadW2Data();
  } else {
    msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Extraction failed') + '</span>';
  }
});

// Load and display extracted W-2 data
async function loadW2Data() {
  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/w2-data', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const form = document.getElementById('w2-data-form');
  const fieldsDiv = document.getElementById('w2-fields');
  const msgDiv = document.getElementById('w2-data-message');

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
    msgDiv.innerHTML = '<span class="error-message">No extracted W-2 data found.</span>';
  }
}

// Save edited W-2 data
document.getElementById('w2-data-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const body = {};
  for (let [key, value] of formData.entries()) {
    body[key] = isNaN(value) ? value : Number(value);
  }

  const res = await fetch('https://tax-au-backend-production.up.railway.app/api/dashboard/w2-data', {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const msgDiv = document.getElementById('w2-data-message');
  if (data.success) {
    msgDiv.innerHTML = '<span class="success-message">W-2 data updated!</span>';
    loadW2Data();
  } else {
    msgDiv.innerHTML = '<span class="error-message">' + (data.message || 'Update failed') + '</span>';
  }
});

// Load W-2 data on page load
window.addEventListener('DOMContentLoaded', loadW2Data);
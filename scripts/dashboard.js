const API_BASE_URL = 'tax-au-backend-backup-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    initializeDashboard();
});

function initializeDashboard() {
    setupNavigation();
    setupEventListeners();
    loadUserData();
    loadDependents();
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');

            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', updateProfile);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Dependent management
    document.getElementById('addDependentBtn').addEventListener('click', showDependentForm);
    document.getElementById('cancelDependent').addEventListener('click', hideDependentForm);
    document.getElementById('newDependentForm').addEventListener('submit', addDependent);

    // Document uploads
    document.getElementById('uploadW9').addEventListener('click', uploadW9);
    document.getElementById('uploadW2').addEventListener('click', uploadW2);
    document.getElementById('generate1098').addEventListener('click', generate1098);
}

async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/me`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            populateUserForm(user);
        } else {
            console.error('Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function populateUserForm(user) {
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('filingStatus').value = user.filingStatus || '';
}

async function updateProfile(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    }
}

async function loadDependents() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/dependents`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const dependents = await response.json();
            displayDependents(dependents);
        }
    } catch (error) {
        console.error('Error loading dependents:', error);
    }
}

function displayDependents(dependents) {
    const container = document.getElementById('dependentsList');
    container.innerHTML = '';

    dependents.forEach(dep => {
        const depElement = document.createElement('div');
        depElement.className = 'dependent-item';
        depElement.innerHTML = `
            <div class="dependent-info">
                <h4>${dep.name}</h4>
                <p>Relationship: ${dep.relationship || 'N/A'}</p>
                <p>DOB: ${dep.dob ? new Date(dep.dob).toLocaleDateString() : 'N/A'}</p>
            </div>
            <button class="btn btn-secondary" onclick="removeDependent(${dep.id})">Remove</button>
        `;
        container.appendChild(depElement);
    });
}

function showDependentForm() {
    document.getElementById('dependentForm').style.display = 'block';
}

function hideDependentForm() {
    document.getElementById('dependentForm').style.display = 'none';
    document.getElementById('newDependentForm').reset();
}

async function addDependent(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dependentData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/dependents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dependentData)
        });

        if (response.ok) {
            hideDependentForm();
            loadDependents();
        } else {
            alert('Failed to add dependent');
        }
    } catch (error) {
        console.error('Error adding dependent:', error);
        alert('Error adding dependent');
    }
}

async function removeDependent(id) {
    if (!confirm('Are you sure you want to remove this dependent?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/dependents/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadDependents();
        } else {
            alert('Failed to remove dependent');
        }
    } catch (error) {
        console.error('Error removing dependent:', error);
        alert('Error removing dependent');
    }
}

async function uploadW9() {
    const fileInput = document.getElementById('w9Upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('w9Form', file);

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/upload-w9`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('w9Status').innerHTML = '<div class="status-success">W-9 uploaded successfully!</div>';
        } else {
            document.getElementById('w9Status').innerHTML = '<div class="status-error">Failed to upload W-9</div>';
        }
    } catch (error) {
        console.error('Error uploading W-9:', error);
        document.getElementById('w9Status').innerHTML = '<div class="status-error">Error uploading W-9</div>';
    }
}

async function uploadW2() {
    const fileInput = document.getElementById('w2Upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('w2Form', file);

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/upload-w2`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('w2Status').innerHTML = '<div class="status-success">W-2 uploaded successfully!</div>';
            
            // Optionally extract W-2 data automatically after upload
            setTimeout(() => {
                extractW2Data();
            }, 1000);
        } else {
            const errorData = await response.json();
            document.getElementById('w2Status').innerHTML = `<div class="status-error">Failed to upload W-2: ${errorData.message || 'Unknown error'}</div>`;
        }
    } catch (error) {
        console.error('Error uploading W-2:', error);
        document.getElementById('w2Status').innerHTML = '<div class="status-error">Error uploading W-2</div>';
    }
}

async function extractW2Data() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/extract-w2`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            displayW2Results(result.data);
            document.getElementById('w2Status').innerHTML += '<div class="status-success">W-2 data extracted successfully!</div>';
        } else {
            const errorData = await response.json();
            document.getElementById('w2Status').innerHTML += `<div class="status-error">Failed to extract W-2 data: ${errorData.message || 'Unknown error'}</div>`;
        }
    } catch (error) {
        console.error('Error extracting W-2 data:', error);
        document.getElementById('w2Status').innerHTML += '<div class="status-error">Error extracting W-2 data</div>';
    }
}

function displayW2Results(w2Data) {
    const container = document.getElementById('w2Data');
    container.innerHTML = `
        <div class="data-display">
            <h4>W-2 Information</h4>
            <p><strong>Employee:</strong> ${w2Data.employeeName || 'N/A'}</p>
            <p><strong>Employer:</strong> ${w2Data.employerName || 'N/A'}</p>
            <p><strong>Wages (Box 1):</strong> $${w2Data.box1_wages || '0.00'}</p>
            <p><strong>Federal Tax Withheld (Box 2):</strong> $${w2Data.box2_federalTax || '0.00'}</p>
            <p><strong>Social Security Wages (Box 3):</strong> $${w2Data.box3_socialSecurityWages || '0.00'}</p>
            <p><strong>Medicare Wages (Box 5):</strong> $${w2Data.box5_medicareWages || '0.00'}</p>
        </div>
    `;

    document.getElementById('w2Results').style.display = 'block';
}

async function generate1098() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/generate-1098`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            display1098Results(result.data);
            document.getElementById('form1098Status').innerHTML = '<div class="status-success">1098 form generated successfully!</div>';
        } else {
            const errorData = await response.json();
            document.getElementById('form1098Status').innerHTML = `<div class="status-error">Failed to generate 1098: ${errorData.message || 'Unknown error'}</div>`;
        }
    } catch (error) {
        console.error('Error generating 1098:', error);
        document.getElementById('form1098Status').innerHTML = '<div class="status-error">Error generating 1098 form</div>';
    }
}

function display1098Results(form1098Data) {
    const container = document.getElementById('form1098Data');
    container.innerHTML = `
        <div class="data-display">
            <h4>Generated 1098 Form</h4>
            <p><strong>Borrower:</strong> ${form1098Data.borrowerName || 'N/A'}</p>
            <p><strong>Lender:</strong> ${form1098Data.lenderName || 'N/A'}</p>
            <p><strong>Mortgage Interest Received:</strong> $${form1098Data.mortgageInterestReceived || '0.00'}</p>
            <p><strong>Points Paid:</strong> $${form1098Data.pointsPaid || '0.00'}</p>
            <p><strong>Mortgage Insurance Premiums:</strong> $${form1098Data.mortgageInsurancePremiums || '0.00'}</p>
            <p><strong>Outstanding Principal:</strong> $${form1098Data.outstandingMortgagePrincipal || '0.00'}</p>
            <p><strong>Form Year:</strong> ${form1098Data.formYear || 'N/A'}</p>
            <button onclick="download1098PDF()" class="btn btn-primary" style="margin-top: 10px;">Download PDF</button>
        </div>
    `;

    document.getElementById('form1098Results').style.display = 'block';
}

async function download1098PDF() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/download-1098`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Form1098.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            alert('Failed to download 1098 PDF');
        }
    } catch (error) {
        console.error('Error downloading 1098 PDF:', error);
        alert('Error downloading 1098 PDF');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/index.html';
}

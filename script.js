// --- Global Variables and DOM Selectors ---
const form = document.getElementById('employee-form');
const employeeList = document.getElementById('employee-list');
const submitBtn = document.getElementById('submit-btn');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-csv-btn');

// --- Login Selectors ---
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const logoutBtn = document.getElementById('logout-btn');

// --- HARDCODED CREDENTIALS (for client-side demonstration only) ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234'; 
const LOGGED_IN_KEY = 'isLoggedIn'; 

let employees = loadEmployees(); // Load initial data

// =========================================================
// A. LOCAL STORAGE & DATA PERSISTENCE
// =========================================================

function loadEmployees() {
    const employeesJSON = localStorage.getItem('employees');
    return employeesJSON ? JSON.parse(employeesJSON) : [];
}

function saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// =========================================================
// B. LOGIN/LOGOUT & ACCESS CONTROL
// =========================================================

function checkLoginState() {
    const isLoggedIn = localStorage.getItem(LOGGED_IN_KEY) === 'true';

    if (isLoggedIn) {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        renderEmployees(); 
    } else {
        loginContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
        localStorage.setItem(LOGGED_IN_KEY, 'true');
        loginMessage.textContent = '';
        checkLoginState();
    } else {
        loginMessage.textContent = 'Invalid username or password.';
        document.getElementById('password').value = ''; 
    }
}

function handleLogout() {
    localStorage.removeItem(LOGGED_IN_KEY); 
    checkLoginState(); 
}

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);


// =========================================================
// C. CRUD OPERATIONS
// =========================================================

// 1. Render/Read Employees (Supports Filtering)
function renderEmployees(filteredData = employees) {
    employeeList.innerHTML = ''; 

    if (filteredData.length === 0) {
        const row = employeeList.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5; 
        cell.textContent = "No employees found.";
        cell.style.textAlign = 'center';
        return;
    }

    filteredData.forEach(emp => {
        const row = employeeList.insertRow();
        row.insertCell().textContent = emp.id;
        row.insertCell().textContent = emp.name;
        row.insertCell().textContent = emp.position;
        row.insertCell().textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(emp.salary);

        const actionsCell = row.insertCell();

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'action-btn edit-btn';
        editButton.onclick = () => editEmployee(emp.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'action-btn delete-btn';
        deleteButton.onclick = () => deleteEmployee(emp.id);
        actionsCell.appendChild(deleteButton);
    });
}

// 2. Handle Form Submission (Create/Update)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('employee-id').value;
    const name = document.getElementById('name').value.trim();
    const position = document.getElementById('position').value.trim();
    const salary = parseFloat(document.getElementById('salary').value);
    
    if (id) {
        // UPDATE
        const index = employees.findIndex(emp => emp.id == id);
        if (index > -1) {
            employees[index] = { id: parseInt(id), name, position, salary };
        }
        submitBtn.textContent = 'Add Employee'; 
        document.getElementById('employee-id').value = ''; 
    } else {
        // CREATE
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        const newEmployee = { id: newId, name, position, salary };
        employees.push(newEmployee);
    }
    
    saveEmployees();
    renderEmployees(); 
    form.reset(); 
});

// 3. Edit Employee Setup
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        document.getElementById('employee-id').value = employee.id;
        document.getElementById('name').value = employee.name;
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary;
        
        submitBtn.textContent = 'Save Changes'; 
        window.scrollTo(0, 0); 
    }
}

// 4. Delete Employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(emp => emp.id !== id);
        saveEmployees();
        renderEmployees();
    }
}

// =========================================================
// D. SEARCH/FILTER LOGIC
// =========================================================

function filterEmployees() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredEmployees = employees.filter(emp => {
        const nameMatch = emp.name.toLowerCase().includes(searchTerm);
        const positionMatch = emp.position.toLowerCase().includes(searchTerm);
        
        return nameMatch || positionMatch;
    });

    renderEmployees(filteredEmployees);
}

searchInput.addEventListener('keyup', filterEmployees);

// =========================================================
// E. EXPORT TO CSV (Excel Compatibility)
// =========================================================

function exportToCSV(data, filename) {
    const headers = ['ID', 'Name', 'Position', 'Salary'];
    const headerRow = headers.join(',') + '\n';

    const csvRows = data.map(employee => {
        const values = [
            employee.id,
            // Ensure strings are quoted to handle commas within data
            `"${employee.name.replace(/"/g, '""')}"`, 
            `"${employee.position.replace(/"/g, '""')}"`,
            employee.salary
        ];
        return values.join(',');
    }).join('\n');

    const csvContent = headerRow + csvRows;

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url); 
}

exportBtn.addEventListener('click', () => {
    exportToCSV(employees, 'employee_data.csv');
});


// =========================================================
// F. INITIALIZATION
// =========================================================

document.addEventListener('DOMContentLoaded', checkLoginState);
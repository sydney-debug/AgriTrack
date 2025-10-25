// Main Application Logic

// Show/hide page functions
function showLanding() {
    hideAllPages();
    document.getElementById('landingPage').style.display = 'flex';
    document.getElementById('mainNav').style.display = 'none';
}

function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('mainNav').style.display = 'none';
}

function showSignup() {
    hideAllPages();
    document.getElementById('signupPage').style.display = 'block';
    document.getElementById('mainNav').style.display = 'none';
}

function showDashboard() {
    hideAllPages();
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('mainNav').style.display = 'block';
}

function hideAllPages() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
}

// Toast notification
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('notificationToast');
    const toastBody = document.getElementById('toastMessage');

    toastBody.textContent = message;
    toastEl.className = 'toast';

    if (type === 'success') {
        toastEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toastEl.classList.add('bg-warning');
    }

    // Use Bootstrap Toast API if available, otherwise manual show
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    } else {
        // Manual implementation
        toastEl.style.display = 'block';
        toastEl.classList.add('show');
        setTimeout(() => {
            toastEl.classList.remove('show');
            toastEl.style.display = 'none';
        }, 5000);
    }
}

// Loading spinner
function showLoading() {
    let spinner = document.querySelector('.spinner-overlay');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = '<div class="spinner-border spinner-border-custom text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Initialize dashboard based on user role
async function initializeDashboard() {
    const user = Auth.getCurrentUser();
    
    if (!user) {
        showLanding();
        return;
    }

    // Update navigation
    document.getElementById('userNameNav').textContent = user.full_name || user.email;

    // Build sidebar menu based on role
    buildSidebarMenu(user.role);

    // Show dashboard
    showDashboard();

    // Load dashboard content
    loadDashboardHome();
}

// Build sidebar menu based on role
function buildSidebarMenu(role) {
    const sidebar = document.getElementById('sidebarMenu');
    sidebar.innerHTML = '';

    const menuItems = {
        farmer: [
            { icon: 'fa-home', text: 'My Profile', action: 'loadDashboardHome' },
            { icon: 'fa-map-marked-alt', text: 'My Farms', action: 'loadFarmsPage' },
            { icon: 'fa-cow', text: 'Livestock', action: 'loadLivestockPage' },
            { icon: 'fa-seedling', text: 'Crops', action: 'loadCropsPage' },
            { icon: 'fa-heartbeat', text: 'Health Records', action: 'loadHealthRecordsPage' },
            { icon: 'fa-dollar-sign', text: 'Sales', action: 'loadSalesPage' },
            { icon: 'fa-boxes', text: 'Inventory', action: 'loadInventoryPage' },
            { icon: 'fa-book', text: 'Farm Notebook', action: 'loadNotebookPage' },
            { icon: 'fa-store', text: 'Marketplace', action: 'loadMarketplacePage' }
        ],
        vet: [
            { icon: 'fa-home', text: 'My Profile', action: 'loadDashboardHome' },
            { icon: 'fa-map-marked-alt', text: 'Farm Associations', action: 'loadFarmsPage' },
            { icon: 'fa-heartbeat', text: 'Health Records', action: 'loadHealthRecordsPage' },
            { icon: 'fa-cow', text: 'Livestock', action: 'loadLivestockPage' },
            { icon: 'fa-book', text: 'Vet Notebook', action: 'loadNotebookPage' },
            { icon: 'fa-handshake', text: 'Farm Invitations', action: 'loadAssociationsPage' }
        ],
        agrovets: [
            { icon: 'fa-home', text: 'My Profile', action: 'loadDashboardHome' },
            { icon: 'fa-box', text: 'My Products', action: 'loadMyListingsPage' },
            { icon: 'fa-plus-circle', text: 'Add Product', action: 'showAddProductModal' },
            { icon: 'fa-comments', text: 'Customer Inquiries', action: 'loadInquiriesPage' },
            { icon: 'fa-chart-line', text: 'Business Analytics', action: 'loadAnalyticsPage' },
            { icon: 'fa-store', text: 'Browse Marketplace', action: 'loadMarketplacePage' }
        ]
    };

    const items = menuItems[role] || [];
    
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `
            <a class="nav-link ${index === 0 ? 'active' : ''}" href="#" onclick="${item.action}(); return false;">
                <i class="fas ${item.icon}"></i> ${item.text}
            </a>
        `;
        sidebar.appendChild(li);
    });
}

// Set active menu item
function setActiveMenuItem(actionName) {
    document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(actionName)) {
            link.classList.add('active');
        }
    });
}

// Update page title
function updatePageTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isAuthenticated()) {
        initializeDashboard();
    } else {
        showLanding();
    }
});

// Utility: Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLandingPage() {
    showLanding();
}

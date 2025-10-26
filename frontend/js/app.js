// Main Application Logic

// Show/hide page functions
function showLanding() {
    console.log('Showing landing page');

    // Enhanced hiding of all other elements
    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const profilePage = document.getElementById('profilePage');

    if (loginPage) {
        loginPage.style.display = 'none';
        loginPage.style.visibility = 'hidden';
    }

    if (signupPage) {
        signupPage.style.display = 'none';
        signupPage.style.visibility = 'hidden';
    }

    if (dashboardPage) {
        dashboardPage.style.display = 'none';
        dashboardPage.style.visibility = 'hidden';
        // Remove authenticated classes
        dashboardPage.classList.remove('authenticated');
    }

    if (profilePage) {
        profilePage.style.display = 'none';
        profilePage.style.visibility = 'hidden';
    }

    // Remove dashboard-active class from body
    const body = document.body;
    body.classList.remove('dashboard-active');

    // Show landing page and ensure login cards are visible
    const landingPage = document.getElementById('landingPage');
    const mainNav = document.getElementById('mainNav');

    if (landingPage) {
        landingPage.style.display = 'flex';
        landingPage.style.visibility = 'visible';
        // Ensure login cards within landing page are visible
        const loginCards = landingPage.querySelectorAll('.card');
        loginCards.forEach(card => {
            card.style.display = 'block';
        });
    }

    if (mainNav) {
        mainNav.style.display = 'none';
        mainNav.style.visibility = 'hidden';
    }

    console.log('Landing page shown, authenticated classes removed');
}

function showLogin() {
    // Enhanced hiding of all other elements
    const landingPage = document.getElementById('landingPage');
    const signupPage = document.getElementById('signupPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const profilePage = document.getElementById('profilePage');

    if (landingPage) {
        landingPage.style.display = 'none';
        landingPage.style.visibility = 'hidden';
        // Hide any login cards within landing page
        const loginCards = landingPage.querySelectorAll('.card');
        loginCards.forEach(card => {
            card.style.display = 'none';
        });
    }

    if (signupPage) {
        signupPage.style.display = 'none';
        signupPage.style.visibility = 'hidden';
    }

    if (dashboardPage) {
        dashboardPage.style.display = 'none';
        dashboardPage.style.visibility = 'hidden';
    }

    if (profilePage) {
        profilePage.style.display = 'none';
        profilePage.style.visibility = 'hidden';
    }

    // Show login page and hide navigation
    const loginPage = document.getElementById('loginPage');
    const mainNav = document.getElementById('mainNav');

    if (loginPage) {
        loginPage.style.display = 'block';
        loginPage.style.visibility = 'visible';
    }

    if (mainNav) {
        mainNav.style.display = 'none';
        mainNav.style.visibility = 'hidden';
    }
}

function showSignup() {
    // Enhanced hiding of all other elements
    const landingPage = document.getElementById('landingPage');
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const profilePage = document.getElementById('profilePage');

    if (landingPage) {
        landingPage.style.display = 'none';
        landingPage.style.visibility = 'hidden';
        // Hide any login cards within landing page
        const loginCards = landingPage.querySelectorAll('.card');
        loginCards.forEach(card => {
            card.style.display = 'none';
        });
    }

    if (loginPage) {
        loginPage.style.display = 'none';
        loginPage.style.visibility = 'hidden';
    }

    if (dashboardPage) {
        dashboardPage.style.display = 'none';
        dashboardPage.style.visibility = 'hidden';
    }

    if (profilePage) {
        profilePage.style.display = 'none';
        profilePage.style.visibility = 'hidden';
    }

    // Show signup page and hide navigation
    const signupPage = document.getElementById('signupPage');
    const mainNav = document.getElementById('mainNav');

    if (signupPage) {
        signupPage.style.display = 'block';
        signupPage.style.visibility = 'visible';
    }

    if (mainNav) {
        mainNav.style.display = 'none';
        mainNav.style.visibility = 'hidden';
    }
}

function showDashboard() {
    console.log('Showing dashboard');

    // Enhanced hiding of all login elements
    const loginPage = document.getElementById('loginPage');
    const landingPage = document.getElementById('landingPage');
    const signupPage = document.getElementById('signupPage');

    if (loginPage) {
        loginPage.style.display = 'none';
        loginPage.style.visibility = 'hidden';
    }

    if (landingPage) {
        landingPage.style.display = 'none';
        landingPage.style.visibility = 'hidden';
        // Also hide any login cards within landing page
        const loginCards = landingPage.querySelectorAll('.card');
        loginCards.forEach(card => {
            card.style.display = 'none';
        });
    }

    if (signupPage) {
        signupPage.style.display = 'none';
        signupPage.style.visibility = 'hidden';
    }

    // Show dashboard and navigation
    const dashboardPage = document.getElementById('dashboardPage');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;

    if (dashboardPage) {
        dashboardPage.style.display = 'block';
        dashboardPage.style.visibility = 'visible';
        dashboardPage.classList.add('authenticated');
    }

    if (mainNav) {
        mainNav.style.display = 'block';
        mainNav.style.visibility = 'visible';
    }

    // Add dashboard-active class to body
    body.classList.add('dashboard-active');
    console.log('Dashboard shown with authenticated classes');
}

function hideAllPages() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'none';
}

function showProfile() {
    hideAllPages();
    document.getElementById('profilePage').style.display = 'block';
    document.getElementById('mainNav').style.display = 'block';
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

function showLoading() {
    console.log('Showing loading spinner');
    let spinner = document.querySelector('.spinner-overlay');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center">
                <div class="spinner-border spinner-border-custom text-light mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="text-white">Loading...</div>
            </div>
        `;
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';

    // Safety timeout: hide loading spinner after 10 seconds regardless
    setTimeout(() => {
        const safetySpinner = document.querySelector('.spinner-overlay');
        if (safetySpinner && safetySpinner.style.display !== 'none') {
            console.log('Safety timeout: hiding loading spinner');
            safetySpinner.style.display = 'none';
        }
    }, 10000);
}

function hideLoading() {
    console.log('Hiding loading spinner');
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
    const user = await Auth.getCurrentUser();

    if (!user) {
        showLanding();
        return;
    }

    // Get user profile with role
    const profile = await Auth.getUserProfile(user.id);
    if (!profile) {
        showToast('Error loading user profile', 'error');
        Auth.logout();
        return;
    }

    // Update navigation
    document.getElementById('userNameNav').textContent = profile.full_name || user.email;

    // Build sidebar menu based on role
    buildSidebarMenu(profile.role);

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
            { icon: 'fa-user', text: 'Profile', action: 'loadProfilePage' },
            { icon: 'fa-bell', text: 'My Tasks', action: 'loadTasksPage' },
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
            { icon: 'fa-user', text: 'Profile', action: 'loadProfilePage' },
            { icon: 'fa-bell', text: 'My Tasks', action: 'loadTasksPage' },
            { icon: 'fa-map-marked-alt', text: 'Farm Associations', action: 'loadFarmsPage' },
            { icon: 'fa-heartbeat', text: 'Health Records', action: 'loadHealthRecordsPage' },
            { icon: 'fa-cow', text: 'Livestock', action: 'loadLivestockPage' },
            { icon: 'fa-book', text: 'Vet Notebook', action: 'loadNotebookPage' },
            { icon: 'fa-handshake', text: 'Farm Invitations', action: 'loadAssociationsPage' }
        ],
        agrovets: [
            { icon: 'fa-user', text: 'Profile', action: 'loadProfilePage' },
            { icon: 'fa-bell', text: 'My Tasks', action: 'loadTasksPage' },
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

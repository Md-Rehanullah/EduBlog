/**
 * EduBlog Dashboard Script
 * Handles the functionality of the admin dashboard
 */

// Keep track of pagination and current state
const dashboardState = {
    currentPage: 1,
    postsPerPage: 10,
    currentPostId: null,
    filterType: 'all',
    filterStatus: 'all',
    csrfToken: '',
    isInitialized: false
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
});

// Initialize dashboard functionality
function initDashboard() {
    // Generate and set CSRF tokens
    dashboardState.csrfToken = API.generateCsrfToken();
    document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
        input.value = dashboardState.csrfToken;
    });
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up event listeners
    setupDashboardEventListeners();
}

// Check if the user is authenticated
function checkAuthStatus() {
    if (API.auth.isAuthenticated()) {
        showDashboard();
        
        // Display username
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = API.auth.getCurrentUser() || 'Admin';
        }
        
        // Initialize dashboard content
        loadDashboardContent();
    } else {
        showLoginSection();
    }
}

// Set up all event listeners for the dashboard
function setupDashboardEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('dashboard-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleDashboardLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Post form submission
    const postForm = document.getElementById('create-post-form');
    if (postForm) {
        postForm.addEventListener('submit', handleSavePost);
    }
    
    // Reset form button
    const resetFormBtn = document.getElementById('reset-form-btn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetPostForm);
    }
    
    // Filtering
    document.getElementById('filter-type')?.addEventListener('change', handleFilterChange);
    document.getElementById('filter-status')?.addEventListener('change', handleFilterChange);
    document.getElementById('refresh-posts-btn')?.addEventListener('click', refreshPosts);
    
    // Confirmation modal
    document.getElementById('cancel-action')?.addEventListener('click', closeConfirmationModal);
    document.getElementById('close-confirmation-modal')?.addEventListener('click', closeConfirmationModal);
    document.getElementById('confirm-action')?.addEventListener('click', executeConfirmedAction);
    
    // Toast close button
    document.querySelector('.toast-close')?.addEventListener('click', () => {
        document.getElementById('dashboard-toast').classList.remove('show');
    });
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Handle dashboard login
async function handleDashboardLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('dashboard-username').value;
    const password = document.getElementById('dashboard-password').value;
    const errorElement = document.getElementById('login-error-message');
    
    // Reset error message
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
    
    try {
        const result = await API.auth.login({ username, password });
        
        if (result.success) {
            showToast(`Welcome, ${result.username}!`);
            showDashboard();
            loadDashboardContent();
        }
    } catch (error) {
        if (errorElement) {
            errorElement.textContent = error.error || 'Invalid login credentials';
            errorElement.classList.remove('hidden');
        } else {
            showToast('Login failed. Invalid username or password.', 'error');
        }
    }
}

// Handle logout
function handleLogout() {
    API.auth.logout();
    showToast('You have been logged out successfully');
    showLoginSection();
}

// Show the login section, hide dashboard
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-content').classList.add('hidden');
}

// Show the dashboard, hide login section
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-content').classList.remove('hidden');
}

// Load dashboard content
function loadDashboardContent() {
    // Update statistics
    updateStats();
    
    // Load posts
    loadPosts();
}

// Update dashboard statistics
function updateStats() {
    try {
        const stats = API.posts.getStats();
        
        document.getElementById('total-posts').textContent = stats.totalPosts;
        document.getElementById('published-posts').textContent = stats.publishedPosts;
        document.getElementById('draft-posts').textContent = stats.draftPosts;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Load posts with current filters and pagination
function loadPosts() {
    try {
        const postsListElement = document.getElementById('posts-list');
        if (!postsListElement) return;
        
        // Show loading state
        postsListElement.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';
        
        // Get filters
        const contentType = dashboardState.filterType !== 'all' ? dashboardState.filterType : null;
        const isPublished = dashboardState.filterStatus === 'published' ? true :
                           dashboardState.filterStatus === 'draft' ? false : null;
        
        // Get posts with pagination
        const result = API.posts.getPosts({
            page: dashboardState.currentPage,
            limit: dashboardState.postsPerPage,
            contentType,
            isPublished,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        });
        
        renderPosts(result.posts, result.pagination);
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-list').innerHTML = 
            '<div class="error-state">Error loading posts. Please try again.</div>';
    }
}

// Render posts to the posts list
function renderPosts(posts, pagination) {
    const postsListElement = document.getElementById('posts-list');
    const paginationElement = document.getElementById('posts-pagination');
    
    if (!postsListElement) return;
    
    // Clear current content
    postsListElement.innerHTML = '';
    
    // Handle empty state
    if (posts.length === 0) {
        postsListElement.innerHTML = '<div class="empty-state">No posts match the selected filters.</div>';
        if (paginationElement) paginationElement.innerHTML = '';
        return;
    }
    
    // Create post items
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsListElement.appendChild(postElement);
    });
    
    // Render pagination if provided and if there are multiple pages
    if (paginationElement && pagination && pagination.totalPages > 1) {
        renderPagination(paginationElement, pagination, (page) => {
            dashboardState.currentPage = page;
            loadPosts();
        });
    } else if (paginationElement) {
        paginationElement.innerHTML = '';
    }
}

// Create an individual post element
function createPostElement(post) {
    const element = document.createElement('div');
    element.className = 'post-item';
    element.setAttribute('data-id', post.id);
    
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const statusBadge = post.isPublished ? 
        '<span class="status-badge published">Published</span>' : 
        '<span class="status-badge draft">Draft</span>';
    
    const typeLabel = post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1);
    
    element.innerHTML = `
        <div class="post-header">
            <h3 class="post-title">${post.title}</h3>
            <div class="post-meta">
                ${statusBadge}
                <span class="post-type">${typeLabel}</span>
                <span class="post-date"><i class="fas fa-calendar"></i> ${publishedDate}</span>
            </div>
        </div>
        <div class="post-excerpt">${post.excerpt}</div>
        <div class="post-actions">
            <button class="btn btn-sm btn-edit" data-id="${post.id}" aria-label="Edit post">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" data-id="${post.id}" aria-label="Delete post">
                <i class="fas fa-trash"></i> Delete
            </button>
            <button class="btn btn-sm btn-view" data-id="${post.id}" aria-label="View post">
                <i class="fas fa-eye"></i> View
            </button>
        </div>
    `;
    
    // Add event listeners
    element.querySelector('.btn-edit').addEventListener('click', () => editPost(post.id));
    element.querySelector('.btn-danger').addEventListener('click', () => confirmDeletePost(post.id));
    element.querySelector('.btn-view').addEventListener('click', () => viewPost(post.id));
    
    return element;
}

// Render pagination controls
function renderPagination(element, pagination, onPageChange) {
    element.innerHTML = '';
    
    if (pagination.totalPages <= 1) return;
    
    const ul = document.createElement('ul');
    ul.className = 'pagination-list';
    
    // Previous button
    const prevLi = document.createElement('li');
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Prev';
    prevButton.className = 'pagination-link';
    prevButton.disabled = pagination.page <= 1;
    prevButton.setAttribute('aria-label', 'Previous page');
    prevButton.addEventListener('click', () => onPageChange(pagination.page - 1));
    prevLi.appendChild(prevButton);
    ul.appendChild(prevLi);
    
    // Page numbers
    const maxPages = Math.min(5, pagination.totalPages);
    let startPage = Math.max(1, pagination.page - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-link' + (i === pagination.page ? ' active' : '');
        button.setAttribute('aria-label', `Page ${i}`);
        button.setAttribute('aria-current', i === pagination.page ? 'page' : 'false');
        button.addEventListener('click', () => onPageChange(i));
        li.appendChild(button);
        ul.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.className = 'pagination-link';
    nextButton.disabled = pagination.page >= pagination.totalPages;
    nextButton.setAttribute('aria-label', 'Next page');
    nextButton.addEventListener('click', () => onPageChange(pagination.page + 1));
    nextLi.appendChild(nextButton);
    ul.appendChild(nextLi);
    
    element.appendChild(ul);
}

// Handle filter changes
function handleFilterChange() {
    dashboardState.filterType = document.getElementById('filter-type').value;
    dashboardState.filterStatus = document.getElementById('filter-status').value;
    dashboardState.currentPage = 1; // Reset to first page when filtering
    loadPosts();
}

// Refresh posts list
function refreshPosts() {
    loadPosts();
    showToast('Posts refreshed');
}

// Edit a post
function editPost(postId) {
    try {
        const post = API.posts.getPostById(postId);
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        // Update form title
        document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Post';
        
        // Fill form with post data
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-type').value = post.contentType;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
        document.getElementById('post-image').value = post.imageUrl || '';
        document.getElementById('post-published').checked = post.isPublished;
        document.getElementById('post-id').value = post.id;
        
        // Update submit button text
        document.querySelector('#create-post-form button[type="submit"]').textContent = 'Update Post';
        
        // Store current post id
        dashboardState.currentPostId = post.id;
        
        // Scroll to form
        document.querySelector('.dashboard-form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing post:', error);
        showToast('Failed to load post data', 'error');
    }
}

// Reset post form
function resetPostForm() {
    // Reset form fields
    document.getElementById('create-post-form').reset();
    document.getElementById('post-id').value = '';
    
    // Reset form title and button
    document.getElementById('form-title').innerHTML = '<i class="fas fa-plus-circle"></i> Create New Post';
    document.querySelector('#create-post-form button[type="submit"]').textContent = 'Save Post';
    
    // Reset stored post id
    dashboardState.currentPostId = null;
}

// Handle save post form submission
async function handleSavePost(e) {
    e.preventDefault();
    
    // Check CSRF token
    const token = document.getElementById('post-csrf-token').value;
    if (!API.verifyCsrfToken(token)) {
        showToast('Security validation failed. Please refresh the page and try again.', 'error');
        return;
    }
    
    const form = document.getElementById('create-post-form');
    const formData = new FormData(form);
    
    try {
        // Gather post data
        const postData = {
            title: formData.get('title'),
            contentType: formData.get('contentType'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            imageUrl: formData.get('image') || null,
            isPublished: formData.get('published') === 'on'
        };
        
        // Validate required fields
        if (!postData.title || !postData.contentType || !postData.excerpt || !postData.content) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Check if we're updating or creating
        const postId = formData.get('id');
        let result;
        
        if (postId) {
            // Update existing post
            result = API.posts.updatePost(postId, postData);
            showToast(`Post "${result.title}" updated successfully`);
        } else {
            // Create new post
            result = API.posts.createPost(postData);
            showToast(`Post "${result.title}" created successfully`);
        }
        
        // Reset form
        resetPostForm();
        
        // Refresh posts list and stats
        loadPosts();
        updateStats();
    } catch (error) {
        console.error('Error saving post:', error);
        showToast(`Failed to save post: ${error.message || 'Unknown error'}`, 'error');
    }
}

// Confirm post deletion
function confirmDeletePost(postId) {
    const post = API.posts.getPostById(postId);
    if (!post) {
        showToast('Post not found', 'error');
        return;
    }
    
    // Set confirmation message
    document.getElementById('confirmation-message').textContent = 
        `Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`;
    
    // Store post id for confirmation handler
    document.getElementById('confirm-action').setAttribute('data-id', postId);
    
    // Show modal
    document.getElementById('confirmation-modal').classList.add('active');
}

// Close confirmation modal
function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.remove('active');
}

// Execute confirmed action (delete post)
function executeConfirmedAction() {
    const postId = document.getElementById('confirm-action').getAttribute('data-id');
    
    try {
        // Delete the post
        const deletedPost = API.posts.deletePost(postId);
        
        // Close modal
        closeConfirmationModal();
        
        // Show success message
        showToast(`Post "${deletedPost.title}" was deleted successfully`);
        
        // Refresh posts and stats
        loadPosts();
        updateStats();
        
        // Reset form if we were editing the deleted post
        if (dashboardState.currentPostId === parseInt(postId)) {
            resetPostForm();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Failed to delete post', 'error');
        closeConfirmationModal();
    }
}

// View a post
function viewPost(postId) {
    const post = API.posts.getPostById(postId);
    if (!post) {
        showToast('Post not found', 'error');
        return;
    }
    
    // Open post in new tab/window
    const url = `index.html?post=${postId}`;
    window.open(url, '_blank');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('dashboard-toast');
    const toastMessage = document.getElementById('dashboard-toast-message');
    const toastIcon = document.getElementById('dashboard-toast-icon');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    // Update icon based on type
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toastIcon.className = 'fas fa-check-circle';
    }
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/**
 * EduBlog Dashboard Script
 * Handles the functionality of the admin dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard script loaded");
    
    // Check authentication on page load
    checkAuthentication();
    
    // Set up all event listeners
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthentication() {
    if (API.auth.isAuthenticated()) {
        console.log("User is authenticated");
        showDashboardContent();
        loadDashboardData();
    } else {
        console.log("User is not authenticated");
        showLoginForm();
    }
}

// Show login form, hide dashboard
function showLoginForm() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
}

// Show dashboard content, hide login form
function showDashboardContent() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
    
    // Display username
    const username = API.auth.getCurrentUser();
    if (username) {
        document.getElementById('username-display').textContent = username;
    }
}

// Set up all event listeners for dashboard functionality
function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Login form submission
    const loginForm = document.getElementById('dashboard-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page reload
            handleLogin();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent page reload
            handleLogout();
        });
    }
    
    // Post creation form
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page reload
            handlePostSubmit();
        });
    }
    
    // Reset form button
    const resetFormBtn = document.getElementById('reset-form-btn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetPostForm);
    }
    
    // Post filters
    const filterType = document.getElementById('filter-type');
    const filterStatus = document.getElementById('filter-status');
    
    if (filterType) {
        filterType.addEventListener('change', filterPosts);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', filterPosts);
    }
    
    // Refresh posts button
    const refreshBtn = document.getElementById('refresh-posts-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPosts);
    }
    
    // Confirmation modal actions
    const cancelAction = document.getElementById('cancel-action');
    const confirmAction = document.getElementById('confirm-action');
    const closeModal = document.getElementById('close-confirmation-modal');
    
    if (cancelAction) {
        cancelAction.addEventListener('click', closeConfirmationModal);
    }
    
    if (confirmAction) {
        confirmAction.addEventListener('click', executeConfirmedAction);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeConfirmationModal);
    }
    
    // Close toast message
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            document.getElementById('dashboard-toast').classList.remove('show');
        });
    }
}

// Handle login form submission
async function handleLogin() {
    console.log("Login attempt");
    const username = document.getElementById('dashboard-username').value;
    const password = document.getElementById('dashboard-password').value;
    const errorElement = document.getElementById('login-error-message');
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
    
    try {
        const result = await API.auth.login({
            username: username,
            password: password
        });
        
        if (result.success) {
            console.log("Login successful");
            showToast(`Welcome, ${result.username}!`);
            showDashboardContent();
            loadDashboardData();
        }
    } catch (error) {
        console.error("Login failed:", error);
        if (errorElement) {
            errorElement.textContent = error.error || 'Invalid username or password';
            errorElement.classList.remove('hidden');
        } else {
            showToast('Login failed. Please check your credentials.', 'error');
        }
    }
}

// Handle logout button click
function handleLogout() {
    console.log("Logout attempt");
    API.auth.logout();
    showToast('You have been logged out successfully');
    showLoginForm();
}

// Load all dashboard data
async function loadDashboardData() {
    console.log("Loading dashboard data");
    
    // First make sure we have the latest data from the cloud
    try {
        await API.posts.initializeWithSampleData();
        loadStats();
        loadPosts();
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Failed to sync with cloud storage", "error");
        
        // Still try to load local data
        loadStats();
        loadPosts();
    }
}

// Load and display post statistics
function loadStats() {
    try {
        const stats = API.posts.getStats();
        
        document.getElementById('total-posts').textContent = stats.totalPosts;
        document.getElementById('published-posts').textContent = stats.publishedPosts;
        document.getElementById('draft-posts').textContent = stats.draftPosts;
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load statistics', 'error');
    }
}

// Load posts based on current filters
function loadPosts() {
    console.log("Loading posts");
    const postsListElement = document.getElementById('posts-list');
    
    if (!postsListElement) return;
    
    // Show loading state
    postsListElement.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';
    
    try {
        // Get filter values
        const typeFilter = document.getElementById('filter-type').value;
        const statusFilter = document.getElementById('filter-status').value;
        
        // Prepare filter options
        const filterOptions = {
            contentType: typeFilter !== 'all' ? typeFilter : null,
            isPublished: statusFilter !== 'all' ? statusFilter === 'published' : null
        };
        
        // Get posts with filters
        const result = API.posts.getPosts(filterOptions);
        
        // Render posts
        renderPosts(result.posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsListElement.innerHTML = '<div class="error-state">Error loading posts. Please try again.</div>';
    }
}

// Render posts to the UI
function renderPosts(posts) {
    const postsListElement = document.getElementById('posts-list');
    
    if (!postsListElement) return;
    
    if (posts.length === 0) {
        postsListElement.innerHTML = '<div class="empty-state">No posts found. Create your first post!</div>';
        return;
    }
    
    postsListElement.innerHTML = '';
    
    // Create post items
    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        
        const statusClass = post.isPublished ? 'published' : 'draft';
        const statusText = post.isPublished ? 'Published' : 'Draft';
        const typeText = post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1);
        const dateText = new Date(post.publishedAt).toLocaleDateString();
        
        postItem.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="post-type">${typeText}</span>
                    <span class="post-date"><i class="fas fa-calendar"></i> ${dateText}</span>
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
                ${post.isPublished ? `
                <button class="btn btn-sm btn-view" data-id="${post.id}" aria-label="View post">
                    <i class="fas fa-eye"></i> View
                </button>
                ` : ''}
            </div>
        `;
        
        postsListElement.appendChild(postItem);
        
        // Add click events to post actions
        const editBtn = postItem.querySelector('.btn-edit');
        const deleteBtn = postItem.querySelector('.btn-danger');
        const viewBtn = postItem.querySelector('.btn-view');
        
        editBtn.addEventListener('click', function() {
            editPost(post.id);
        });
        
        deleteBtn.addEventListener('click', function() {
            confirmDeletePost(post.id);
        });
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                viewPost(post.id);
            });
        }
    });
}

// Filter posts based on selected filters
function filterPosts() {
    console.log("Filtering posts");
    loadPosts(); // Reload with new filters
}

// Edit an existing post
function editPost(postId) {
    console.log("Editing post", postId);
    try {
        const post = API.posts.getPostById(postId);
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        // Update form title
        document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Post';
        
        // Fill form with post data
        document.getElementById('post-id').value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-type').value = post.contentType;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
        document.getElementById('post-image').value = post.imageUrl || '';
        document.getElementById('post-published').checked = post.isPublished;
        
        // Update submit button text
        document.querySelector('#create-post-form button[type="submit"]').textContent = 'Update Post';
        
        // Scroll to form
        document.querySelector('.dashboard-form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    } catch (error) {
        console.error('Error editing post:', error);
        showToast('Failed to load post data', 'error');
    }
}

// Reset the post form
function resetPostForm() {
    console.log("Resetting post form");
    document.getElementById('create-post-form').reset();
    document.getElementById('post-id').value = '';
    
    // Reset form title and button
    document.getElementById('form-title').innerHTML = '<i class="fas fa-plus-circle"></i> Create New Post';
    document.querySelector('#create-post-form button[type="submit"]').textContent = 'Save Post';
}

// Handle post form submission
async function handlePostSubmit() {
    console.log("Post form submitted");
    try {
        const form = document.getElementById('create-post-form');
        const formData = new FormData(form);
        
        // Prepare post data
        const postData = {
            title: formData.get('title'),
            contentType: formData.get('contentType'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            imageUrl: formData.get('image') || null,
            isPublished: formData.get('published') === 'on'
        };
        
        // Show loading state
        showToast('Saving post...', 'info');
        
        // Check if we're creating or updating
        const postId = formData.get('id');
        
        let result;
        if (postId) {
            // Update existing post
            result = await API.posts.updatePost(postId, postData);
            showToast(`Post "${result.title}" updated successfully`);
        } else {
            // Create new post
            result = await API.posts.createPost(postData);
            showToast(`Post "${result.title}" created successfully`);
        }
        
        // Reset form and refresh data
        resetPostForm();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving post:', error);
        showToast(`Error: ${error.message || 'Failed to save post'}`, 'error');
    }
}

// Show confirmation modal for post deletion
function confirmDeletePost(postId) {
    console.log("Confirming delete for post", postId);
    try {
        const post = API.posts.getPostById(postId);
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        // Set up confirmation modal
        document.getElementById('confirmation-message').textContent = 
            `Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`;
        
        // Store post ID for confirmation action
        document.getElementById('confirm-action').setAttribute('data-post-id', postId);
        
        // Show modal
        document.getElementById('confirmation-modal').classList.add('active');
    } catch (error) {
        console.error('Error preparing delete confirmation:', error);
        showToast('Error loading post information', 'error');
    }
}

// Close the confirmation modal
function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.remove('active');
}

// Execute the confirmed delete action
async function executeConfirmedAction() {
    try {
        // Get post ID from button data attribute
        const postId = document.getElementById('confirm-action').getAttribute('data-post-id');
        
        if (!postId) {
            throw new Error('Post ID not found');
        }
        
        // Show loading state
        showToast('Deleting post...', 'info');
        
        // Delete the post
        const deletedPost = await API.posts.deletePost(postId);
        
        // Show success message and close modal
        showToast(`Post "${deletedPost.title}" deleted successfully`);
        closeConfirmationModal();
        
        // Refresh dashboard data
        loadDashboardData();
        
        // Reset form if we were editing this post
        const editingId = document.getElementById('post-id').value;
        if (editingId === postId) {
            resetPostForm();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast(`Error: ${error.message || 'Failed to delete post'}`, 'error');
        closeConfirmationModal();
    }
}

// Open post in a new tab
function viewPost(postId) {
    console.log("Viewing post", postId);
    window.open(`index.html?post=${postId}`, '_blank');
}

// Show toast notification
function showToast(message, type = 'success') {
    console.log(`Toast: ${type} - ${message}`);
    const toast = document.getElementById('dashboard-toast');
    const toastMessage = document.getElementById('dashboard-toast-message');
    const toastIcon = document.getElementById('dashboard-toast-icon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    toastMessage.textContent = message;
    
    // Set toast type class
    toast.className = 'toast';
    toast.classList.add(type);
    
    // Set icon based on type
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle';
    } else {
        toastIcon.className = 'fas fa-check-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

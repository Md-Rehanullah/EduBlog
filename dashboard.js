/**
 * EduBlog Dashboard Script - Fixed Version
 * Handles the functionality of the admin dashboard with cloud storage integration
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard script loaded");
    
    // Check if API is available
    if (typeof API === 'undefined') {
        console.error("API module not found. Make sure api.js is loaded before dashboard.js");
        document.body.innerHTML = '<div class="error-message" style="padding: 20px; margin: 20px; text-align: center;">Error: API module not loaded. Please check your internet connection and refresh the page.</div>';
        return;
    }
    
    // Check if CloudStorage is available
    if (typeof CloudStorage === 'undefined') {
        console.error("CloudStorage module not found. Make sure cloud-storage.js is loaded");
        showToast("Cloud storage module not found. Posts may not persist across devices.", "warning");
    }
    
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
    const loginSection = document.getElementById('login-section');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (loginSection) loginSection.style.display = 'block';
    if (dashboardContent) dashboardContent.style.display = 'none';
}

// Show dashboard content, hide login form
function showDashboardContent() {
    const loginSection = document.getElementById('login-section');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    
    // Display username
    const username = API.auth.getCurrentUser();
    const usernameDisplay = document.getElementById('username-display');
    if (username && usernameDisplay) {
        usernameDisplay.textContent = username;
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
            const toast = document.getElementById('dashboard-toast');
            if (toast) toast.classList.remove('show');
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
            
            // Sync with cloud before loading dashboard
            await API.posts.initializeWithSampleData();
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

// In your dashboard.js file, update the loadDashboardData function:

async function loadDashboardData() {
    console.log("Loading dashboard data");
    
    try {
        // Try to force refresh from cloud first
        if (typeof API.refresh === 'function') {
            try {
                await API.refresh();
                console.log("Successfully refreshed data from cloud");
            } catch (refreshError) {
                console.warn("Couldn't refresh from cloud:", refreshError);
            }
        }
        
        // Then initialize with whatever data is available
        await API.posts.initializeWithSampleData();
        
        // Load stats and posts
        loadStats();
        loadPosts();
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Error syncing with cloud. Some data may not be up to date.", "warning");
        
        // Still try to load stats and posts from local storage
        loadStats();
        loadPosts();
    }
}

// Load and display post statistics
function loadStats() {
    try {
        const stats = API.posts.getStats();
        
        const totalPostsElement = document.getElementById('total-posts');
        const publishedPostsElement = document.getElementById('published-posts');
        const draftPostsElement = document.getElementById('draft-posts');
        
        if (totalPostsElement) totalPostsElement.textContent = stats.totalPosts;
        if (publishedPostsElement) publishedPostsElement.textContent = stats.publishedPosts;
        if (draftPostsElement) draftPostsElement.textContent = stats.draftPosts;
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
        const typeFilter = document.getElementById('filter-type')?.value || 'all';
        const statusFilter = document.getElementById('filter-status')?.value || 'all';
        
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
        
        let dateText = 'Unknown date';
        try {
            dateText = new Date(post.publishedAt).toLocaleDateString();
        } catch (e) {
            console.error('Error formatting date for post', post.id);
        }
        
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
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editPost(post.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                confirmDeletePost(post.id);
            });
        }
        
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
        const post = API.posts.getPostById(parseInt(postId));
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        // Update form title
        const formTitle = document.getElementById('form-title');
        if (formTitle) {
            formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Post';
        }
        
        // Fill form with post data
        const idInput = document.getElementById('post-id');
        const titleInput = document.getElementById('post-title');
        const typeInput = document.getElementById('post-type');
        const excerptInput = document.getElementById('post-excerpt');
        const contentInput = document.getElementById('post-content');
        const tagsInput = document.getElementById('post-tags');
        const imageInput = document.getElementById('post-image');
        const publishedInput = document.getElementById('post-published');
        
        if (idInput) idInput.value = post.id;
        if (titleInput) titleInput.value = post.title;
        if (typeInput) typeInput.value = post.contentType;
        if (excerptInput) excerptInput.value = post.excerpt;
        if (contentInput) contentInput.value = post.content;
        if (tagsInput) tagsInput.value = post.tags ? post.tags.join(', ') : '';
        if (imageInput) imageInput.value = post.imageUrl || '';
        if (publishedInput) publishedInput.checked = post.isPublished;
        
        // Update submit button text
        const submitButton = document.querySelector('#create-post-form button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Update Post';
        }
        
        // Scroll to form
        const formSection = document.querySelector('.dashboard-form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error editing post:', error);
        showToast('Failed to load post data', 'error');
    }
}

// Reset the post form
function resetPostForm() {
    console.log("Resetting post form");
    const form = document.getElementById('create-post-form');
    const idInput = document.getElementById('post-id');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.querySelector('#create-post-form button[type="submit"]');
    
    if (form) form.reset();
    if (idInput) idInput.value = '';
    
    // Reset form title and button
    if (formTitle) formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Create New Post';
    if (submitButton) submitButton.textContent = 'Save Post';
}

// Handle post form submission
async function handlePostSubmit() {
    console.log("Post form submitted");
    try {
        const form = document.getElementById('create-post-form');
        if (!form) {
            throw new Error('Form not found');
        }
        
        const formData = new FormData(form);
        
        // Show processing message
        showToast('Processing your request...', 'info');
        
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
        const post = API.posts.getPostById(parseInt(postId));
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        // Set up confirmation modal
        const messageElement = document.getElementById('confirmation-message');
        const confirmAction = document.getElementById('confirm-action');
        const modal = document.getElementById('confirmation-modal');
        
        if (messageElement) {
            messageElement.textContent = 
                `Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`;
        }
        
        // Store post ID for confirmation action
        if (confirmAction) {
            confirmAction.setAttribute('data-post-id', postId);
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error preparing delete confirmation:', error);
        showToast('Error loading post information', 'error');
    }
}

// Close the confirmation modal
function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Execute the confirmed delete action
async function executeConfirmedAction() {
    try {
        // Get post ID from button data attribute
        const confirmAction = document.getElementById('confirm-action');
        if (!confirmAction) {
            throw new Error('Confirmation button not found');
        }
        
        const postId = confirmAction.getAttribute('data-post-id');
        
        if (!postId) {
            throw new Error('Post ID not found');
        }
        
        // Show processing message
        showToast('Processing your request...', 'info');
        
        // Delete the post
        const deletedPost = await API.posts.deletePost(parseInt(postId));
        
        // Show success message and close modal
        showToast(`Post "${deletedPost.title}" deleted successfully`);
        closeConfirmationModal();
        
        // Refresh dashboard data
        loadDashboardData();
        
        // Reset form if we were editing this post
        const editingId = document.getElementById('post-id')?.value;
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
    
    if (!toast || !toastMessage || !toastIcon) {
        console.error('Toast elements not found in DOM');
        alert(message); // Fallback if toast elements not found
        return;
    }
    
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

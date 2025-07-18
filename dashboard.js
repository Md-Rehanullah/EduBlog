let posts = [];
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
let currentPostId = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    if (isAuthenticated) {
        loadPosts();
    }
});

// Check authentication status
function checkAuth() {
    if (isAuthenticated) {
        document.getElementById('password-section').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
    } else {
        document.getElementById('password-section').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Password form submission
    const passwordForm = document.getElementById('dashboard-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('dashboard-password').value;
            // UPDATED PASSWORD HERE:
            if (password === 'admin 123') {
                isAuthenticated = true;
                localStorage.setItem('isAuthenticated', 'true');
                checkAuth();
                loadPosts();
            } else {
                alert('Incorrect password. Please try again.');
                document.getElementById('dashboard-password').value = '';
            }
        });
    }

    // Create/Edit post form submission
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePost();
        });
    }

    // Reset form button
    const resetFormBtn = document.getElementById('reset-form-btn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetForm);
    }

    // Filter change events
    document.getElementById('filter-type').addEventListener('change', filterPosts);
    document.getElementById('filter-status').addEventListener('change', filterPosts);
    
    // Confirmation modal buttons
    document.getElementById('cancel-action').addEventListener('click', closeModal);
    document.getElementById('confirm-action').addEventListener('click', executeAction);
}

// ... rest of your file remains unchanged ...

// Load posts from storage
function loadPosts() {
    try {
        // Try to load from GitHub Gist
        fetch('https://api.github.com/gists/6e5ce45bf729f33d108030b9e1fb6c74.js')
            .then(response => response.ok ? response.json() : Promise.reject('Failed to load from Gist'))
            .then(gistData => {
                const postsContent = gistData.files['edublog-posts.json'].content;
                posts = JSON.parse(postsContent);
                renderPosts();
                updateStats();
            })
            .catch(error => {
                console.error('Failed to load from Gist:', error);
                // Fallback to localStorage
                const savedPosts = localStorage.getItem('edublog-posts');
                if (savedPosts) {
                    posts = JSON.parse(savedPosts);
                    renderPosts();
                    updateStats();
                } else {
                    document.getElementById('posts-list').innerHTML = '<div class="no-posts">No posts found. Create your first post!</div>';
                }
            });
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-list').innerHTML = '<div class="error">Error loading posts. Please try again.</div>';
    }
}

// Render posts in the list
function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    // Get filter values
    const typeFilter = document.getElementById('filter-type').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    // Filter posts
    let filteredPosts = [...posts];
    if (typeFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.contentType === typeFilter);
    }
    if (statusFilter !== 'all') {
        const isPublished = statusFilter === 'published';
        filteredPosts = filteredPosts.filter(post => post.isPublished === isPublished);
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Render posts
    if (filteredPosts.length === 0) {
        postsList.innerHTML = '<div class="no-posts">No posts match the selected filters.</div>';
        return;
    }
    
    postsList.innerHTML = '';
    
    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.dataset.id = post.id;
        
        const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusBadge = post.isPublished ? 
            '<span class="status-badge published">Published</span>' : 
            '<span class="status-badge draft">Draft</span>';
        
        const typeLabel = post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1);
        
        postElement.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">
                    ${statusBadge}
                    <span class="post-type">${typeLabel}</span>
                    <span class="post-date">${publishedDate}</span>
                </div>
            </div>
            <div class="post-excerpt">${post.excerpt}</div>
            <div class="post-actions">
                <button class="btn btn-sm btn-edit" data-id="${post.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-delete" data-id="${post.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
                ${post.isPublished ? `
                <button class="btn btn-sm btn-view" data-id="${post.id}">
                    <i class="fas fa-eye"></i> View
                </button>
                ` : ''}
            </div>
        `;
        
        postsList.appendChild(postElement);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.id);
            editPost(postId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.id);
            confirmDelete(postId);
        });
    });
    
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.id);
            window.open(`index.html#post-${postId}`, '_blank');
        });
    });
}

// Filter posts based on selections
function filterPosts() {
    renderPosts();
}

// Update statistics
function updateStats() {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.isPublished).length;
    const draftPosts = totalPosts - publishedPosts;
    
    document.getElementById('total-posts').textContent = totalPosts;
    document.getElementById('published-posts').textContent = publishedPosts;
    document.getElementById('draft-posts').textContent = draftPosts;
}

// Save or update a post
function savePost() {
    const form = document.getElementById('create-post-form');
    const formData = new FormData(form);
    
    const title = formData.get('title');
    const contentType = formData.get('contentType');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const tagsString = formData.get('tags');
    const imageUrl = formData.get('image');
    const isPublished = formData.get('published') === 'on';
    const postId = formData.get('id') || Date.now();
    
    if (!title || !contentType || !excerpt || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
    
    const postData = {
        id: parseInt(postId),
        title,
        excerpt,
        content,
        contentType,
        tags,
        imageUrl: imageUrl || null,
        publishedAt: new Date().toISOString().split('T')[0],
        isPublished
    };
    
    // Check if we're updating an existing post
    const existingIndex = posts.findIndex(p => p.id === postData.id);
    if (existingIndex !== -1) {
        // Update existing post
        posts[existingIndex] = postData;
    } else {
        // Add new post
        posts.unshift(postData);
    }
    
    // Save to localStorage
    localStorage.setItem('edublog-posts', JSON.stringify(posts));
    
    // Try to save to GitHub Gist
    saveToGist();
    
    // Update UI
    renderPosts();
    updateStats();
    resetForm();
    
    alert(`Post "${title}" has been ${existingIndex !== -1 ? 'updated' : 'created'} successfully!`);
}

// Edit an existing post
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Fill the form with post data
    document.getElementById('post-id').value = post.id;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-type').value = post.contentType;
    document.getElementById('post-excerpt').value = post.excerpt;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
    document.getElementById('post-image').value = post.imageUrl || '';
    document.getElementById('post-published').checked = post.isPublished;
    
    // Scroll to form
    document.getElementById('create-post-form').scrollIntoView({ behavior: 'smooth' });
    
    // Update button text
    document.querySelector('#create-post-form button[type="submit"]').textContent = 'Update Post';
    document.querySelector('.dashboard-form-section h2').innerHTML = '<i class="fas fa-edit"></i> Edit Post';
    
    currentPostId = postId;
}

// Confirm deletion of a post
function confirmDelete(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    document.getElementById('confirmation-message').textContent = `Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`;
    document.getElementById('confirm-action').dataset.id = postId;
    
    // Show modal
    document.getElementById('confirmation-modal').classList.add('active');
}

// Execute the deletion after confirmation
function executeAction() {
    const postId = parseInt(this.dataset.id);
    deletePost(postId);
    closeModal();
}

// Delete a post
function deletePost(postId) {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    const postTitle = posts[postIndex].title;
    posts.splice(postIndex, 1);
    
    // Save to localStorage
    localStorage.setItem('edublog-posts', JSON.stringify(posts));
    
    // Try to save to GitHub Gist
    saveToGist();
    
    // Update UI
    renderPosts();
    updateStats();
    
    alert(`Post "${postTitle}" has been deleted successfully!`);
    
    // Reset form if we were editing the deleted post
    if (currentPostId === postId) {
        resetForm();
    }
}

// Close confirmation modal
function closeModal() {
    document.getElementById('confirmation-modal').classList.remove('active');
}

// Reset the form
function resetForm() {
    document.getElementById('create-post-form').reset();
    document.getElementById('post-id').value = '';
    document.querySelector('#create-post-form button[type="submit"]').textContent = 'Save Post';
    document.querySelector('.dashboard-form-section h2').innerHTML = '<i class="fas fa-plus-circle"></i> Create New Post';
    currentPostId = null;
}

// Save posts to GitHub Gist
async function saveToGist() {
    // This function would actually save to GitHub Gist
    // For now, we'll just simulate it
    console.log('Posts would be saved to GitHub Gist here');
  
    const gistData = {
        files: {
            'edublog-posts.json': {
                content: JSON.stringify(posts)
            }
        }
    };
    
    try {
        const response = await fetch('https://api.github.com/gists/6e5ce45bf729f33d108030b9e1fb6c74.js', {
            method: 'PATCH',
            headers: {
                'Authorization': `token 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to Gist');
        }
        
        console.log('Posts saved to GitHub Gist successfully');
    } catch (error) {
        console.error('Error saving to Gist:', error);
    }
   
}

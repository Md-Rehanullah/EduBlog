const GIST_ID = 'YOUR_GIST_ID'; // Replace with your actual Gist ID
const GIST_FILENAME = 'edublog-posts.json';
const GIST_TOKEN = 'YOUR_GITHUB_TOKEN'; // Create a personal access token with gist scope


// Global state
let posts = [];
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    setupEventListeners();
    updateAuthUI();
});

// Initialize application
function initializeApp() {
    console.log('EduBlog application initialized');
}

// Load sample data and posts from GitHub Gist
async function loadSampleData() {
    try {
        // Try to load posts from GitHub Gist
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        if (response.ok) {
            const gistData = await response.json();
            const postsContent = gistData.files[GIST_FILENAME].content;
            posts = JSON.parse(postsContent);
        } else {
            throw new Error('Gist not found');
        }
    } catch (error) {
        console.log('Loading from gist failed, using localStorage as fallback');
        const savedPosts = localStorage.getItem('edublog-posts');
        if (savedPosts) {
            posts = JSON.parse(savedPosts);
        } else {
            // Use sample data if nothing is available
            posts = [
                // Your existing sample posts here
            ];
            localStorage.setItem('edublog-posts', JSON.stringify(posts));
        }
    }
    renderPosts();
}

try {
        // Try to load posts from GitHub Gist
        async function savePostsToGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GIST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify(posts)
                    }
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to Gist');
        }
        return true;
    } catch (error) {
        console.error('Error saving to Gist:', error);
        // Fallback to localStorage
        localStorage.setItem('edublog-posts', JSON.stringify(posts));
        return false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Admin access button
    const adminAccessBtn = document.getElementById('admin-access-btn');
    if (adminAccessBtn) {
        adminAccessBtn.addEventListener('click', showPasswordModal);
    }

    // Create post button
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', showCreatePostModal);
    }

    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // Cancel password modal
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hidePasswordModal);
    }

    // Create post form
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
    }

    // Save draft button
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => handleCreatePost(null, false));
    }

    // Close create post modal
    const closeCreateModal = document.getElementById('close-create-modal');
    if (closeCreateModal) {
        closeCreateModal.addEventListener('click', hideCreatePostModal);
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const passwordModal = document.getElementById('password-modal');
        const createPostModal = document.getElementById('create-post-modal');
        
        if (e.target === passwordModal) {
            hidePasswordModal();
        }
        if (e.target === createPostModal) {
            hideCreatePostModal();
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Authentication functions
function updateAuthUI() {
    const adminAccessBtn = document.getElementById('admin-access-btn');
    const createPostBtn = document.getElementById('create-post-btn');
    
    if (isAuthenticated) {
        adminAccessBtn.style.display = 'none';
        createPostBtn.style.display = 'inline-flex';
    } else {
        adminAccessBtn.style.display = 'inline-flex';
        createPostBtn.style.display = 'none';
    }
}

function showPasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.classList.add('active');
    document.getElementById('password').focus();
}

function hidePasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.classList.remove('active');
    document.getElementById('password-form').reset();
}

function handlePasswordSubmit(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === 'kaalel') {
        isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
        updateAuthUI();
        hidePasswordModal();
        showToast('Authentication successful! You can now create posts.');
    } else {
        showToast('Incorrect password. Please try again.', 'error');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// Create post functions
function showCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    modal.classList.add('active');
}

function hideCreatePostModal() {
    const modal = document.getElementById('create-post-modal');
    modal.classList.remove('active');
    document.getElementById('create-post-form').reset();
}

async function handleCreatePost(e, isPublished = true) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('create-post-form');
    const formData = new FormData(form);
    
    const title = formData.get('title');
    const contentType = formData.get('contentType');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const tagsString = formData.get('tags');
    
    if (!title || !contentType || !excerpt || !content) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
    
    const newPost = {
        id: Date.now(),
        title,
        excerpt,
        content,
        contentType,
        tags,
        publishedAt: new Date().toISOString().split('T')[0],
        isPublished
    };
    
    posts.unshift(newPost);
    
    // Save to localStorage as backup
    localStorage.setItem('edublog-posts', JSON.stringify(posts));
    
    // Try to save to GitHub Gist for persistence
    try {
        await savePostsToGist();
    } catch (error) {
        console.log('Failed to save to gist, saved locally only');
    }
    
    renderPosts();
    hideCreatePostModal();
    
    const message = isPublished ? 'Post published successfully!' : 'Post saved as draft!';
    showToast(message);
}

// Function to save posts to GitHub Gist
async function savePostsToGist() {
    // This function will be used to save posts to a GitHub Gist
    // For now, we'll keep using localStorage
    // You can implement GitHub Gist integration later if needed
    return Promise.resolve();
}

// Contact form handler with email functionality
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    const messageData = {
        studentName: formData.get('studentName'),
        studentEmail: formData.get('studentEmail'),
        subject: formData.get('subject'),
        relatedContent: formData.get('relatedContent'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on',
        timestamp: new Date().toISOString()
    };
    
    // Save message to localStorage
    const messages = JSON.parse(localStorage.getItem('edublog-messages') || '[]');
    messages.unshift(messageData);
    localStorage.setItem('edublog-messages', JSON.stringify(messages));
    
    // Send email using EmailJS
    try {
        await sendEmailNotification(messageData);
        form.reset();
        showToast('Message sent successfully! I\'ll get back to you within 24 hours.');
    } catch (error) {
        console.error('Email sending failed:', error);
        form.reset();
        showToast('Message saved! I\'ll get back to you within 24 hours.');
    }
}

// Function to send email notification
async function sendEmailNotification(messageData) {
    // Using EmailJS service for sending emails
    const emailData = {
        to_email: 'mdchild21@gmail.com',
        from_name: messageData.studentName,
        from_email: messageData.studentEmail,
        subject: `New message from ${messageData.studentName}: ${messageData.subject}`,
        message: `
Student Name: ${messageData.studentName}
Email: ${messageData.studentEmail}
Subject: ${messageData.subject}
Related Content: ${messageData.relatedContent || 'None'}
Newsletter Subscription: ${messageData.newsletter ? 'Yes' : 'No'}

Message:
${messageData.message}

Sent from EduBlog contact form at ${new Date(messageData.timestamp).toLocaleString()}
        `,
        reply_to: messageData.studentEmail
    };

    // Using a free email service API (Formspree)
    const response = await fetch('https://formspree.io/f/xzzgnnod', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: messageData.studentEmail,
            name: messageData.studentName,
            subject: messageData.subject,
            message: `
Name: ${messageData.studentName}
Email: ${messageData.studentEmail}
Subject: ${messageData.subject}
Related Content: ${messageData.relatedContent || 'None'}
Newsletter: ${messageData.newsletter ? 'Yes' : 'No'}

Message:
${messageData.message}
            `,
            _replyto: messageData.studentEmail,
            _subject: `EduBlog Contact: ${messageData.subject}`
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    return response;
}

// Render posts
function renderPosts() {
    const blogsGrid = document.getElementById('blogs-grid');
    const storiesGrid = document.getElementById('stories-grid');
    const newsGrid = document.getElementById('news-grid');
    
    if (!blogsGrid || !storiesGrid || !newsGrid) return;
    
    // Clear existing content
    blogsGrid.innerHTML = '';
    storiesGrid.innerHTML = '';
    newsGrid.innerHTML = '';
    
    // Filter and render posts by type
    const publishedPosts = posts.filter(post => post.isPublished);
    
    const blogs = publishedPosts.filter(post => post.contentType === 'blog').slice(0, 6);
    const stories = publishedPosts.filter(post => post.contentType === 'story').slice(0, 6);
    const news = publishedPosts.filter(post => post.contentType === 'news').slice(0, 6);
    
    blogs.forEach(post => blogsGrid.appendChild(createPostCard(post)));
    stories.forEach(post => storiesGrid.appendChild(createPostCard(post)));
    news.forEach(post => newsGrid.appendChild(createPostCard(post)));
    
    // Show message if no posts
    if (blogs.length === 0) {
        blogsGrid.innerHTML = '<p class="loading">No blog posts available yet.</p>';
    }
    if (stories.length === 0) {
        storiesGrid.innerHTML = '<p class="loading">No stories available yet.</p>';
    }
    if (news.length === 0) {
        newsGrid.innerHTML = '<p class="loading">No news articles available yet.</p>';
    }
}

// Create post card element
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = `content-card ${post.contentType}`;
    
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const contentTypeLabel = post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1);
    
    card.innerHTML = `
        <div class="content-header">
            <div class="content-meta">
                <span class="content-badge">${contentTypeLabel}</span>
                <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
            </div>
            <h3 class="content-title">${post.title}</h3>
            <p class="content-excerpt">${post.excerpt}</p>
        </div>
        <div class="content-body">
            ${post.tags && post.tags.length > 0 ? `
                <div class="content-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <a href="#" class="read-more" onclick="openPostModal(${post.id})">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return card;
}

// Open post in modal (for full content reading)
function openPostModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Create modal for full post content
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <button type="button" class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <article class="post-content">
                <header class="post-header">
                    <span class="content-badge">${post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1)}</span>
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(post.publishedAt).toLocaleDateString()}</span>
                        ${post.tags && post.tags.length > 0 ? `
                            <div class="content-tags">
                                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </header>
                <div class="post-body">
                    ${markdownToHtml(post.content)}
                </div>
            </article>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
        return '<ul>' + match + '</ul>';
    });
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
    html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1');
    
    return html;
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('success-toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Logout function (for future use)
function logout() {
    isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    updateAuthUI();
    showToast('Logged out successfully.');
}

// Export for potential use in other files
window.EduBlog = {
    posts,
    isAuthenticated,
    logout,
    showToast,
    openPostModal
};


//extra parsts
const scrollToTopButton = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});






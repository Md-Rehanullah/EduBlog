/**
 * EduBlog Main Script
 * Handles the functionality of the main website pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check and update UI based on authentication status
    updateAuthUI();
    
    // Load posts into content sections
    loadPosts();
});

// Initialize the application
function initApp() {
    // Set CSRF tokens for forms
    const csrfToken = API.generateCsrfToken();
    document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
        input.value = csrfToken;
    });
    
    // Initialize the back to top button
    initBackToTopButton();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Close buttons for modals
    document.querySelectorAll('.close-btn, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Close toast notification
    document.querySelector('.toast-close')?.addEventListener('click', () => {
        document.getElementById('toast').classList.remove('show');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without page reload
                history.pushState(null, '', this.getAttribute('href'));
            }
        });
    });
}

// Load posts for different sections
async function loadPosts() {
    // Show loading state
    document.getElementById('content-loading').classList.add('active');
    
    try {
        // Load blogs
        const blogsData = API.posts.getPosts({
            contentType: 'blog',
            isPublished: true,
            limit: 6
        });
        renderPostsSection('blogs-grid', blogsData.posts, blogsData.pagination);
        
        // Load stories
        const storiesData = API.posts.getPosts({
            contentType: 'story',
            isPublished: true,
            limit: 6
        });
        renderPostsSection('stories-grid', storiesData.posts, storiesData.pagination);
        
        // Load news
        const newsData = API.posts.getPosts({
            contentType: 'news',
            isPublished: true,
            limit: 6
        });
        renderPostsSection('news-grid', newsData.posts, newsData.pagination);
    } catch (error) {
        console.error('Error loading posts:', error);
        showToast('Failed to load content. Please refresh the page.', 'error');
    } finally {
        // Hide loading state
        document.getElementById('content-loading').classList.remove('active');
    }
}

// Render posts in a specific section
function renderPostsSection(sectionId, posts, pagination) {
    const sectionElement = document.getElementById(sectionId);
    const paginationElement = document.getElementById(sectionId.replace('grid', 'pagination'));
    
    if (!sectionElement) return;
    
    // Clear existing content
    sectionElement.innerHTML = '';
    
    // Handle empty state
    if (!posts.length) {
        sectionElement.innerHTML = '<div class="empty-state">No content available yet.</div>';
        return;
    }
    
    // Create post cards
    posts.forEach(post => {
        const card = createPostCard(post);
        sectionElement.appendChild(card);
    });
    
    // Render pagination if provided
    if (paginationElement && pagination && pagination.totalPages > 1) {
        renderPagination(paginationElement, pagination, (page) => {
            // Handle page change
            const options = {
                contentType: sectionId.includes('blog') ? 'blog' : 
                             sectionId.includes('stories') ? 'story' : 'news',
                isPublished: true,
                page: page,
                limit: 6
            };
            
            const data = API.posts.getPosts(options);
            renderPostsSection(sectionId, data.posts, data.pagination);
        });
    }
}

// Create a post card element
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = `content-card ${post.contentType}`;
    card.setAttribute('data-id', post.id);
    
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
                <span><i class="fas fa-calendar" aria-hidden="true"></i> ${publishedDate}</span>
            </div>
            <h3 class="content-title">${post.title}</h3>
            <p class="content-excerpt">${post.excerpt}</p>
        </div>
        <div class="content-body">
            ${post.tags && post.tags.length > 0 ? `
                <div class="content-tags" aria-label="Tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <button class="read-more btn btn-text" data-id="${post.id}">
                Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    // Add click event to open post
    card.querySelector('.read-more').addEventListener('click', function() {
        openPostDetail(post.id);
    });
    
    return card;
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
    prevButton.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i> Prev';
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
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right" aria-hidden="true"></i>';
    nextButton.className = 'pagination-link';
    nextButton.disabled = pagination.page >= pagination.totalPages;
    nextButton.setAttribute('aria-label', 'Next page');
    nextButton.addEventListener('click', () => onPageChange(pagination.page + 1));
    nextLi.appendChild(nextButton);
    ul.appendChild(nextLi);
    
    element.appendChild(ul);
}

// Open post detail in modal
function openPostDetail(postId) {
    const post = API.posts.getPostById(postId);
    if (!post) {
        showToast('Post not found', 'error');
        return;
    }
    
    const modal = document.getElementById('post-detail-modal');
    const contentElement = document.getElementById('post-detail-content');
    
    if (!modal || !contentElement) return;
    
    // Format date
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Convert content markdown to HTML
    const contentHtml = markdownToHtml(post.content);
    
    // Set modal content
    contentElement.innerHTML = `
        <header class="post-header">
            <span class="content-badge">${post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1)}</span>
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span><i class="fas fa-calendar" aria-hidden="true"></i> ${publishedDate}</span>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="content-tags" aria-label="Tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </header>
        <div class="post-body">
            ${contentHtml}
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    
    // Set focus to close button for accessibility
    document.getElementById('close-post-detail').focus();
    
    // Add close event listeners
    document.getElementById('close-post-detail').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Convert markdown to HTML
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
    
    // Wrap lists
    let inList = false;
    let listType = '';
    let listItems = [];
    
    // Process line by line for lists
    const lines = html.split('\n');
    const processedLines = [];
    
    for (const line of lines) {
        if (line.match(/<li>/)) {
            // Determine list type if starting a new list
            if (!inList) {
                inList = true;
                // Check if it's an ordered list
                if (line.match(/^\d+\./)) {
                    listType = 'ol';
                } else {
                    listType = 'ul';
                }
            }
            listItems.push(line);
        } else {
            // End list if we were in one
            if (inList) {
                processedLines.push(`<${listType}>${listItems.join('')}</${listType}>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(line);
        }
    }
    
    // Handle case where document ends with a list
    if (inList) {
        processedLines.push(`<${listType}>${listItems.join('')}</${listType}>`);
    }
    
    html = processedLines.join('\n');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.match(/^<([a-z][a-z0-9]*)[^>]*>/i)) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    // Check CSRF token
    const token = document.getElementById('csrf-token').value;
    if (!API.verifyCsrfToken(token)) {
        showToast('Form validation failed. Please refresh the page and try again.', 'error');
        return;
    }
    
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    // Prepare message data
    const messageData = {
        studentName: formData.get('studentName'),
        studentEmail: formData.get('studentEmail'),
        subject: formData.get('subject'),
        relatedContent: formData.get('relatedContent'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on'
    };
    
    try {
        // Save message locally
        API.contact.saveMessage(messageData);
        
        // Try to send email notification
        await API.contact.sendMessageEmail(messageData);
        
        // Reset form and show success message
        form.reset();
        showToast('Message sent successfully! We\'ll get back to you within 24 hours.');
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('There was a problem sending your message. Please try again later.', 'error');
    }
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    
    // Reset error state
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await API.auth.login({ username, password });
        
        if (result.success) {
            // Close modal
            closeAllModals();
            
            // Update UI
            updateAuthUI();
            
            // Show success message
            showToast(`Welcome back, ${result.username}!`);
            
            // Redirect to dashboard if clicked from dashboard button
            const dashboardLink = document.getElementById('dashboard-link');
            if (dashboardLink) {
                window.location.href = 'dashboard.html';
            }
        }
    } catch (error) {
        errorElement.textContent = error.error || 'Invalid login credentials';
        errorElement.classList.remove('hidden');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
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

// Update UI based on authentication status
function updateAuthUI() {
    const isAuthenticated = API.auth.isAuthenticated();
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (dashboardLink) {
        dashboardLink.classList.toggle('hidden', !isAuthenticated);
    }
}

// Close all open modals
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Initialize back to top button
function initBackToTopButton() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    if (!scrollToTopButton) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}





// Add this function to your script.js

// Function to check for post query parameter in URL
function checkForPostParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
        try {
            const post = API.posts.getPostById(parseInt(postId));
            if (post) {
                openPostDetail(post.id);
            }
        } catch (error) {
            console.error('Error loading post from URL:', error);
        }
    }
}

// Make sure to call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Your existing initialization code...
    
    // Load posts
    loadPosts();
    
    // Check for post in URL
    checkForPostParam();
});

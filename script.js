/**
 * EduBlog Main Script - Fixed Version
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("EduBlog main script initialized");
    
    // Check if API is available
    if (typeof API === 'undefined') {
        console.error("API module not found. Make sure api.js is loaded before script.js");
        showErrorMessage("Failed to load core components. Please refresh the page or check your connection.");
        return;
    }
    
    // Check if CloudStorage is available
    if (typeof CloudStorage === 'undefined') {
        console.error("CloudStorage module not found. Make sure cloud-storage.js is loaded before api.js");
        showErrorMessage("Failed to load cloud storage component. Posts may not persist across sessions.");
    }
    
    // Initialize with data from cloud
    initializeWithCloudData();
});

// Show error message in content grids
function showErrorMessage(message) {
    document.querySelectorAll('.content-grid').forEach(grid => {
        if (grid) {
            grid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    });
    
    const loadingElement = document.getElementById('content-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// In your script.js file, update the initializeWithCloudData function:

async function initializeWithCloudData() {
    try {
        // Show loading state
        const loadingElement = document.getElementById('content-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // Force refresh from cloud if possible
        if (typeof API.refresh === 'function') {
            try {
                await API.refresh();
                console.log("Successfully refreshed data from cloud");
            } catch (refreshError) {
                console.warn("Couldn't refresh from cloud:", refreshError);
            }
        }
        
        // Initialize app with data
        await API.posts.initializeWithSampleData();
        
        // Set up app after data is loaded
        initApp();
        setupEventListeners();
        updateAuthUI();
        
        // Load posts
        loadPosts();
        
        // Check for post in URL
        checkForPostParam();
    } catch (error) {
        console.error("Error initializing app with cloud data:", error);
        
        // Still try to show whatever we can
        initApp();
        setupEventListeners();
        updateAuthUI();
        loadPosts();
    } finally {
        // Hide loading indicator
        const loadingElement = document.getElementById('content-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Initialize the application
function initApp() {
    // Set CSRF tokens for forms if they exist
    const csrfToken = API.generateCsrfToken();
    document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
        input.value = csrfToken;
    });
    
    // Initialize the back to top button if it exists
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
    
    // Close buttons for modals
    document.querySelectorAll('.close-btn, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Close toast notification
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', () => {
            const toast = document.getElementById('toast');
            if (toast) toast.classList.remove('show');
        });
    }
    
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
                
                history.pushState(null, '', this.getAttribute('href'));
            }
        });
    });
}

// Load posts for different sections
function loadPosts() {
    console.log("Loading posts for display");
    
    try {
        // Get all published posts from each category
        const blogsData = API.posts.getPosts({
            contentType: 'blog',
            isPublished: true,
            limit: 6
        });
        
        const storiesData = API.posts.getPosts({
            contentType: 'story',
            isPublished: true,
            limit: 6
        });
        
        const newsData = API.posts.getPosts({
            contentType: 'news',
            isPublished: true,
            limit: 6
        });
        
        // Render each section if their container exists
        const blogsGrid = document.getElementById('blogs-grid');
        if (blogsGrid) {
            renderPostsSection('blogs-grid', blogsData.posts, blogsData.pagination);
        }
        
        const storiesGrid = document.getElementById('stories-grid');
        if (storiesGrid) {
            renderPostsSection('stories-grid', storiesData.posts, storiesData.pagination);
        }
        
        const newsGrid = document.getElementById('news-grid');
        if (newsGrid) {
            renderPostsSection('news-grid', newsData.posts, newsData.pagination);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showErrorMessage('Failed to load content. Please refresh the page.');
    }
}

// Render posts in a specific section
function renderPostsSection(sectionId, posts, pagination) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;
    
    // Clear existing content
    sectionElement.innerHTML = '';
    
    // Handle empty state
    if (!posts || posts.length === 0) {
        sectionElement.innerHTML = '<div class="empty-state">No content available yet.</div>';
        return;
    }
    
    // Create post cards
    posts.forEach(post => {
        const card = createPostCard(post);
        sectionElement.appendChild(card);
    });
    
    // Render pagination if container exists
    const paginationElement = document.getElementById(sectionId.replace('grid', 'pagination'));
    if (paginationElement && pagination && pagination.totalPages > 1) {
        renderPagination(paginationElement, pagination, (page) => {
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
    
    // Format date safely
    let publishedDate = 'Unknown date';
    try {
        publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        console.error('Error formatting date for post', post.id);
    }
    
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
    
    if (!pagination || pagination.totalPages <= 1) return;
    
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
    try {
        const post = API.posts.getPostById(postId);
        if (!post) {
            showToast('Post not found', 'error');
            return;
        }
        
        const modal = document.getElementById('post-detail-modal');
        const contentElement = document.getElementById('post-detail-content');
        
        if (!modal || !contentElement) {
            console.error('Modal elements not found in the DOM');
            return;
        }
        
        // Format date
        let publishedDate = 'Unknown date';
        try {
            publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error formatting date');
        }
        
        // Convert content markdown to HTML
        const contentHtml = markdownToHtml(post.content);
        
        // Update modal title
        const titleElement = document.getElementById('post-detail-title');
        if (titleElement) {
            titleElement.textContent = post.title;
        }
        
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
        
        // Set up close button
        const closeButton = document.getElementById('close-post-detail');
        if (closeButton) {
            // Remove existing event listeners to prevent duplicates
            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);
            
            newCloseButton.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // Focus on close button for accessibility
            newCloseButton.focus();
        }
        
        // Close when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error opening post detail:', error);
        showToast('Failed to load post. Please try again.', 'error');
    }
}

// Convert markdown to HTML
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    try {
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
    } catch (error) {
        console.error('Error parsing markdown:', error);
        return '<p>Error displaying content. Please try again later.</p>';
    }
    
    return html;
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    // Check CSRF token if available
    const tokenInput = document.getElementById('csrf-token');
    if (tokenInput) {
        const token = tokenInput.value;
        if (!API.verifyCsrfToken(token)) {
            showToast('Form validation failed. Please refresh the page and try again.', 'error');
            return;
        }
    }
    
    const form = document.getElementById('contact-form');
    if (!form) return;
    
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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    if (!toast || !toastMessage || !toastIcon) {
        console.error('Toast elements not found');
        alert(message); // Fallback to alert if toast elements aren't available
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    // Update icon based on type
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle';
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





// Add to your existing script.js file

// Function to force sync with cloud on page load
async function forceSyncWithCloud() {
    try {
        if (typeof API.syncWithCloud === 'function') {
            const syncResult = await API.syncWithCloud();
            if (syncResult) {
                console.log("Successfully synchronized with cloud storage");
            }
        }
    } catch (error) {
        console.error("Error syncing with cloud:", error);
    }
}

// Update your initializeWithCloudData function
async function initializeWithCloudData() {
    try {
        // Show loading state if element exists
        const loadingElement = document.getElementById('content-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // First sync with cloud
        await forceSyncWithCloud();
        
        // Initialize app with data
        await API.posts.initializeWithSampleData();
        
        // Set up app after data is loaded
        initApp();
        setupEventListeners();
        updateAuthUI();
        
        // Load posts
        loadPosts();
        
        // Check for post in URL
        checkForPostParam();
    } catch (error) {
        console.error("Error initializing app with cloud data:", error);
        
        // Still try to show whatever we can
        initApp();
        setupEventListeners();
        updateAuthUI();
        loadPosts();
    } finally {
        // Hide loading indicator
        const loadingElement = document.getElementById('content-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Listen for data update events
document.addEventListener('edublog-data-updated', function() {
    console.log('Data updated from another source, refreshing content');
    loadPosts();
});

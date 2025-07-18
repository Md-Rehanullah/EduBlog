/**
 * EduBlog Main Script
 * Handles the functionality of the main website pages
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("EduBlog index page loaded");
    
    // Check if API is available
    if (typeof API === 'undefined') {
        console.error("API module not found! Make sure api.js is loaded before script.js");
        displayErrorMessage();
        return;
    }
    
    // Initialize the API with sample data if needed - now with cloud sync
    initializeData();
    
    // Setup navigation and UI event listeners
    setupNavigation();
});

// Initialize data with cloud sync
async function initializeData() {
    try {
        // Show loading indicator
        showLoadingIndicator(true);
        
        // Initialize and sync data with cloud
        await API.posts.initializeWithSampleData();
        
        // Load posts into content sections
        loadAndDisplayPosts();
        
        // Check for post in URL parameters
        checkForPostInUrl();
    } catch (error) {
        console.error("Error initializing data:", error);
        showErrorMessage("Failed to load content. Please try again later.");
    } finally {
        // Hide loading indicator
        showLoadingIndicator(false);
    }
}

// Display error message if API isn't loaded
function displayErrorMessage() {
    const contentSections = document.querySelectorAll('.content-grid');
    contentSections.forEach(section => {
        section.innerHTML = '<div class="error-message">Failed to load content. Please refresh the page.</div>';
    });
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    const loadingElement = document.getElementById('content-loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showErrorMessage(message) {
    const contentSections = document.querySelectorAll('.content-grid');
    contentSections.forEach(section => {
        section.innerHTML = `<div class="error-message">${message}</div>`;
    });
}

// Set up navigation and UI event listeners
function setupNavigation() {
    // Mobile menu toggle
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
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(contactForm);
                const messageData = {
                    studentName: formData.get('studentName'),
                    studentEmail: formData.get('studentEmail'),
                    subject: formData.get('subject'),
                    relatedContent: formData.get('relatedContent') || '',
                    message: formData.get('message'),
                    newsletter: formData.get('newsletter') === 'on'
                };
                
                // Save message
                API.contact.saveMessage(messageData);
                
                // Reset form
                contactForm.reset();
                
                // Show confirmation
                alert('Thank you! Your message has been sent.');
            } catch (error) {
                console.error('Error sending message:', error);
                alert('There was an error sending your message. Please try again.');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

// Load and display posts
function loadAndDisplayPosts() {
    console.log("Loading posts for display");
    
    // Get all posts from the API
    try {
        const allPosts = API.posts.getAllPosts();
        console.log(`Found ${allPosts.length} total posts`);
        
        // Filter published posts
        const publishedPosts = allPosts.filter(post => post.isPublished === true);
        console.log(`${publishedPosts.length} published posts`);
        
        // Render blogs
        const blogsGrid = document.getElementById('blogs-grid');
        if (blogsGrid) {
            const blogs = publishedPosts.filter(post => post.contentType === 'blog');
            renderPostsToSection(blogsGrid, blogs);
        }
        
        // Render stories
        const storiesGrid = document.getElementById('stories-grid');
        if (storiesGrid) {
            const stories = publishedPosts.filter(post => post.contentType === 'story');
            renderPostsToSection(storiesGrid, stories);
        }
        
        // Render news
        const newsGrid = document.getElementById('news-grid');
        if (newsGrid) {
            const news = publishedPosts.filter(post => post.contentType === 'news');
            renderPostsToSection(newsGrid, news);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showErrorMessage('Failed to load content. Please refresh the page.');
    }
}

// Render posts to a specific section
function renderPostsToSection(sectionElement, posts) {
    // Clear existing content
    sectionElement.innerHTML = '';
    
    if (posts.length === 0) {
        sectionElement.innerHTML = '<div class="no-content">No content available yet.</div>';
        return;
    }
    
    // Render each post
    posts.forEach(post => {
        const postCard = createPostCard(post);
        sectionElement.appendChild(postCard);
    });
}

// Create a post card element
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = `content-card ${post.contentType}`;
    card.setAttribute('data-id', post.id);
    
    // Format date
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Get content type label
    const contentTypeLabel = post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1);
    
    // Create HTML for the card
    card.innerHTML = `
        <div class="content-header">
            <div class="content-meta">
                <span class="content-badge">${contentTypeLabel}</span>
                <span class="content-date"><i class="fas fa-calendar"></i> ${publishedDate}</span>
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
            <button class="read-more">Read More <i class="fas fa-arrow-right"></i></button>
        </div>
    `;
    
    // Add click event to show full content
    card.querySelector('.read-more').addEventListener('click', function() {
        displayFullPost(post);
    });
    
    return card;
}

// Display full post in modal
function displayFullPost(post) {
    console.log("Displaying full post:", post.id, post.title);
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('post-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'post-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Format date
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <button class="close-btn" onclick="closePostModal()">&times;</button>
            </div>
            <article class="post-content">
                <header>
                    <span class="content-badge">${post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1)}</span>
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
                    </div>
                </header>
                <div class="post-body">
                    ${formatPostContent(post.content)}
                </div>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-tags">
                        <strong>Tags:</strong> ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                    </div>
                ` : ''}
            </article>
        </div>
    `;
    
    // Show the modal
    modal.style.display = 'block';
    
    // Add click event to close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePostModal();
        }
    });
    
    // Make modal visible with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Format post content - simple markdown to HTML
function formatPostContent(content) {
    if (!content) return '';
    
    let html = content;
    
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
    
    // Wrap paragraphs
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
        if (p.trim().startsWith('<h') || p.trim().startsWith('<li>')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('\n');
    
    return html;
}

// Check for post ID in URL parameters
function checkForPostInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
        try {
            const post = API.posts.getPostById(parseInt(postId));
            if (post) {
                displayFullPost(post);
            }
        } catch (error) {
            console.error("Error loading post from URL:", error);
        }
    }
}

// Close post modal
function closePostModal() {
    const modal = document.getElementById('post-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Make close function available globally
window.closePostModal = closePostModal;

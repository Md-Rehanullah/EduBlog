/**
 * Simple EduBlog Script
 * This script uses post data from postuploader.js
 */

// Debug logging
console.log('Script.js loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log("EduBlog simple script initialized");
    
    // Check if post arrays are available
    console.log('Blog posts available:', typeof blogPosts !== 'undefined', blogPosts ? blogPosts.length : 0);
    console.log('Story posts available:', typeof storyPosts !== 'undefined', storyPosts ? storyPosts.length : 0);
    console.log('News posts available:', typeof newsPosts !== 'undefined', newsPosts ? newsPosts.length : 0);
    
    // Set up all event listeners
    setupEventListeners();
    
    // Display all content
    displayAllPosts();
});

// Function to display content on dedicated pages with pagination
function displayContentPage(contentType, containerId, paginationId) {
    console.log(`Displaying ${contentType} content in ${containerId}`);
    
    // Get the correct posts array based on content type
    let postsArray;
    switch (contentType) {
        case 'blog':
            postsArray = blogPosts;
            break;
        case 'story':
            postsArray = storyPosts;
            break;
        case 'news':
            postsArray = newsPosts;
            break;
        default:
            console.error('Invalid content type:', contentType);
            return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // If no posts or posts array undefined
    if (!postsArray || postsArray.length === 0) {
        container.innerHTML = '<div class="empty-state">No content available yet.</div>';
        return;
    }
    
    // Display all posts
    postsArray.forEach(post => {
        if (post.isPublished) {
            const card = createPostCard(post);
            container.appendChild(card);
        }
    });
}

// Function to display all posts on the index page
function displayAllPosts() {
    // Display each category of posts
    displayPosts('blogs-grid', blogPosts);
    displayPosts('stories-grid', storyPosts);
    displayPosts('news-grid', newsPosts);
}

// Display posts in their respective containers
function displayPosts(containerId, posts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear container
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="empty-state">No content available yet.</div>';
        return;
    }
    
    // Create post cards for each post
    posts.forEach(post => {
        const card = createPostCard(post);
        container.appendChild(card);
    });
}

// Create HTML for a post card
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = `content-card ${post.contentType}`;
    card.setAttribute('data-id', post.id);
    
    // Format date
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
    
    // Extract first image URL to use as thumbnail (if available)
    let thumbnailHtml = '';
    const imgMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch && imgMatch[1]) {
        thumbnailHtml = `
            <div class="content-thumbnail">
                <img src="${imgMatch[1]}" alt="Post thumbnail" loading="lazy">
            </div>
        `;
    }
    
    card.innerHTML = `
        ${thumbnailHtml}
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
    
    return card;
}

// Set up event listeners
function setupEventListeners() {
    // Navigation toggle for mobile - FIXED VERSION
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        console.log("Found navigation elements");
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Toggle button clicked");
            navMenu.classList.toggle('active');
            
            // Force display style to ensure it works
            if (navMenu.classList.contains('active')) {
                navMenu.style.display = 'flex';
                console.log("Navigation menu should be visible now");
            } else {
                navMenu.style.display = '';
                console.log("Navigation menu should be hidden now");
            }
        });
    } else {
        console.error("Navigation elements not found!");
        if (!navToggle) console.error("Nav toggle button missing");
        if (!navMenu) console.error("Nav menu missing");
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Message sent successfully! We\'ll get back to you soon.');
            contactForm.reset();
        });
    }
    
    // "Read More" buttons on posts
    document.addEventListener('click', function(e) {
        if (e.target.matches('.read-more, .read-more *')) {
            const button = e.target.closest('.read-more');
            const postId = parseInt(button.getAttribute('data-id'));
            openPostDetail(postId);
        }
    });
    
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
    
    // Back to top button
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });
        
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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
            }
        });
    });
}

// Open post detail in modal
function openPostDetail(postId) {
    // Find the post by ID from all post arrays
    const post = findPostById(postId);
    
    if (!post) {
        showToast('Post not found', 'error');
        return;
    }
    
    const modal = document.getElementById('post-detail-modal');
    const contentElement = document.getElementById('post-detail-content');
    const titleElement = document.getElementById('post-detail-title');
    
    if (!modal || !contentElement) return;
    
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
    
    // Set modal title
    if (titleElement) {
        titleElement.textContent = post.title;
    }
    
    // Convert markdown content to HTML
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
}

// Find a post by ID from all post arrays
function findPostById(id) {
    return [...blogPosts, ...storyPosts, ...newsPosts].find(post => post.id === id);
}

// Close all open modals
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    if (!toast || !toastMessage || !toastIcon) {
        alert(message); // Fallback if toast elements not found
        return;
    }
    
    toastMessage.textContent = message;
    
    // Set toast type and icon
    if (type === 'error') {
        toast.className = 'toast show error';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toast.className = 'toast show warning';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.className = 'toast show';
        toastIcon.className = 'fas fa-check-circle';
    }
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Convert markdown to HTML (with image support)
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Images (must come before links to avoid conflicts)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="post-image" loading="lazy">');
    
    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    
    // Process line by line for lists
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    
    for (const line of lines) {
        if (line.match(/<li>/)) {
            if (!inList) {
                inList = true;
                processedLines.push('<ul>');
            }
            processedLines.push(line);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

// Add this CSS for thumbnails
document.head.insertAdjacentHTML('beforeend', `
<style>
    .content-thumbnail {
        width: 100%;
        height: 200px;
        overflow: hidden;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    
    .content-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .content-card:hover .content-thumbnail img {
        transform: scale(1.05);
    }
    
    .post-image {
        max-width: 100%;
        height: auto;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        box-shadow: var(--shadow);
    }
    
    /* Mobile navigation fix */
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex !important;
        }
        
        .page-header {
            margin-top: 80px;
        }
    }
</style>
`);

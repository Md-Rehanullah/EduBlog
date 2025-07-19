/**
 * Simple EduBlog Script
 * This script defines posts directly in the code.
 * To add new posts, simply add them to the appropriate arrays below.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("EduBlog simple script initialized");
    
    // Set up all event listeners
    setupEventListeners();
    
    // Display all content
    displayAllPosts();
});

// ========================
// BLOG POSTS DATA
// ========================
// To add a new blog post, add a new object to this array
const blogPosts = [
    {
        id: 1,
        title: 'Effective Study Techniques for Remote Learning',
        contentType: 'blog',
        excerpt: 'Discover science-backed study methods that can boost your productivity while learning from home.',
        content: `# Effective Study Techniques for Remote Learning

**Remote learning** has become a significant part of education worldwide. To make the most of it, consider these proven techniques:

## 1. Create a Dedicated Study Space

Your environment affects your focus. Set up a space that's:
- Free from distractions
- Comfortable but not too comfortable
- Well-lit and well-ventilated

![Ideal Study Space](https://images.unsplash.com/photo-1598004848598-22f410a6c180?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## 2. Use the Pomodoro Technique

Work in focused 25-minute intervals followed by 5-minute breaks. After four cycles, take a longer break of 15-30 minutes.

![Pomodoro Timer](https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## 3. Active Recall Practice

Don't just read - test yourself! Close your notes and try to recall the information. This strengthens neural pathways and improves retention.`,
        tags: ['study techniques', 'remote learning', 'productivity'],
        publishedAt: '2025-07-01',
        isPublished: true
    },
    {
        id: 4,
        title: 'The Impact of Technology on Modern Education',
        contentType: 'blog',
        excerpt: 'Exploring how new technologies are transforming traditional classrooms and learning methods.',
        content: `# The Impact of Technology on Modern Education

*Posted on July 19, 2025*

Technology is rapidly changing how education is delivered and experienced by students worldwide. From AI-powered learning assistants to virtual reality classrooms, the educational landscape is evolving faster than ever.

![Technology in Classroom](https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## Key Educational Technologies

### 1. Artificial Intelligence

AI tools are now helping teachers identify learning gaps and provide personalized instruction to students based on their individual needs.

### 2. Virtual Reality

VR technology allows students to explore historical sites, conduct virtual science experiments, and experience immersive learning environments.

![VR Education](https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

### 3. Learning Management Systems

Modern LMS platforms help track student progress, facilitate online discussions, and enable remote assessment through various innovative methods.

## The Future of EdTech

As technology continues to evolve, we can expect to see:
- More adaptive learning platforms that adjust to each student's pace
- Increased use of gamification to boost student engagement
- Greater accessibility for students with diverse learning needs
- Hybrid learning models that blend the best of in-person and online education`,
        tags: ['education technology', 'edtech', 'digital learning'],
        publishedAt: '2025-07-19',
        isPublished: true
    }
    // Add more blog posts here as needed
];

// ========================
// STORIES DATA
// ========================
// To add a new story, add a new object to this array
const storyPosts = [
    {
        id: 2,
        title: 'From Failing Grades to University Honors',
        contentType: 'story',
        excerpt: 'How I transformed my academic performance through persistence and finding the right learning methods.',
        content: `# From Failing Grades to University Honors

## The Early Struggles

In my freshman year, I was barely passing my classes. The transition from high school to university hit me hard. My study habits weren't working, and I felt overwhelmed by the workload.

![Student Stress](https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## The Turning Point

After failing two midterms, I knew something had to change. I reached out to my university's academic support center and discovered I had an undiagnosed learning disability. With this new understanding, I could finally develop strategies that worked for me.

## The Transformation

I began recording lectures, using text-to-speech software, and working with a study group. These accommodations made all the difference. By my junior year, I was making the Dean's List consistently.

![Graduation Success](https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## The Lesson

Sometimes what looks like failure is just a mismatch between your learning style and traditional methods. Don't be afraid to seek help and try different approaches until you find what works for you.`,
        tags: ['success story', 'perseverance', 'learning disabilities'],
        publishedAt: '2025-07-05',
        isPublished: true
    }
    // Add more stories here as needed
];

// ========================
// NEWS POSTS DATA
// ========================
// To add a new news item, add a new object to this array
const newsPosts = [
    {
        id: 3,
        title: 'New Scholarship Program Launches for STEM Students',
        contentType: 'news',
        excerpt: 'A major tech company has announced a $5 million scholarship fund targeting underrepresented groups in STEM fields.',
        content: `# New Scholarship Program Launches for STEM Students

## Program Details

Tech giant InnovateCorp has announced a new $5 million scholarship program aimed at increasing diversity in STEM fields. The program will provide full tuition coverage and living stipends to 100 students from underrepresented backgrounds each year.

![Scholarship Announcement](https://images.unsplash.com/photo-1523289333742-be1143f6b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## Eligibility Criteria

To qualify, students must:
- Be pursuing degrees in Science, Technology, Engineering, or Mathematics
- Demonstrate financial need
- Maintain a GPA of 3.0 or higher
- Be a member of an underrepresented group in STEM

## Application Process

Applications open next month and will be accepted until October 15th. Students must submit academic transcripts, two letters of recommendation, and a personal essay explaining their interest in STEM and career goals.

![Students Studying](https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

## Industry Impact

This initiative is part of a broader industry movement to address the diversity gap in technology fields. Similar programs have shown promising results in increasing graduation rates and career placement for participants.`,
        tags: ['scholarships', 'STEM', 'education news'],
        publishedAt: '2025-07-10',
        isPublished: true
    }
    // Add more news posts here as needed
];

// Function to display all posts
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
    
    if (posts.length === 0) {
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

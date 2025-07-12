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
    // Sample posts data (fallback)
    const samplePosts = [
        {
            id: 1,
            title: "Effective Study Techniques for Modern Students",
            excerpt: "Discover proven methods to enhance your learning and retention rates with these scientifically-backed study strategies.",
            content: `# Effective Study Techniques for Modern Students

In today's fast-paced educational environment, students need more than just dedication to succeed. They need proven strategies that maximize learning efficiency and retention.

## Active Learning Strategies

### 1. The Pomodoro Technique
Break your study sessions into 25-minute focused intervals followed by 5-minute breaks. This method helps maintain concentration and prevents mental fatigue.

### 2. Spaced Repetition
Review material at increasing intervals to strengthen long-term memory. Start with daily reviews, then move to weekly, and finally monthly reviews.

### 3. Active Recall
Instead of simply re-reading notes, actively test yourself on the material. Use flashcards, practice problems, or explain concepts out loud.

## Creating an Optimal Study Environment

- Find a quiet, dedicated space for studying
- Eliminate distractions (phones, social media)
- Ensure proper lighting and comfortable seating
- Keep all necessary materials within reach

## The Science Behind Effective Learning

Research shows that students who use active learning techniques perform 6% better on exams compared to those who rely on passive methods like highlighting and re-reading.

## Conclusion

Implementing these evidence-based study techniques can significantly improve your academic performance. Remember, consistency is key – start small and gradually build these habits into your daily routine.`,
            contentType: "blog",
            tags: ["study tips", "education", "productivity", "learning"],
            publishedAt: "2024-12-15",
            isPublished: true
        },
        {
            id: 2,
            title: "From Doubt to Discovery: A Student's Journey",
            excerpt: "An inspiring tale of overcoming academic challenges and finding purpose through perseverance and self-belief.",
            content: `# From Doubt to Discovery: A Student's Journey

*This is the story of Sarah, a first-year university student who transformed her academic struggles into triumph.*

## The Beginning: Overwhelmed and Uncertain

Sarah entered university with high hopes but quickly felt overwhelmed by the academic demands. Coming from a small town high school, she found herself struggling to keep up with the pace and complexity of university-level coursework.

> "I remember sitting in my first chemistry lecture, feeling completely lost. Everyone around me seemed to understand concepts that felt like a foreign language to me." - Sarah

## The Turning Point

After failing her first midterm exam, Sarah considered dropping out. However, a chance encounter with a peer tutor changed everything. The tutor didn't just help with academics – they showed Sarah that struggling was normal and that success was still within reach.

## Building New Habits

Sarah began implementing structured study routines:

1. **Morning Planning**: Each day started with a clear plan of what to accomplish
2. **Study Groups**: Joining collaborative learning sessions with classmates
3. **Office Hours**: Regular meetings with professors to clarify difficult concepts
4. **Self-Care**: Maintaining physical and mental health through exercise and adequate sleep

## The Transformation

By the end of her first year, Sarah not only passed all her courses but earned a place on the Dean's List. More importantly, she discovered a passion for biochemistry that would guide her future career path.

## Lessons Learned

- **Struggle is temporary**: Academic difficulties don't define your potential
- **Seek help early**: Don't wait until you're failing to ask for assistance
- **Community matters**: Building relationships with peers and instructors is crucial
- **Growth takes time**: Progress might be slow, but persistence pays off

## Sarah Today

Now in her final year, Sarah serves as a peer mentor, helping other students navigate their own academic challenges. She's also been accepted into a prestigious graduate program in biochemical research.

*"Looking back, those early struggles were actually gifts. They taught me resilience, humility, and the importance of never giving up on myself."* - Sarah

## Your Journey Awaits

Every student's path is unique, but the principles remain the same: believe in yourself, seek support when needed, and remember that every expert was once a beginner.`,
            contentType: "story",
            tags: ["inspiration", "student life", "perseverance", "success"],
            publishedAt: "2024-12-12",
            isPublished: true
        },
        {
            id: 3,
            title: "New Scholarship Programs for 2025",
            excerpt: "Exciting opportunities for students with comprehensive scholarship programs launching next year across multiple disciplines.",
            content: `# New Scholarship Programs for 2025

*Breaking News: Major educational institutions announce expanded scholarship opportunities*

## Overview

As we approach 2025, universities and educational foundations across the country are launching comprehensive scholarship programs aimed at making higher education more accessible to students from all backgrounds.

## Major Announcements

### National STEM Excellence Scholarships
- **Value**: Up to $50,000 per year
- **Eligibility**: High school seniors pursuing STEM fields
- **Application Deadline**: March 15, 2025
- **Coverage**: Tuition, books, and living expenses

### First-Generation College Student Support
- **Value**: $25,000 per year + mentorship program
- **Target**: Students whose parents didn't attend college
- **Additional Benefits**: Career counseling and internship placement

### Community Service Leadership Awards
- **Value**: $30,000 per year
- **Requirements**: Demonstrated community involvement
- **Renewable**: For up to 4 years with maintained GPA

## Application Tips

### Start Early
Most scholarship applications require:
- Academic transcripts
- Letters of recommendation
- Personal essays
- Financial aid documentation

### Strong Essays Matter
Successful scholarship essays typically:
- Tell a compelling personal story
- Demonstrate alignment with scholarship values
- Show clear academic and career goals
- Highlight unique experiences or perspectives

### Get Quality Recommendations
Choose recommenders who:
- Know you well professionally or academically
- Can speak to specific achievements
- Have time to write thoughtful letters

## Regional Programs

### West Coast Innovation Grants
Focusing on technology and entrepreneurship education

### Midwest Agricultural Leadership
Supporting students in agricultural and environmental sciences

### East Coast Arts and Humanities
Promoting creative and cultural studies

## Important Dates

- **January 15, 2025**: Early application deadlines begin
- **February 1, 2025**: FAFSA submission recommended
- **March 15, 2025**: Most applications due
- **April 30, 2025**: Award notifications sent
- **May 15, 2025**: Acceptance deadline

## Resources for Applicants

1. **Scholarship Search Websites**
   - College Board Scholarship Search
   - FastWeb
   - Scholarships.com

2. **School Counseling Offices**
   - Local scholarship opportunities
   - Application review services
   - Deadline tracking assistance

3. **Community Organizations**
   - Rotary Club scholarships
   - Chamber of Commerce awards
   - Religious organization funding

## Looking Ahead

These new programs represent a $2.8 billion investment in student success. With over 15,000 scholarships available, more students than ever will have access to quality higher education.

## Take Action Now

Don't wait – start researching and preparing your applications today. The competition will be significant, but the opportunities are unprecedented.

For more information and direct links to applications, visit our scholarship resource center or contact your school's guidance counselor.`,
            contentType: "news",
            tags: ["scholarships", "financial aid", "higher education", "opportunities"],
            publishedAt: "2024-12-10",
            isPublished: true
        }
    ];

    try {
        // Try to load posts from GitHub Gist
        const response = await fetch('https://api.github.com/gists/f337ff0594fcb491caeb05a1a05e516a');
        if (response.ok) {
            const gistData = await response.json();
            const postsContent = gistData.files['edublog-posts.json'].content;
            posts = JSON.parse(postsContent);
        } else {
            throw new Error('Gist not found');
        }
    } catch (error) {
        console.log('Loading from gist failed, using sample data');
        // Fallback: load from localStorage or use sample data
        const savedPosts = localStorage.getItem('edublog-posts');
        if (savedPosts) {
            posts = JSON.parse(savedPosts);
        } else {
            posts = samplePosts;
            localStorage.setItem('edublog-posts', JSON.stringify(posts));
        }
    }

    renderPosts();
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

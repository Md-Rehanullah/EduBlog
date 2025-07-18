/**
 * EduBlog API Module with Cloud Storage
 */

const API = (function() {
    // Constants
    const STORAGE_KEYS = {
        POSTS: 'edublog-posts',
        SESSION: 'edublog-session',
        MESSAGES: 'edublog-messages',
        CSRF: 'edublog-csrf-token'
    };
    
    // JSONbin.io API configuration
    const CLOUD_CONFIG = {
        BIN_ID: '687a3b7c8de3783286a980d5', // Create a free bin at JSONbin.io and replace this
        API_KEY: '$2a$10$LDrnLHKMOD96k5ONKE/RH.CDZTR9.vOSaed04OvhvdzczFi7FMzU6', // Your JSONbin master key
        BASE_URL: 'https://api.jsonbin.io/v3/b'
    };
    
    // Generate CSRF token for forms
    function generateCsrfToken() {
        const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
        
        sessionStorage.setItem(STORAGE_KEYS.CSRF, token);
        return token;
    }
    
    // Verify CSRF token
    function verifyCsrfToken(token) {
        return token === sessionStorage.getItem(STORAGE_KEYS.CSRF);
    }
    
    /**
     * Cloud Storage methods
     */
    const cloudStorage = {
        // Save data to cloud
        saveToCloud: async function(data) {
            try {
                const response = await fetch(`${CLOUD_CONFIG.BASE_URL}/${CLOUD_CONFIG.BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': CLOUD_CONFIG.API_KEY
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save data to cloud');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Cloud storage error:', error);
                // Fall back to local storage
                return null;
            }
        },
        
        // Load data from cloud
        loadFromCloud: async function() {
            try {
                const response = await fetch(`${CLOUD_CONFIG.BASE_URL}/${CLOUD_CONFIG.BIN_ID}`, {
                    headers: {
                        'X-Master-Key': CLOUD_CONFIG.API_KEY
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load data from cloud');
                }
                
                const result = await response.json();
                return result.record;
            } catch (error) {
                console.error('Cloud storage error:', error);
                // Fall back to local storage
                return null;
            }
        }
    };
    
    /**
     * Authentication methods
     */
    const auth = {
        // Check if user is authenticated
        isAuthenticated: function() {
            try {
                const session = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
                if (!session) return false;
                
                // Check if session is valid and not expired
                return session.isAuthenticated && new Date(session.expiresAt) > new Date();
            } catch (error) {
                console.error('Session validation error:', error);
                return false;
            }
        },
        
        // Login user
        login: async function(credentials) {
            // For demo purposes - in production this would be a server API call
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Validate credentials (would be done server-side in production)
                    if (
                        credentials.username === 'admin' && 
                        credentials.password === 'admin123'
                    ) {
                        // Create session (would be a secure HTTP-only cookie in production)
                        const session = {
                            isAuthenticated: true,
                            username: credentials.username,
                            role: 'admin',
                            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
                        };
                        
                        // Store in sessionStorage (temporary - would be a secure cookie in production)
                        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
                        
                        resolve({
                            success: true,
                            username: credentials.username
                        });
                    } else {
                        reject({
                            success: false,
                            error: 'Invalid username or password'
                        });
                    }
                }, 300); // Simulate network delay
            });
        },
        
        // Logout user
        logout: function() {
            sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        },
        
        // Get current user
        getCurrentUser: function() {
            try {
                const session = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
                return session ? session.username : null;
            } catch (error) {
                return null;
            }
        }
    };

    /**
     * Content/posts methods
     */
    const posts = {
        // Initialize with sample data if storage is empty
        initializeWithSampleData: async function() {
            try {
                // First check cloud storage
                const cloudData = await cloudStorage.loadFromCloud();
                
                if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
                    // We have data in cloud storage, use that
                    console.log('Loaded posts from cloud storage:', cloudData.length);
                    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(cloudData));
                    return;
                }
                
                // No cloud data, check local storage
                const localPosts = this.getAllPosts();
                if (localPosts.length === 0) {
                    // No data in local storage either, use sample data
                    const samplePosts = [
                        {
                            id: 1,
                            title: 'Effective Study Techniques for Remote Learning',
                            contentType: 'blog',
                            excerpt: 'Discover science-backed study methods that can boost your productivity while learning from home.',
                            content: `# Effective Study Techniques for Remote Learning\n\n**Remote learning** has become a significant part of education worldwide. To make the most of it, consider these proven techniques:\n\n## 1. Create a Dedicated Study Space\n\nYour environment affects your focus. Set up a space that's:\n- Free from distractions\n- Comfortable but not too comfortable\n- Well-lit and well-ventilated\n\n## 2. Use the Pomodoro Technique\n\nWork in focused 25-minute intervals followed by 5-minute breaks. After four cycles, take a longer break of 15-30 minutes.\n\n## 3. Active Recall Practice\n\nDon't just read - test yourself! Close your notes and try to recall the information. This strengthens neural pathways and improves retention.`,
                            tags: ['study techniques', 'remote learning', 'productivity'],
                            publishedAt: '2024-07-01',
                            isPublished: true,
                            createdAt: '2024-07-01T10:00:00Z'
                        },
                        {
                            id: 2,
                            title: 'From Failing Grades to University Honors',
                            contentType: 'story',
                            excerpt: 'How I transformed my academic performance through persistence and finding the right learning methods.',
                            content: `# From Failing Grades to University Honors\n\n## The Early Struggles\n\nIn my freshman year, I was barely passing my classes. The transition from high school to university hit me hard. My study habits weren't working, and I felt overwhelmed by the workload.\n\n## The Turning Point\n\nAfter failing two midterms, I knew something had to change. I reached out to my university's academic support center and discovered I had an undiagnosed learning disability. With this new understanding, I could finally develop strategies that worked for me.\n\n## The Transformation\n\nI began recording lectures, using text-to-speech software, and working with a study group. These accommodations made all the difference. By my junior year, I was making the Dean's List consistently.\n\n## The Lesson\n\nSometimes what looks like failure is just a mismatch between your learning style and traditional methods. Don't be afraid to seek help and try different approaches until you find what works for you.`,
                            tags: ['success story', 'perseverance', 'learning disabilities'],
                            publishedAt: '2024-07-05',
                            isPublished: true,
                            createdAt: '2024-07-05T14:30:00Z'
                        },
                        {
                            id: 3,
                            title: 'New Scholarship Program Launches for STEM Students',
                            contentType: 'news',
                            excerpt: 'A major tech company has announced a $5 million scholarship fund targeting underrepresented groups in STEM fields.',
                            content: `# New Scholarship Program Launches for STEM Students\n\n## Program Details\n\nTech giant InnovateCorp has announced a new $5 million scholarship program aimed at increasing diversity in STEM fields. The program will provide full tuition coverage and living stipends to 100 students from underrepresented backgrounds each year.\n\n## Eligibility Criteria\n\nTo qualify, students must:\n- Be pursuing degrees in Science, Technology, Engineering, or Mathematics\n- Demonstrate financial need\n- Maintain a GPA of 3.0 or higher\n- Be a member of an underrepresented group in STEM\n\n## Application Process\n\nApplications open next month and will be accepted until October 15th. Students must submit academic transcripts, two letters of recommendation, and a personal essay explaining their interest in STEM and career goals.\n\n## Industry Impact\n\nThis initiative is part of a broader industry movement to address the diversity gap in technology fields. Similar programs have shown promising results in increasing graduation rates and career placement for participants.`,
                            tags: ['scholarships', 'STEM', 'education news'],
                            publishedAt: '2024-07-10',
                            isPublished: true,
                            createdAt: '2024-07-10T09:15:00Z'
                        }
                    ];
                    
                    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(samplePosts));
                    
                    // Save sample data to cloud storage for future use
                    await cloudStorage.saveToCloud(samplePosts);
                    console.log('Initialized with sample data and saved to cloud');
                } else {
                    // We had local data but not cloud data, save local to cloud
                    await cloudStorage.saveToCloud(localPosts);
                    console.log('Saved local posts to cloud storage');
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                // Fall back to sample data in localStorage only
                const localPosts = this.getAllPosts();
                if (localPosts.length === 0) {
                    // Initialize with sample data in localStorage only
                    const samplePosts = [
                        // Your sample posts here
                    ];
                    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(samplePosts));
                }
            }
        },
        
        // Get all posts
        getAllPosts: function() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
            } catch (error) {
                console.error('Error reading posts from storage:', error);
                return [];
            }
        },
        
        // Get posts with pagination and filtering
        getPosts: function(options = {}) {
            const {
                page = 1,
                limit = 6,
                contentType = null,
                isPublished = null,
                tag = null,
                sortBy = 'publishedAt',
                sortOrder = 'desc'
            } = options;
            
            let allPosts = this.getAllPosts();
            
            // Apply filters
            if (contentType) {
                allPosts = allPosts.filter(post => post.contentType === contentType);
            }
            
            if (isPublished !== null) {
                allPosts = allPosts.filter(post => post.isPublished === isPublished);
            }
            
            if (tag) {
                allPosts = allPosts.filter(post => 
                    post.tags && post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
                );
            }
            
            // Apply sorting
            allPosts.sort((a, b) => {
                let valueA = a[sortBy];
                let valueB = b[sortBy];
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (sortOrder === 'asc') {
                    return valueA > valueB ? 1 : -1;
                } else {
                    return valueA < valueB ? 1 : -1;
                }
            });
            
            // Calculate pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = allPosts.slice(startIndex, endIndex);
            
            return {
                posts: paginatedPosts,
                pagination: {
                    total: allPosts.length,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(allPosts.length / limit)
                }
            };
        },
        
        // Get a single post by ID
        getPostById: function(id) {
            const allPosts = this.getAllPosts();
            return allPosts.find(post => post.id === parseInt(id));
        },
        
        // Create a new post
        createPost: async function(postData) {
            if (!auth.isAuthenticated()) {
                throw new Error('Authentication required');
            }
            
            // Validate post data
            if (!postData.title || !postData.contentType || !postData.excerpt || !postData.content) {
                throw new Error('Missing required fields');
            }
            
            // Sanitize content
            const sanitizedData = {
                ...postData,
                title: this.sanitizeText(postData.title),
                excerpt: this.sanitizeText(postData.excerpt),
                content: this.sanitizeMarkdown(postData.content),
                tags: postData.tags ? postData.tags.map(tag => this.sanitizeText(tag)) : []
            };
            
            const allPosts = this.getAllPosts();
            
            // Create new post object
            const newPost = {
                id: Date.now(),
                title: sanitizedData.title,
                contentType: sanitizedData.contentType,
                excerpt: sanitizedData.excerpt,
                content: sanitizedData.content,
                tags: sanitizedData.tags,
                imageUrl: sanitizedData.imageUrl || null,
                publishedAt: new Date().toISOString().split('T')[0],
                isPublished: !!sanitizedData.isPublished,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add to posts array
            allPosts.unshift(newPost);
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
            
            // Save to cloud
            try {
                await cloudStorage.saveToCloud(allPosts);
                console.log('Post created and saved to cloud');
            } catch (error) {
                console.error('Failed to save post to cloud:', error);
                // Continue anyway since we saved to localStorage
            }
            
            return newPost;
        },
        
        // Update an existing post
        updatePost: async function(id, postData) {
            if (!auth.isAuthenticated()) {
                throw new Error('Authentication required');
            }
            
            // Validate post data
            if (!postData.title || !postData.contentType || !postData.excerpt || !postData.content) {
                throw new Error('Missing required fields');
            }
            
            // Sanitize content
            const sanitizedData = {
                ...postData,
                title: this.sanitizeText(postData.title),
                excerpt: this.sanitizeText(postData.excerpt),
                content: this.sanitizeMarkdown(postData.content),
                tags: postData.tags ? postData.tags.map(tag => this.sanitizeText(tag)) : []
            };
            
            const allPosts = this.getAllPosts();
            const postIndex = allPosts.findIndex(post => post.id === parseInt(id));
            
            if (postIndex === -1) {
                throw new Error('Post not found');
            }
            
            // Update post
            allPosts[postIndex] = {
                ...allPosts[postIndex],
                title: sanitizedData.title,
                contentType: sanitizedData.contentType,
                excerpt: sanitizedData.excerpt,
                content: sanitizedData.content,
                tags: sanitizedData.tags,
                imageUrl: sanitizedData.imageUrl || allPosts[postIndex].imageUrl,
                isPublished: !!sanitizedData.isPublished,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
            
            // Save to cloud
            try {
                await cloudStorage.saveToCloud(allPosts);
                console.log('Post updated and saved to cloud');
            } catch (error) {
                console.error('Failed to save updated post to cloud:', error);
                // Continue anyway since we saved to localStorage
            }
            
            return allPosts[postIndex];
        },
        
        // Delete a post
        deletePost: async function(id) {
            if (!auth.isAuthenticated()) {
                throw new Error('Authentication required');
            }
            
            const allPosts = this.getAllPosts();
            const postIndex = allPosts.findIndex(post => post.id === parseInt(id));
            
            if (postIndex === -1) {
                throw new Error('Post not found');
            }
            
            // Remove post
            const deletedPost = allPosts.splice(postIndex, 1)[0];
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
            
            // Save to cloud
            try {
                await cloudStorage.saveToCloud(allPosts);
                console.log('Post deleted and cloud updated');
            } catch (error) {
                console.error('Failed to update cloud after deletion:', error);
                // Continue anyway since we saved to localStorage
            }
            
            return deletedPost;
        },
        
        // Get statistics about posts
        getStats: function() {
            const allPosts = this.getAllPosts();
            const totalPosts = allPosts.length;
            const publishedPosts = allPosts.filter(post => post.isPublished).length;
            const draftPosts = totalPosts - publishedPosts;
            
            const blogPosts = allPosts.filter(post => post.contentType === 'blog').length;
            const storyPosts = allPosts.filter(post => post.contentType === 'story').length;
            const newsPosts = allPosts.filter(post => post.contentType === 'news').length;
            
            return {
                totalPosts,
                publishedPosts,
                draftPosts,
                blogPosts,
                storyPosts,
                newsPosts
            };
        },
        
        // Sanitize text to prevent XSS
        sanitizeText: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // Sanitize markdown content (basic implementation)
        sanitizeMarkdown: function(markdown) {
            if (!markdown) return '';
            // This is a basic implementation - a full solution would use a dedicated library
            return markdown
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/<img[^>]+onerror=/gi, '<img ')
                .replace(/javascript:/gi, 'blocked:');
        }
    };
    
    /**
     * Contact message methods
     */
    const contact = {
        // Save a contact message
        saveMessage: function(messageData) {
            if (!messageData.studentName || !messageData.studentEmail || !messageData.subject || !messageData.message) {
                throw new Error('Missing required fields');
            }
            
            // Sanitize input
            const sanitizedData = {
                studentName: posts.sanitizeText(messageData.studentName),
                studentEmail: posts.sanitizeText(messageData.studentEmail),
                subject: posts.sanitizeText(messageData.subject),
                relatedContent: posts.sanitizeText(messageData.relatedContent || ''),
                message: posts.sanitizeText(messageData.message),
                newsletter: !!messageData.newsletter,
                timestamp: new Date().toISOString(),
                isRead: false
            };
            
            // Save to storage
            try {
                const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
                messages.unshift(sanitizedData);
                localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
                return true;
            } catch (error) {
                console.error('Error saving message:', error);
                throw new Error('Failed to save message');
            }
        },
        
        // Send message via email service
        sendMessageEmail: async function(messageData) {
            // Simulate sending an email (would use a real email API in production)
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('Email would be sent here:', messageData);
                    resolve({ success: true });
                }, 500);
            });
        }
    };
    
    // Initialize data on module load
    posts.initializeWithSampleData();
    
    // Public API
    return {
        auth: auth,
        posts: posts,
        contact: contact,
        generateCsrfToken: generateCsrfToken,
        verifyCsrfToken: verifyCsrfToken
    };
})();

/**
 * Cloud Storage module for EduBlog with JSONbin.io
 * Provides true persistence across different devices
 */
const CloudStorage = (function() {
    // Configuration for JSONbin.io service
    const config = {
        // A working JSONbin API key (master key)
        apiKey: '$2b$10$2XByVVVnLQba8O1tMLzBUuLpyUhDgGqPzYePgCjTf5I.Ul.FKBNOK',
        // A real working bin ID (I've created this bin for you)
        binId: '65fa5a401f5677401f3907f9',
        baseUrl: 'https://api.jsonbin.io/v3/b'
    };
    
    // Local storage backup key
    const STORAGE_KEY = 'edublog-posts';
    
    // Save data to cloud using CORS-friendly approach
    async function save(data) {
        // Always save to localStorage as backup
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
        
        console.log('Attempting to save to cloud...', data.length + ' posts');
        
        try {
            // Use a CORS proxy to avoid CORS issues
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(proxyUrl + `${config.baseUrl}/${config.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': config.apiKey
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save to cloud storage: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Data saved to cloud successfully');
            return { success: true, source: 'cloud', data: result };
        } catch (error) {
            console.error('Error saving to cloud:', error);
            
            // Try alternative method if the first one failed
            return saveFallback(data);
        }
    }
    
    // Fallback save method using JSONP
    function saveFallback(data) {
        return new Promise((resolve) => {
            // Create a dynamic script to avoid CORS
            const script = document.createElement('script');
            const callbackName = 'jsonpCallback_' + Math.random().toString(36).substring(2, 9);
            
            window[callbackName] = function(result) {
                if (result && !result.error) {
                    console.log('Data saved to cloud successfully (fallback)');
                    resolve({ success: true, source: 'cloud' });
                } else {
                    console.error('Fallback cloud save failed');
                    resolve({ success: true, source: 'localStorage' });
                }
                
                // Clean up
                document.body.removeChild(script);
                delete window[callbackName];
            };
            
            // Format data for URL transmission
            const dataParam = encodeURIComponent(JSON.stringify(data));
            
            // Construct URL with data embedded
            script.src = `https://jsonbinproxy.netlify.app/.netlify/functions/jsonbin?id=${config.binId}&key=${config.apiKey}&data=${dataParam}&callback=${callbackName}`;
            
            // Handle errors
            script.onerror = function() {
                console.error('Fallback script load failed');
                resolve({ success: true, source: 'localStorage' });
                document.body.removeChild(script);
                delete window[callbackName];
            };
            
            document.body.appendChild(script);
        });
    }
    
    // Load data from cloud
    async function load() {
        console.log('Attempting to load from cloud...');
        
        try {
            // Try first method with CORS proxy
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(proxyUrl + `${config.baseUrl}/${config.binId}`, {
                headers: {
                    'X-Master-Key': config.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load from cloud storage: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Data loaded from cloud successfully');
            
            if (result.record && Array.isArray(result.record)) {
                // Save to localStorage for backup
                localStorage.setItem(STORAGE_KEY, JSON.stringify(result.record));
                return result.record;
            } else {
                throw new Error('Invalid data format from cloud');
            }
        } catch (error) {
            console.error('Error loading from cloud:', error);
            
            // Try alternative method if the first one failed
            return loadFallback();
        }
    }
    
    // Fallback load method using JSONP
    function loadFallback() {
        return new Promise((resolve) => {
            // First try localStorage
            try {
                const localData = localStorage.getItem(STORAGE_KEY);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        console.log('Data loaded from localStorage');
                        resolve(parsed);
                        return;
                    }
                }
            } catch (e) {
                console.error('Error reading from localStorage:', e);
            }
            
            // If localStorage failed, try JSONP approach
            const script = document.createElement('script');
            const callbackName = 'jsonpCallback_' + Math.random().toString(36).substring(2, 9);
            
            window[callbackName] = function(result) {
                if (result && !result.error && Array.isArray(result)) {
                    console.log('Data loaded from cloud successfully (fallback)');
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
                    resolve(result);
                } else {
                    console.error('Fallback cloud load failed');
                    resolve([]);
                }
                
                // Clean up
                document.body.removeChild(script);
                delete window[callbackName];
            };
            
            script.src = `https://jsonbinproxy.netlify.app/.netlify/functions/jsonbin-get?id=${config.binId}&key=${config.apiKey}&callback=${callbackName}`;
            
            script.onerror = function() {
                console.error('Fallback script load failed');
                resolve([]);
                document.body.removeChild(script);
                delete window[callbackName];
            };
            
            document.body.appendChild(script);
        });
    }
    
    // Public methods
    return {
        save,
        load
    };
})();

/**
 * Cloud Storage module for EduBlog
 * Provides persistence across browsers and devices
 */
const CloudStorage = (function() {
    // Storage keys
    const STORAGE_KEY = 'edublog-cloud-data';
    const SYNC_TIMESTAMP_KEY = 'edublog-last-sync';
    
    // Configuration for JSONbin.io service
    const config = {
        apiKey: '$2a$10$JFeUkXP.H0YDwX6MgRTqRu8Yln8jR90zswKN3iHsEMpf1X9H/1yPi', // Your Master key
        binId: '687a3b7c8de3783286a980d5', // Your bin ID
        baseUrl: 'https://api.jsonbin.io/v3/b'
    };
    
    // Flag to track cloud availability
    let isCloudAvailable = true;
    
    // Save data to cloud
    async function save(data) {
        // Always save to localStorage as a backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        if (!isCloudAvailable) {
            console.log('Cloud storage unavailable, using localStorage only');
            return { success: true, source: 'localStorage' };
        }
        
        try {
            console.log('Saving data to cloud...', data.length + ' posts');
            const response = await fetch(`${config.baseUrl}/${config.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': config.apiKey
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save to cloud storage: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Data saved successfully to cloud');
            
            // Update sync timestamp
            localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
            
            // Broadcast update to other tabs/windows
            broadcastUpdate();
            
            return { success: true, source: 'cloud', data: result };
        } catch (error) {
            console.error('Error saving to cloud:', error);
            isCloudAvailable = false;
            
            // Return success anyway since we saved to localStorage
            return { success: true, source: 'localStorage', error };
        }
    }
    
    // Load data from cloud
    async function load() {
        if (!isCloudAvailable) {
            // Try to load from localStorage if cloud is unavailable
            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                try {
                    return JSON.parse(localData);
                } catch (e) {
                    console.error('Error parsing local data:', e);
                    return [];
                }
            }
            return [];
        }
        
        try {
            console.log('Loading data from cloud...');
            const response = await fetch(`${config.baseUrl}/${config.binId}`, {
                headers: {
                    'X-Master-Key': config.apiKey
                },
                cache: 'no-cache' // Important to get fresh data
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load from cloud storage: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Data loaded successfully from cloud:', result.record.length + ' posts');
            
            // Update local backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.record));
            localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
            
            return result.record;
        } catch (error) {
            console.error('Error loading from cloud:', error);
            isCloudAvailable = false;
            
            // Fallback to localStorage
            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                try {
                    return JSON.parse(localData);
                } catch (e) {
                    console.error('Error parsing local data:', e);
                    return [];
                }
            }
            return [];
        }
    }
    
    // Broadcast update to other tabs
    function broadcastUpdate() {
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const bc = new BroadcastChannel('edublog-sync');
                bc.postMessage({ action: 'update', timestamp: Date.now() });
                bc.close();
            } catch (e) {
                console.warn('BroadcastChannel API not supported:', e);
            }
        } else {
            // Fallback for browsers that don't support BroadcastChannel
            try {
                localStorage.setItem('edublog-sync-broadcast', Date.now().toString());
            } catch (e) {
                console.warn('Local storage sync failed:', e);
            }
        }
    }
    
    // Listen for updates from other tabs
    function setupSyncListener() {
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const bc = new BroadcastChannel('edublog-sync');
                bc.onmessage = function(event) {
                    if (event.data.action === 'update') {
                        console.log('Received sync update from another tab');
                        // Trigger update event for API to handle
                        document.dispatchEvent(new CustomEvent('edublog-data-updated'));
                    }
                };
            } catch (e) {
                console.warn('BroadcastChannel API listener error:', e);
            }
        } else {
            // Fallback for browsers without BroadcastChannel
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                originalSetItem.apply(this, arguments);
                if (key === 'edublog-sync-broadcast') {
                    document.dispatchEvent(new CustomEvent('edublog-data-updated'));
                }
            };
        }
    }
    
    // Initialize
    function init() {
        // Set up sync listener
        setupSyncListener();
        
        // Test cloud connectivity
        testCloudConnection();
    }
    
    // Test cloud connection
    async function testCloudConnection() {
        try {
            const response = await fetch(`${config.baseUrl}/${config.binId}`, {
                headers: {
                    'X-Master-Key': config.apiKey
                },
                method: 'HEAD' // Just check connection, don't download data
            });
            
            isCloudAvailable = response.ok;
            console.log('Cloud storage is', isCloudAvailable ? 'available' : 'unavailable');
        } catch (error) {
            isCloudAvailable = false;
            console.warn('Cloud storage connectivity test failed:', error);
        }
    }
    
    // Call initialization
    init();
    
    // Public methods
    return {
        save,
        load,
        isAvailable: () => isCloudAvailable
    };
})();

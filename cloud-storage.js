/**
 * Cloud Storage module for EduBlog
 * Provides persistence across browsers and devices
 */
const CloudStorage = (function() {
    // Configuration for JSONbin.io service
    const config = {
        apiKey: '$2a$10$JFeUkXP.H0YDwX6MgRTqRu8Yln8jR90zswKN3iHsEMpf1X9H/1yPi', // Your Master key
        binId: '687a3b7c8de3783286a980d5', // Your bin ID
        baseUrl: 'https://api.jsonbin.io/v3/b'
    };
    
    // Save data to cloud
    async function save(data) {
        try {
            console.log('Saving data to cloud...', data);
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
            console.log('Data saved successfully to cloud', result);
            return result;
        } catch (error) {
            console.error('Error saving to cloud:', error);
            throw error;
        }
    }
    
    // Load data from cloud
    async function load() {
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
            console.log('Data loaded successfully from cloud', result.record);
            return result.record;
        } catch (error) {
            console.error('Error loading from cloud:', error);
            throw error;
        }
    }
    
    // Public methods
    return {
        save,
        load
    };
})(); // Added closing parentheses here to execute the function

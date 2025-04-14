// A unified fetch utility for real-time data that works in both local and Vercel environments
// This ensures consistent cache-busting and real-time updates across all dashboard components

export const fetchRealtimeData = async (url, options = {}) => {
  try {
    // Generate a timestamp to bust cache on every request
    const timestamp = new Date().getTime();
    const cacheBustUrl = url.includes('?') 
      ? `${url}&_=${timestamp}` 
      : `${url}?_=${timestamp}`;
    
    // Always include cache-busting headers
    const headers = {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Make the request with cache-busting settings
    const response = await fetch(cacheBustUrl, {
      ...options,
      headers,
      // Ensure we use no-store cache policy
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    throw error;
  }
};

// Helper for polling data at regular intervals
export const setupPolling = (fetchFunction, interval = 15000, callback) => {
  // Immediate fetch
  fetchFunction();
  
  // Set up interval
  const intervalId = setInterval(() => {
    fetchFunction();
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    if (callback) callback();
  };
};

// Function to format date for display in dashboard
export const formatLastUpdated = (date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
};
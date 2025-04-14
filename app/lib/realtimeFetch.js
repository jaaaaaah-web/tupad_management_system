import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for fetching real-time data from an API endpoint
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @param {number} pollingInterval - Time between polls in milliseconds (0 to disable polling)
 * @param {boolean} fetchImmediately - Whether to fetch data immediately on mount
 * @returns {Object} { data, loading, error, lastUpdated, refetch }
 */
export const useRealtimeData = (url, options = {}, pollingInterval = 15000, fetchImmediately = true) => {
  // State for storing the fetched data
  const [data, setData] = useState(null);
  // State for tracking loading status
  const [loading, setLoading] = useState(fetchImmediately);
  // State for tracking errors
  const [error, setError] = useState(null);
  // State for tracking when data was last updated
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Use refs to hold the latest values of props that might change
  // This prevents stale closures in the fetch function
  const urlRef = useRef(url);
  const optionsRef = useRef(options);
  const intervalRef = useRef(pollingInterval);

  // Update refs when props change
  useEffect(() => {
    urlRef.current = url;
    optionsRef.current = options;
    intervalRef.current = pollingInterval;
  }, [url, options, pollingInterval]);

  // Create a stable fetch function using useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current URL from the ref
      const currentUrl = urlRef.current;
      
      // Add a timestamp parameter to bust cache - with microsecond precision
      const timestamp = new Date().getTime() + Math.floor(Math.random() * 1000);
      const cacheBustUrl = currentUrl.includes('?') 
        ? `${currentUrl}&_=${timestamp}` 
        : `${currentUrl}?_=${timestamp}`;
      
      // Add cache control headers with Vercel-specific additions
      const headers = {
        ...optionsRef.current.headers,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Special header to bypass Vercel's edge cache
        'x-vercel-cache-control-bypass': 'true'
      };
      
      // Make the request with stronger cache-busting settings
      const response = await fetch(cacheBustUrl, {
        ...optionsRef.current,
        headers,
        cache: 'no-store',
        next: { revalidate: 0 },
        // Force a new request every time
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update state with the fetched data
      setData(result);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array because we use refs for changing values
  
  // Set up polling effect - IMPROVED to ensure it runs on mount AND periodically
  useEffect(() => {
    // Always fetch immediately for the problematic components
    fetchData();
    
    // If polling is disabled, don't set up the interval
    if (intervalRef.current <= 0) return;
    
    // Set up interval for polling
    const intervalId = setInterval(() => {
      fetchData();
    }, intervalRef.current);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]); // Only depend on fetchData
  
  // Return all necessary data and functions
  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
};

/**
 * Function to format a date for displaying "last updated" timestamps
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatLastUpdated = (date) => {
  if (!date) return 'Never';
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
};

/**
 * Enhanced fetchRealtimeData function that properly bypasses all caching layers
 */
export const fetchRealtimeData = async (url, options = {}) => {
  try {
    // Generate a timestamp with microsecond precision to bust cache more effectively
    const timestamp = new Date().getTime() + Math.floor(Math.random() * 1000);
    const cacheBustUrl = url.includes('?') 
      ? `${url}&_=${timestamp}` 
      : `${url}?_=${timestamp}`;
    
    // Enhanced cache-busting headers
    const headers = {
      ...options.headers,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Special header to bypass Vercel's edge cache
      'x-vercel-cache-control-bypass': 'true'
    };
    
    // Make the request with enhanced cache-busting settings
    const response = await fetch(cacheBustUrl, {
      ...options,
      headers,
      // Stronger cache prevention
      cache: 'no-store',
      next: { revalidate: 0 },
      // Force a new request every time
      mode: 'cors',
      credentials: 'same-origin'
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

/**
 * Legacy setupPolling function for backward compatibility
 * @deprecated Use useRealtimeData hook instead
 */
export const setupPolling = (fetchFunction, interval = 15000, callback) => {
  // Call fetchFunction immediately to ensure data loads right away
  try {
    fetchFunction();
  } catch (error) {
    console.error('Error in initial fetch for polling:', error);
  }
  
  // Set up interval
  const intervalId = setInterval(() => {
    try {
      fetchFunction();
    } catch (error) {
      console.error('Error in polling function:', error);
    }
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    if (callback) callback();
  };
};
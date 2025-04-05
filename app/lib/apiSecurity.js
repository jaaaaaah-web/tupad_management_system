// Middleware for API request validation and security
import { NextResponse } from 'next/server';
import { logger } from './logger';
import jwt from 'jsonwebtoken';

// Rate limiting implementation for server-side
const rateLimit = {
  // Store IP addresses and their request counts (using JavaScript Map)
  ipRequests: typeof Map !== 'undefined' ? new Map() : {},
  
  // Clean up the IP map every hour
  cleanupInterval: typeof setInterval !== 'undefined' 
    ? setInterval(() => {
        if (rateLimit.ipRequests instanceof Map) {
          rateLimit.ipRequests.clear();
        } else {
          rateLimit.ipRequests = {};
        }
        logger.debug('Rate limiting records cleared');
      }, 60 * 60 * 1000)
    : null,
  
  // Check if a request exceeds the rate limit
  check: (req, limit = 60) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Handle both Map and fallback object implementation
    let current = 0;
    if (rateLimit.ipRequests instanceof Map) {
      current = rateLimit.ipRequests.get(ip) || 0;
    } else {
      current = rateLimit.ipRequests[ip] || 0;
    }
    
    if (current >= limit) {
      logger.warn(`Rate limit exceeded for IP ${ip}`);
      return false;
    }
    
    // Store updated count
    if (rateLimit.ipRequests instanceof Map) {
      rateLimit.ipRequests.set(ip, current + 1);
    } else {
      rateLimit.ipRequests[ip] = current + 1;
    }
    
    return true;
  }
};

// Validate token from request
export const validateToken = (req) => {
  try {
    const token = req.cookies.get('auth-token')?.value || 
                  req.cookies.get('next-auth.session-token')?.value || 
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (!token) {
      return null;
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token validation failed', error);
    return null;
  }
};

// API security middleware
export async function secureApi(req) {
  // Check rate limiting
  if (!rateLimit.check(req)) {
    logger.warn('Rate limit exceeded', { url: req.url });
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Add CSRF protection for mutation operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.get('origin') || '';
    const host = req.headers.get('host') || '';
    
    // Validate that the request is coming from your own domain
    if (process.env.NODE_ENV === 'production' && !origin.includes(host)) {
      logger.error('CSRF attempt detected', { origin, host });
      return NextResponse.json(
        { success: false, message: 'Invalid request origin' },
        { status: 403 }
      );
    }
  }
  
  return null;
}
/**
 * Performance utilities to optimize rendering and animations
 */

/**
 * Debounce function to limit how often a function can be called
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 * @param func The function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request animation frame with fallback
 * @param callback The callback function to execute
 * @returns Request ID
 */
export function requestAnimationFrameWithFallback(callback: FrameRequestCallback): number {
  return window.requestAnimationFrame || 
         ((callback) => window.setTimeout(callback, 1000 / 60))(callback);
}

/**
 * Cancel animation frame with fallback
 * @param requestId The request ID to cancel
 */
export function cancelAnimationFrameWithFallback(requestId: number): void {
  (window.cancelAnimationFrame || window.clearTimeout)(requestId);
}

/**
 * Check if browser supports passive event listeners
 * This improves scrolling performance
 */
export const supportsPassiveEvents = (): boolean => {
  let supportsPassive = false;
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {}
  
  return supportsPassive;
};

/**
 * Get passive event options based on browser support
 */
export const getPassiveEventOptions = (): boolean | { passive: boolean } => {
  return supportsPassiveEvents() ? { passive: true } : false;
};

/**
 * Optimize image loading by setting loading="lazy" and decoding="async"
 * @param imgElement The image element to optimize
 */
export function optimizeImageLoading(imgElement: HTMLImageElement): void {
  if ('loading' in HTMLImageElement.prototype) {
    imgElement.loading = 'lazy';
  }
  if ('decoding' in HTMLImageElement.prototype) {
    imgElement.decoding = 'async';
  }
}

/**
 * Detect if the device is a low-end device based on hardware concurrency
 * This can be used to reduce animations on low-end devices
 */
export function isLowEndDevice(): boolean {
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  return hardwareConcurrency <= 4;
}

/**
 * Reduce animation complexity based on device capability
 * @returns Animation settings object
 */
export function getOptimizedAnimationSettings() {
  const isLowEnd = isLowEndDevice();
  
  return {
    particleCount: isLowEnd ? 15 : 50,
    particleSize: isLowEnd ? 1 : 2,
    animationDuration: isLowEnd ? 0.3 : 0.5,
    useSimpleAnimations: isLowEnd,
    disableParallax: isLowEnd,
  };
}

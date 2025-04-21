/**
 * Utility functions for optimizing scroll performance
 */

// Throttle function to limit how often a function can be called
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Use Intersection Observer to detect when elements are in view
export function createScrollObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);
}

// Smooth scroll to element
export function smoothScrollTo(elementId: string, offset: number = 0): void {
  if (typeof window === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// Prevent scroll jank by using passive event listeners
export function addPassiveEventListener(
  element: HTMLElement | Window,
  eventName: string,
  handler: EventListenerOrEventListenerObject
): void {
  element.addEventListener(eventName, handler, { passive: true });
}

// Remove passive event listener
export function removePassiveEventListener(
  element: HTMLElement | Window,
  eventName: string,
  handler: EventListenerOrEventListenerObject
): void {
  element.removeEventListener(eventName, handler);
}

// Calculate scroll percentage
export function getScrollPercentage(): number {
  if (typeof window === 'undefined') return 0;
  
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = 
    document.documentElement.scrollHeight - 
    document.documentElement.clientHeight;
  
  return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
}

// Apply scroll-linked animation with better performance
export function applyScrollAnimation(
  element: HTMLElement,
  startPercent: number = 0,
  endPercent: number = 100,
  propertyName: string,
  startValue: number,
  endValue: number,
  unit: string = 'px'
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleScroll = throttle(() => {
    const scrollPercent = getScrollPercentage();
    
    if (scrollPercent >= startPercent && scrollPercent <= endPercent) {
      const ratio = (scrollPercent - startPercent) / (endPercent - startPercent);
      const value = startValue + (endValue - startValue) * ratio;
      
      // Use transform for better performance when possible
      if (propertyName === 'translateY' || propertyName === 'translateX') {
        element.style.transform = `${propertyName}(${value}${unit})`;
      } else {
        (element.style as any)[propertyName] = `${value}${unit}`;
      }
    }
  }, 10); // 10ms throttle for smooth animation
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Performance monitoring utilities for the Fuzzie application
 * This helps identify and address performance bottlenecks
 */

// Interface for performance metrics
interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    navigationStart: number;
    loadEventEnd: number;
    domComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
}

// Interface for performance monitoring options
interface PerformanceMonitorOptions {
  enableMemoryMonitoring?: boolean;
  enableFPSMonitoring?: boolean;
  logToConsole?: boolean;
  sampleInterval?: number;
}

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
  private options: PerformanceMonitorOptions;
  private isMonitoring: boolean = false;
  private fpsValues: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private onMetricsCallback: ((metrics: PerformanceMetrics) => void) | null = null;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enableMemoryMonitoring: options.enableMemoryMonitoring ?? false,
      enableFPSMonitoring: options.enableFPSMonitoring ?? true,
      logToConsole: options.logToConsole ?? false,
      sampleInterval: options.sampleInterval ?? 1000, // Default to 1 second
    };
  }

  /**
   * Start monitoring performance
   */
  public start(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    if (this.options.enableFPSMonitoring) {
      this.lastFrameTime = performance.now();
      this.frameCount = 0;
      this.monitorFrame();
    }

    // Set up interval for collecting metrics
    this.monitoringInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      
      if (this.options.logToConsole) {
        console.log('Performance metrics:', metrics);
      }
      
      if (this.onMetricsCallback) {
        this.onMetricsCallback(metrics);
      }
    }, this.options.sampleInterval);
  }

  /**
   * Stop monitoring performance
   */
  public stop(): void {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.fpsValues = [];
  }

  /**
   * Set callback for metrics updates
   */
  public onMetrics(callback: (metrics: PerformanceMetrics) => void): void {
    this.onMetricsCallback = callback;
  }

  /**
   * Get current FPS (frames per second)
   */
  public getFPS(): number {
    if (this.fpsValues.length === 0) return 0;
    return this.fpsValues.reduce((sum, fps) => sum + fps, 0) / this.fpsValues.length;
  }

  /**
   * Collect all performance metrics
   */
  private collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      fps: this.getFPS(),
      timing: this.getTimingMetrics(),
    };

    // Add memory metrics if enabled and available
    if (this.options.enableMemoryMonitoring && this.isMemoryInfoAvailable()) {
      metrics.memory = this.getMemoryInfo();
    }

    return metrics;
  }

  /**
   * Monitor frame rate
   */
  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    const elapsed = now - this.lastFrameTime;
    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsValues.push(fps);
      
      // Keep only the last 5 FPS values for a moving average
      if (this.fpsValues.length > 5) {
        this.fpsValues.shift();
      }
      
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Check if memory info is available
   */
  private isMemoryInfoAvailable(): boolean {
    return !!(performance as any).memory;
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): PerformanceMetrics['memory'] {
    if (!this.isMemoryInfoAvailable()) return undefined;
    
    const memoryInfo = (performance as any).memory;
    return {
      usedJSHeapSize: memoryInfo.usedJSHeapSize,
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
    };
  }

  /**
   * Get timing metrics
   */
  private getTimingMetrics(): PerformanceMetrics['timing'] {
    const timing = performance.timing || { navigationStart: 0, loadEventEnd: 0, domComplete: 0 };
    
    // Get paint timing metrics
    let firstPaint = 0;
    let firstContentfulPaint = 0;
    
    if (window.performance && window.performance.getEntriesByType) {
      const paintMetrics = performance.getEntriesByType('paint');
      
      const fpEntry = paintMetrics.find(entry => entry.name === 'first-paint');
      if (fpEntry) firstPaint = fpEntry.startTime;
      
      const fcpEntry = paintMetrics.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) firstContentfulPaint = fcpEntry.startTime;
    }
    
    return {
      navigationStart: timing.navigationStart,
      loadEventEnd: timing.loadEventEnd,
      domComplete: timing.domComplete,
      firstPaint,
      firstContentfulPaint,
    };
  }
}

/**
 * Create and initialize a performance monitor
 */
export function createPerformanceMonitor(options?: PerformanceMonitorOptions): PerformanceMonitor {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return null as any;
  }
  
  const monitor = new PerformanceMonitor(options);
  
  // Start monitoring in development mode or if explicitly enabled in production
  if (process.env.NODE_ENV !== 'production' || options?.logToConsole) {
    monitor.start();
  }
  
  return monitor;
}

/**
 * Report performance issues to the console
 */
export function reportPerformanceIssues(metrics: PerformanceMetrics): void {
  const issues: string[] = [];
  
  // Check for low FPS
  if (metrics.fps < 30) {
    issues.push(`Low FPS detected: ${metrics.fps.toFixed(1)} FPS`);
  }
  
  // Check for high memory usage
  if (metrics.memory) {
    const usedMemoryPercentage = (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100;
    if (usedMemoryPercentage > 80) {
      issues.push(`High memory usage: ${usedMemoryPercentage.toFixed(1)}% of available JS heap`);
    }
  }
  
  // Check for slow page load
  const loadTime = metrics.timing.loadEventEnd - metrics.timing.navigationStart;
  if (loadTime > 3000) {
    issues.push(`Slow page load: ${(loadTime / 1000).toFixed(1)}s`);
  }
  
  // Log issues if any
  if (issues.length > 0) {
    console.warn('Performance issues detected:', issues);
  }
}

/**
 * Helper to measure execution time of a function
 */
export function measureExecutionTime<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${label} execution time: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

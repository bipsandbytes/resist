/**
 * StorageManager - A proxy for Chrome's local storage that maintains an in-memory cache
 * 
 * This provides the following services:
 * 1. Loading all storage into memory on startup
 * 2. Serving reads/writes from memory (instantaneous)
 * 3. Flushing changes to Chrome storage with debouncing
 * 4. Automatically syncing with other tabs via storage change events
 */

import { logger } from './utils/logger'

export class StorageManager {
  private cache: { [key: string]: any } = {};
  private dirty = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private changeListeners: Set<(changes: { [key: string]: any }) => void> = new Set();

  constructor() {
    this.setupStorageListener();
  }

  /**
   * Initialize the storage manager by loading all data from Chrome storage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[StorageManager] Already initialized');
      return;
    }

    try {
      logger.info('[StorageManager] Initializing...');
      const startTime = Date.now();
      
      // Load all data from Chrome storage using callback-based API for Manifest V2
      const result = await new Promise<{ [key: string]: any }>((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });
      this.cache = result;
      
      const loadTime = Date.now() - startTime;
      logger.info(`[StorageManager] Initialized in ${loadTime}ms with ${Object.keys(this.cache).length} keys`);
      
      this.isInitialized = true;
    } catch (error) {
      logger.error('[StorageManager] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get a value from storage (from memory cache)
   */
  get(key: string): any {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    return this.cache[key];
  }

  /**
   * Get multiple values from storage (from memory cache)
   */
  getMultiple(keys: string[]): { [key: string]: any } {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    const result: { [key: string]: any } = {};
    keys.forEach(key => {
      result[key] = this.cache[key];
    });
    return result;
  }

  /**
   * Get all storage data (from memory cache)
   */
  getAll(): { [key: string]: any } {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    return { ...this.cache };
  }

  /**
   * Set a value in storage (updates memory cache and marks as dirty)
   */
  set(key: string, value: any): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    logger.info('[StorageManager] Setting value:', key, value);
    
    this.cache[key] = value;
    this.markDirty();
  }

  /**
   * Set multiple values in storage (updates memory cache and marks as dirty)
   */
  setMultiple(values: { [key: string]: any }): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    Object.assign(this.cache, values);
    this.markDirty();
  }

  /**
   * Remove a key from storage (updates memory cache and marks as dirty)
   */
  remove(key: string): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    delete this.cache[key];
    this.markDirty();
  }

  /**
   * Remove multiple keys from storage (updates memory cache and marks as dirty)
   */
  removeMultiple(keys: string[]): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    keys.forEach(key => delete this.cache[key]);
    this.markDirty();
  }

  /**
   * Clear all storage (updates memory cache and marks as dirty)
   */
  clear(): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    this.cache = {};
    this.markDirty();
  }

  /**
   * Check if a key exists in storage
   */
  has(key: string): boolean {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    return key in this.cache;
  }

  /**
   * Get the number of keys in storage
   */
  size(): number {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    return Object.keys(this.cache).length;
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
    
    return Object.keys(this.cache);
  }

  /**
   * Force an immediate flush to Chrome storage
   */
  async flush(): Promise<void> {
    if (!this.dirty) {
      logger.info('[StorageManager] No changes to flush');
      return;
    }

    try {
      logger.info('[StorageManager] Flushing changes to Chrome storage...');
      const startTime = Date.now();
      
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set(this.cache, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
      
      const flushTime = Date.now() - startTime;
      logger.info(`[StorageManager] Flushed in ${flushTime}ms`);
      
      this.dirty = false;
      this.clearFlushTimer();
    } catch (error) {
      logger.error('[StorageManager] Failed to flush:', error);
      // Keep dirty flag true so we can retry later
      throw error;
    }
  }

  /**
   * Mark storage as dirty and schedule a flush
   */
  private markDirty(): void {
    this.dirty = true;
    this.scheduleFlush();
  }

  /**
   * Schedule a flush with debouncing (max 1 per second)
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return; // Already scheduled
    }

    this.flushTimer = setTimeout(async () => {
      try {
        await this.flush();
      } catch (error) {
        logger.error('[StorageManager] Scheduled flush failed:', error);
        // Reschedule if flush failed
        this.dirty = true;
        this.scheduleFlush();
      }
    }, 100); // 100ms debounce
  }

  /**
   * Clear the flush timer
   */
  private clearFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Setup listener for Chrome storage changes (from other tabs)
   */
  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace !== 'local') {
        return; // Only care about local storage
      }

      logger.info('[StorageManager] Storage changed in another tab:', Object.keys(changes));
      
      // Debounce the reload to avoid multiple rapid reloads
      this.scheduleReload();
    });
  }

  /**
   * Schedule a reload from Chrome storage (debounced)
   */
  private reloadTimer: NodeJS.Timeout | null = null;
  private scheduleReload(): void {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }

    this.reloadTimer = setTimeout(async () => {
      await this.reloadFromStorage();
    }, 100); // 100ms debounce
  }

  /**
   * Reload the entire cache from Chrome storage
   */
  private async reloadFromStorage(): Promise<void> {
    try {
      logger.info('[StorageManager] Reloading cache from Chrome storage...');
      const startTime = Date.now();
      
      const result = await new Promise<{ [key: string]: any }>((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });
      this.cache = result;
      
      const reloadTime = Date.now() - startTime;
      logger.info(`[StorageManager] Reloaded in ${reloadTime}ms`);
      
      // Notify listeners of the change
      this.notifyChangeListeners(result);
      
      // Clear dirty flag since we're now in sync
      this.dirty = false;
      this.clearFlushTimer();
    } catch (error) {
      logger.error('[StorageManager] Failed to reload from storage:', error);
    }
  }

  /**
   * Add a listener for storage changes
   */
  addChangeListener(listener: (changes: { [key: string]: any }) => void): void {
    this.changeListeners.add(listener);
  }

  /**
   * Remove a listener for storage changes
   */
  removeChangeListener(listener: (changes: { [key: string]: any }) => void): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Notify all change listeners
   */
  private notifyChangeListeners(changes: { [key: string]: any }): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(changes);
      } catch (error) {
        logger.error('[StorageManager] Error in change listener:', error);
      }
    });
  }

  /**
   * Get storage statistics for debugging
   */
  getStats(): {
    isInitialized: boolean;
    cacheSize: number;
    isDirty: boolean;
    hasFlushTimer: boolean;
    hasReloadTimer: boolean;
    changeListenerCount: number;
  } {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.size(),
      isDirty: this.dirty,
      hasFlushTimer: this.flushTimer !== null,
      hasReloadTimer: this.reloadTimer !== null,
      changeListenerCount: this.changeListeners.size
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearFlushTimer();
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = null;
    }
    this.changeListeners.clear();
    this.cache = {};
    this.isInitialized = false;
    this.dirty = false;
  }
}

// Export a singleton instance
export const storageManager = new StorageManager();

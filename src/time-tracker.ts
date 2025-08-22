/**
 * TimeTracker - Viewport-based time tracking for posts
 * 
 * Uses Intersection Observer to track when posts are 10%+ visible
 * and measures time spent looking at each post.
 */

import { postPersistence } from './post-persistence'

interface TrackedPost {
  postId: string
  element: HTMLElement
  startTime: number
  isVisible: boolean
  isPaused: boolean  // Track if paused by hover interactions
  isScreened: boolean  // Track if paused due to screen being shown
  isTabHidden: boolean  // Track if paused due to tab being hidden
}

export class TimeTracker {
  private observer: IntersectionObserver
  private trackedPosts = new Map<string, TrackedPost>()

  constructor() {
    // Create intersection observer with 50% threshold
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersectionChanges(entries),
      {
        threshold: 0.1, // 50% of post must be visible
        rootMargin: '0px'
      }
    )
    
    // Add tab visibility event listeners
    this.setupTabVisibilityHandlers()
  }

  /**
   * Start tracking time for a post
   * Checks screen status before starting - screened posts are not tracked
   */
  async startTracking(postElement: HTMLElement, postId: string): Promise<void> {
    // Check if we're already tracking this post
    if (this.trackedPosts.has(postId)) {
      const existingPost = this.trackedPosts.get(postId)!
      
      // If the existing element is no longer in DOM, clean it up and continue
      if (!this.isElementInDOM(existingPost.element)) {
        console.log(`[${postId}] [TimeTracker] Found stale reference, cleaning up`)
        this.cleanupStaleEntry(postId)
      } else {
        // Element is still valid, don't track twice
        return
      }
    }

    // Check if post is currently screened
    const isScreened = await postPersistence.isScreenEnabledForToday(postId)
    
    console.log(`[${postId}] [TimeTracker] Starting tracking (screened: ${isScreened})`)

    const trackedPost: TrackedPost = {
      postId,
      element: postElement,
      startTime: 0,
      isVisible: false,
      isPaused: false,
      isScreened: isScreened,  // Set initial screen state
      isTabHidden: false  // Initially tab is visible
    }

    this.trackedPosts.set(postId, trackedPost)
    this.observer.observe(postElement)
  }

  /**
   * Stop tracking a specific post and persist its time
   */
  async stopTracking(postId: string): Promise<void> {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Stopping tracking`)

    // If post is currently visible, record the final time segment
    if (trackedPost.isVisible && trackedPost.startTime > 0) {
      const timeSpent = Date.now() - trackedPost.startTime
      await this.persistTimeSpent(postId, timeSpent)
    }

    // Clean up
    this.observer.unobserve(trackedPost.element)
    this.trackedPosts.delete(postId)
  }

  /**
   * Pause time tracking for a post (like viewport exit)
   * Persists accumulated time and resets startTime
   */
  async pauseTracking(postId: string): Promise<void> {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Pausing tracking (hover enter)`)

    // If post is currently visible and not already paused, record the time segment
    if (trackedPost.isVisible && !trackedPost.isPaused && trackedPost.startTime > 0) {
      const timeSpent = Date.now() - trackedPost.startTime
      await this.persistTimeSpent(postId, timeSpent)
    }

    // Mark as paused and reset startTime
    trackedPost.isPaused = true
    trackedPost.startTime = 0
  }

  /**
   * Resume time tracking for a post (like viewport enter)
   * Sets new startTime if post is visible
   */
  resumeTracking(postId: string): void {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Resuming tracking (hover leave)`)

    // Mark as no longer paused FIRST
    trackedPost.isPaused = false

    // Now check if we should start timing
    if (this.shouldStartTiming(trackedPost)) {
      trackedPost.startTime = Date.now()
    }
  }

  /**
   * Pause time tracking due to screen being shown
   * Similar to pauseTracking but sets isScreened flag
   */
  async pauseForScreen(postId: string): Promise<void> {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Pausing for screen`)

    // If post is currently visible and actively tracking, record the time segment
    if (trackedPost.isVisible && !trackedPost.isPaused && !trackedPost.isScreened && trackedPost.startTime > 0) {
      const timeSpent = Date.now() - trackedPost.startTime
      await this.persistTimeSpent(postId, timeSpent)
    }

    // Mark as screened and reset startTime
    trackedPost.isScreened = true
    trackedPost.startTime = 0
  }

  /**
   * Resume time tracking after screen is dismissed
   * Clears isScreened flag and restarts timing if visible
   */
  resumeFromScreen(postId: string): void {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Resuming from screen dismissal`)

    // If post is visible and was screened, restart timing
    if (this.shouldStartTiming(trackedPost)) {
      trackedPost.startTime = Date.now()
    }

    // Mark as no longer screened
    trackedPost.isScreened = false
  }

  /**
   * Pause time tracking due to tab becoming hidden
   * Persists time for all visible posts and sets isTabHidden flag
   */
  private async pauseForTabHidden(): Promise<void> {
    console.log('[TimeTracker] Tab became hidden, pausing all timers')
    
    const promises: Promise<void>[] = []
    
    this.trackedPosts.forEach(trackedPost => {
      if (trackedPost.isVisible && !trackedPost.isTabHidden && trackedPost.startTime > 0) {
        // Record time even if other pause states exist
        const timeSpent = Date.now() - trackedPost.startTime
        promises.push(this.persistTimeSpent(trackedPost.postId, timeSpent))
      }
      
      trackedPost.isTabHidden = true
      trackedPost.startTime = 0
    })
    
    // Wait for all time persistence to complete
    await Promise.all(promises)
  }

  /**
   * Resume time tracking after tab becomes visible
   * Clears isTabHidden flag and restarts timing for visible posts
   */
  private resumeFromTabHidden(): void {
    console.log('[TimeTracker] Tab became visible, resuming timers')
    
    this.trackedPosts.forEach(trackedPost => {
      trackedPost.isTabHidden = false
      
      // Only restart timing if post is visible AND not paused by other reasons
      if (this.shouldStartTiming(trackedPost)) {
        trackedPost.startTime = Date.now()
      }
    })
  }

  /**
   * Setup tab visibility event handlers
   */
  private setupTabVisibilityHandlers(): void {
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[TimeTracker] Tab became hidden, pausing all timers')
        this.pauseForTabHidden()
      } else {
        this.resumeFromTabHidden()
      }
    })
    
    // Also listen for window focus/blur as backup
    window.addEventListener('blur', () => {
      this.pauseForTabHidden()
    })
    
    window.addEventListener('focus', () => {
      this.resumeFromTabHidden()
    })
  }

  /**
   * Check if timing should start for a post
   * Returns true only if ALL pause conditions are false
   */
  private shouldStartTiming(trackedPost: TrackedPost): boolean {
    const shouldStart = trackedPost.isVisible && 
           !trackedPost.isPaused && 
           !trackedPost.isScreened && 
           !trackedPost.isTabHidden
    console.log(`[${trackedPost.postId}] [TimeTracker] shouldStartTiming: ${trackedPost.isVisible} ${!trackedPost.isPaused} ${!trackedPost.isScreened} ${!trackedPost.isTabHidden} ${shouldStart}`)
    return shouldStart
  }

  /**
   * Stop tracking all posts (cleanup)
   */
  async stopAllTracking(): Promise<void> {
    const postIds = Array.from(this.trackedPosts.keys())
    await Promise.all(postIds.map(postId => this.stopTracking(postId)))
  }

  /**
   * Handle intersection observer changes
   */
  private handleIntersectionChanges(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const postId = this.findPostIdByElement(entry.target as HTMLElement)
      if (!postId) return

      const trackedPost = this.trackedPosts.get(postId)
      if (!trackedPost) return

      // Check if element is still connected to DOM
      if (!this.isElementInDOM(trackedPost.element)) {
        console.log(`[${postId}] [TimeTracker] Element disconnected during intersection event`)
        this.cleanupStaleEntry(postId)
        return
      }

      const isVisible = entry.isIntersecting
      const now = Date.now()

      if (isVisible && !trackedPost.isVisible) {
        // Post became visible - start timing (unless paused by hover, screened, or tab hidden)
        console.log(`[${postId}] [TimeTracker] Entered viewport`)
        trackedPost.isVisible = true
        if (this.shouldStartTiming(trackedPost)) {
          trackedPost.startTime = now
        }
      } else if (!isVisible && trackedPost.isVisible) {
        // Post became invisible - record time and persist (unless already paused, screened, or tab hidden)
        console.log(`[${postId}] [TimeTracker] Left viewport`)
        
        let timeSpent = 0
        if (this.shouldStartTiming(trackedPost) && trackedPost.startTime > 0) {
          timeSpent = now - trackedPost.startTime
        }
        
        trackedPost.isVisible = false
        trackedPost.startTime = 0

        // Persist the time spent (fire and forget) - only if we had active timing
        if (timeSpent > 0) {
          this.persistTimeSpent(postId, timeSpent).catch(error => {
            console.error(`[${postId}] [TimeTracker] Failed to persist time:`, error)
          })
        }
      }
    })
  }

  /**
   * Find post ID by DOM element
   */
  private findPostIdByElement(element: HTMLElement): string | null {
    for (const [postId, trackedPost] of this.trackedPosts.entries()) {
      if (trackedPost.element === element) {
        return postId
      }
    }
    return null
  }

  /**
   * Persist time spent to storage
   */
  private async persistTimeSpent(postId: string, timeSpentMs: number): Promise<void> {
    if (timeSpentMs <= 0) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Persisting ${timeSpentMs}ms`)

    try {
      // Use the PostPersistenceManager to update time spent
      await postPersistence.updateTimeSpent(postId, timeSpentMs)
    } catch (error) {
      console.error(`[${postId}] [TimeTracker] Failed to persist time:`, error)
    }
  }

  /**
   * Check if DOM element is still connected to the document
   */
  private isElementInDOM(element: HTMLElement): boolean {
    return element.isConnected
  }

  /**
   * Clean up tracking entry for disconnected element
   */
  private cleanupStaleEntry(postId: string): void {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Cleaning up stale DOM reference`)
    
    // Unobserve the stale element
    this.observer.unobserve(trackedPost.element)
    
    // Remove from tracking
    this.trackedPosts.delete(postId)
  }

  /**
   * Get current tracking statistics (for debugging)
   */
  getTrackingStats(): { totalTracked: number, currentlyVisible: number, tabHidden: number, paused: number, screened: number } {
    const totalTracked = this.trackedPosts.size
    const currentlyVisible = Array.from(this.trackedPosts.values())
      .filter(post => post.isVisible).length
    const tabHidden = Array.from(this.trackedPosts.values())
      .filter(post => post.isTabHidden).length
    const paused = Array.from(this.trackedPosts.values())
      .filter(post => post.isPaused).length
    const screened = Array.from(this.trackedPosts.values())
      .filter(post => post.isScreened).length

    return { totalTracked, currentlyVisible, tabHidden, paused, screened }
  }
}
/**
 * BaseSocialMediaPlatform - Shared functionality for all social media platforms
 * 
 * Provides common implementations that all platforms can inherit from.
 */

import { postPersistence } from '../post-persistence'
import { nutritionFactsOverlay } from '../nutrition-label'
import { createResistOverlay, setupOverlayMessageCycling } from '../overlay'
import { PostElement, PostContent, AuthorInfo, MediaElement } from '../types'
import { TimeTracker } from '../time-tracker'
import { logger } from '../utils/logger'

export abstract class BaseSocialMediaPlatform {
  protected timeTracker: TimeTracker

  constructor(timeTracker: TimeTracker) {
    this.timeTracker = timeTracker
  }
  /**
   * Generate dynamic overlay content with latest timeSpent data
   * This implementation is shared across all platforms
   */
  async generateDynamicOverlayContent(postId: string): Promise<string | null> {
    try {
      // Fetch latest data from storage
      const cachedEntry = await postPersistence.getPost(postId)
      
              if (!cachedEntry?.classification) {
          logger.debug(`[${postId}] No classification data available for overlay`)
          return null
        }
        
        // Get current timeSpent (accumulated by TimeTracker)
        const currentTimeSpent = cachedEntry.metadata.timeSpent || 0
        logger.debug(`[${postId}] Generating overlay with current timeSpent: ${currentTimeSpent}ms`)
        
        // Generate fresh nutrition label content
        return nutritionFactsOverlay(cachedEntry.classification, currentTimeSpent, cachedEntry.state, cachedEntry.postData)
        
      } catch (error) {
        logger.error(`[${postId}] Failed to generate dynamic overlay content:`, error)
        return null
      }
  }

  /**
   * Complete overlay setup for a button
   * Handles overlay creation, cache checking, DOM management, and hover interactions
   */
  async setupButtonOverlay(button: HTMLElement, postId: string): Promise<void> {
    // Check if overlay already exists in cache and DOM
    const cachedEntry = await postPersistence.getPost(postId);
    const expectedOverlayId = `overlay-${postId}`;
    let overlay = document.getElementById(expectedOverlayId);
    
          if (cachedEntry && overlay) {
        // Overlay exists in both cache and DOM - reuse it
        logger.debug(`[${postId}] Reusing existing overlay from DOM`);
      } else if (cachedEntry && !overlay) {
        // Entry exists in cache but overlay missing from DOM - recreate it
        logger.debug(`[${postId}] Recreating overlay from cache (missing from DOM)`);
        overlay = createResistOverlay(postId);
        setupOverlayMessageCycling(overlay);
        document.body.appendChild(overlay);
      } else {
        // No cache entry - create new overlay
        logger.debug(`[${postId}] Creating new overlay (no cache entry)`);
        overlay = createResistOverlay(postId);
        setupOverlayMessageCycling(overlay);
        document.body.appendChild(overlay);
      }
    
    // Setup hover interactions
    this.setupButtonOverlayInteraction(button, overlay, postId);
  }

  /**
   * Setup button hover interactions with overlay
   * This handles the common mouseenter/mouseleave logic for all platforms
   */
  private setupButtonOverlayInteraction(button: HTMLElement, overlay: HTMLElement, postId: string): void {
    let hideTimeout: NodeJS.Timeout | null = null;
    
    const showOverlay = async () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Pause time tracking when hovering over button/overlay
      await this.timeTracker.pauseTracking(postId);
      
      // Use shared implementation to generate fresh overlay content
      const overlayContent = await this.generateDynamicOverlayContent(postId);
      if (overlayContent) {
        overlay.innerHTML = overlayContent;
      }
      
      // Position overlay relative to button
      const rect = button.getBoundingClientRect();
      overlay.style.left = `${rect.right + window.scrollX - 10}px`;
      overlay.style.top = `${rect.top + window.scrollY + 20}px`;
      overlay.style.display = 'block';
    };
    
    const hideOverlay = () => {
      hideTimeout = setTimeout(() => {
        overlay.style.display = 'none';
        // Resume time tracking when leaving button/overlay
        this.timeTracker.resumeTracking(postId);
      }, 100); // Small delay to allow mouse to move to overlay
    };
    
    // Button hover events
    button.addEventListener('mouseenter', showOverlay);
    button.addEventListener('mouseleave', hideOverlay);
    
    // Overlay hover events to keep it visible
    overlay.addEventListener('mouseenter', async () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      // Ensure tracking is paused when moving to overlay
      await this.timeTracker.pauseTracking(postId);
    });
    
    overlay.addEventListener('mouseleave', hideOverlay);
  }

  /**
   * Extract content from a post (shared implementation)
   * Platform-specific subclasses can override if needed
   */
  extractPostContent(post: PostElement): PostContent {
    const text = this.extractText(post.element)
    const authorInfo = this.extractAuthorInfo(post)
    const mediaElements = this.extractMediaElements(post)
    
    return {
      text,
      authorName: authorInfo.name,
      mediaElements
    }
  }

  // Abstract methods that platforms must implement
  abstract extractText(element: HTMLElement): string
  abstract extractAuthorInfo(post: PostElement): AuthorInfo
  abstract extractMediaElements(post: PostElement): MediaElement[]
}
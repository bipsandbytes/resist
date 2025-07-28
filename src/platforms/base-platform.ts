/**
 * BaseSocialMediaPlatform - Shared functionality for all social media platforms
 * 
 * Provides common implementations that all platforms can inherit from.
 */

import { postPersistence } from '../post-persistence'
import { nutritionFactsOverlay } from '../nutrition-label'
import { createResistOverlay, setupOverlayMessageCycling } from '../overlay'

export abstract class BaseSocialMediaPlatform {
  /**
   * Generate dynamic overlay content with latest timeSpent data
   * This implementation is shared across all platforms
   */
  async generateDynamicOverlayContent(postId: string): Promise<string | null> {
    try {
      // Fetch latest data from storage
      const cachedEntry = await postPersistence.getPost(postId)
      
      if (!cachedEntry?.classification) {
        console.log(`[${postId}] No classification data available for overlay`)
        return null
      }
      
      // Get current timeSpent (accumulated by TimeTracker)
      const currentTimeSpent = cachedEntry.metadata.timeSpent || 0
      console.log(`[${postId}] Generating overlay with current timeSpent: ${currentTimeSpent}ms`)
      
      // Generate fresh nutrition label content
      return nutritionFactsOverlay(cachedEntry.classification, currentTimeSpent)
      
    } catch (error) {
      console.error(`[${postId}] Failed to generate dynamic overlay content:`, error)
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
      console.log(`[${postId}] Reusing existing overlay from DOM`);
    } else if (cachedEntry && !overlay) {
      // Entry exists in cache but overlay missing from DOM - recreate it
      console.log(`[${postId}] Recreating overlay from cache (missing from DOM)`);
      overlay = createResistOverlay(postId);
      setupOverlayMessageCycling(overlay);
      document.body.appendChild(overlay);
    } else {
      // No cache entry - create new overlay
      console.log(`[${postId}] Creating new overlay (no cache entry)`);
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
      }, 100); // Small delay to allow mouse to move to overlay
    };
    
    // Button hover events
    button.addEventListener('mouseenter', showOverlay);
    button.addEventListener('mouseleave', hideOverlay);
    
    // Overlay hover events to keep it visible
    overlay.addEventListener('mouseenter', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });
    
    overlay.addEventListener('mouseleave', hideOverlay);
  }
}
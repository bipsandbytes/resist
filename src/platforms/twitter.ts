import { SocialMediaPlatform, PostElement, PostContent, AuthorInfo, MediaElement } from '../types'
import { BaseSocialMediaPlatform } from './base-platform'
import { postPersistence } from '../post-persistence'
import { TimeTracker } from '../time-tracker'
import { createResistIcon } from '../resist-icon'

export class TwitterPlatform extends BaseSocialMediaPlatform implements SocialMediaPlatform {
  private observer: MutationObserver | null = null
  private processingIcons = new Set<string>()
  private processingScreens = new Set<string>()
  
  detectPosts(): PostElement[] {
    const posts = document.querySelectorAll('article[data-testid="tweet"]')
    return Array.from(posts).map((element) => {
      const stableId = this.generateStableId(element as HTMLElement)
      
      return {
        element: element as HTMLElement,
        id: stableId
      }
    })
  }

  /**
   * Generate stable ID that survives DOM mutations and page refreshes
   * Format: twitter-{username}-{statusId}
   */
  generateStableId(element: HTMLElement): string {
    const username = this.extractUsername(element)
    const statusId = this.extractPostId(element)
    
    if (!statusId) {
      throw new Error('Status ID is required but not found')
    }
    
    if (!username) {
      throw new Error('Username is required but not found')
    }
    
    // Use clean username directly (no processing needed)
    return `twitter-${username}-${statusId}`
  }
  
  extractText(element: HTMLElement): string {
    // Find all tweet text elements (main tweet + quote tweets)
    const tweetTextElements = element.querySelectorAll('[data-testid="tweetText"]')
    
    // Extract text from each and combine with separator
    const allText = Array.from(tweetTextElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join(' | ')
    
    return allText
  }
  
  extractAuthorInfo(post: PostElement): AuthorInfo {
    const authorElement = post.element.querySelector('[data-testid="User-Name"]')
    // Look for the actual name - it's typically the first text content in the User-Name element
    const nameElement = authorElement?.querySelector('span span')
    const name = nameElement?.textContent?.trim() || 'Unknown'
    
    return { name }
  }
  
  extractUsername(element: HTMLElement): string | null {
    // Strategy 1: Look for links to user profiles in the tweet
    const userLinks = element.querySelectorAll('a[href^="/"]')
    for (const link of userLinks) {
      const href = (link as HTMLAnchorElement).href
      // Match Twitter profile URLs: /username or /username/status/...
      const match = href.match(/\/([a-zA-Z0-9_]+)(?:\/|$)/)
      if (match && !href.includes('/status/') && !href.includes('/i/')) {
        return match[1]
      }
    }
    
    // Strategy 2: Look for @username in the User-Name area
    const userNameElement = element.querySelector('[data-testid="User-Name"]')
    if (userNameElement) {
      const text = userNameElement.textContent || ''
      const atMatch = text.match(/@([a-zA-Z0-9_]+)/)
      if (atMatch) {
        return atMatch[1]
      }
    }
    
    return null
  }
  
  extractMediaElements(post: PostElement): MediaElement[] {
    // Look for images in tweet photos
    const images = post.element.querySelectorAll('[data-testid="tweetPhoto"] img')
    const videos = post.element.querySelectorAll('video')
    
    const mediaElements: MediaElement[] = []
    
    images.forEach(img => {
      mediaElements.push({
        type: 'image',
        element: img as HTMLElement,
        src: (img as HTMLImageElement).src
      })
    })
    
    videos.forEach(video => {
      mediaElements.push({
        type: 'video',
        element: video as HTMLElement,
        src: (video as HTMLVideoElement).src
      })
    })
    
    return mediaElements
  }
  
  
  
  async addResistIcon(post: PostElement): Promise<void> {
    // Check if this post is already being processed
    if (this.processingIcons.has(post.id)) {
      console.log(`[${post.id}] Icon addition already in progress, skipping`)
      return
    }
    
    // Set lock
    this.processingIcons.add(post.id)
    
    try {
      const tweetNode = post.element;
      
      // Check if button already exists in DOM (avoid duplicates)
      if (tweetNode.querySelector('.resist-btn')) return;
      
      // Try to find placement target
      const placementTarget = this.findButtonPlacementTarget(tweetNode);
      if (!placementTarget) {
        console.log(`[${post.id}] No placement target found`)
        return;
      }
      
      // Use the shared createResistIcon function instead of creating our own button
      const btn = createResistIcon();
      btn.className = 'resist-btn'; // Override class for Twitter-specific styling
      btn.style.zIndex = '1000';
      console.log(`[${post.id}] Button added to placement target`)
      console.log(btn)
      
      // Setup complete overlay functionality using shared base class
      await this.setupButtonOverlay(btn, post.id);
      
      placementTarget.appendChild(btn);
    } finally {
      // Always clear lock, even on error
      this.processingIcons.delete(post.id)
    }
  }

  async addResistScreen(post: PostElement): Promise<void> {
    // Check if this post is already being processed
    if (this.processingScreens.has(post.id)) {
      console.log(`[${post.id}] Screen addition already in progress, skipping`)
      return
    }
    
    // Set lock
    this.processingScreens.add(post.id)
    
    try {
      const tweetNode = post.element;
      
      // Check if screen already exists in DOM (avoid duplicates)
      if (tweetNode.querySelector('.resist-screen')) return;
      
      // Check cache for today's screen status
      const shouldShowScreen = await postPersistence.isScreenEnabledForToday(post.id);
      
      const screen = document.createElement('div');
      screen.className = 'resist-screen';
      screen.style.position = 'absolute';
      screen.style.top = '0';
      screen.style.left = '0';
      screen.style.width = '100%';
      screen.style.height = '100%';
      screen.style.background = 'rgba(0, 0, 0, 0.95)';
      screen.style.zIndex = '500';
      screen.style.display = shouldShowScreen ? 'block' : 'none'; // Use cached status
      screen.style.color = 'white';
      screen.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      screen.style.padding = '20px';
      screen.style.boxSizing = 'border-box';
      
      // Create screen content
      screen.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <img src="${chrome.runtime.getURL('icons/resist.svg')}" alt="Resist" style="width: 24px; height: 24px; filter: invert(1) brightness(1.2);">
            Resist
          </h2>
          <button class="resist-screen-dismiss" style="
            background: #333333;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          ">Dismiss</button>
        </div>
      `;
      
      // Add click handler to screen to prevent clicks from reaching post
      screen.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
      });
      
      // Add click handler to dismiss button
      const dismissButton = screen.querySelector('.resist-screen-dismiss') as HTMLButtonElement;
      if (dismissButton) {
        dismissButton.addEventListener('click', async (e) => {
          e.stopPropagation();
          // Update cache to disable screen for today
          await postPersistence.updateScreenStatus(post.id, false);
          this.hideResistScreen(post);
        });
        
        // Add hover effect
        dismissButton.addEventListener('mouseenter', () => {
          dismissButton.style.background = '#666666';
        });
        
        dismissButton.addEventListener('mouseleave', () => {
          dismissButton.style.background = '#333333';
        });
      }
      
      console.log(`[${post.id}] Screen added to post element`)
      
      // Make sure the post element has relative positioning for absolute child
      if (tweetNode.style.position !== 'relative') {
        tweetNode.style.position = 'relative';
      }
      
      tweetNode.appendChild(screen);
    } finally {
      // Always clear lock, even on error
      this.processingScreens.delete(post.id)
    }
  }
  
  
  // Helper function to find the best placement target for the classifier button
  findButtonPlacementTarget(tweetNode: HTMLElement): HTMLElement | null {
    // Strategy 1: Try to find the More button and place next to it
    const moreBtn = tweetNode.querySelector('button[aria-label="More"]');
    if (moreBtn) {
      // Try to find a stable parent container
      let parent = moreBtn.parentElement;
      let depth = 0;
      while (parent && depth < 6) {
        // Look for a container that has multiple action buttons
        const actionButtons = parent.querySelectorAll('button[aria-label]');
        if (actionButtons.length >= 3) {
          return parent;
        }
        parent = parent.parentElement;
        depth++;
      }
      
      // Fallback: use the original deep traversal
      // Carefully walk up the parentNode chain, checking for null and HTMLElement type
      let node: Node | null = moreBtn;
      for (let i = 0; i < 4; i++) {
        if (node && node.parentNode) {
          node = node.parentNode;
        } else {
          return null;
        }
      }
      // Ensure the result is an HTMLElement
      return node instanceof HTMLElement ? node : null;
    }
    
    return null;
  }
  
  addOverlay(post: PostElement, overlay: HTMLElement): void {
    post.element.style.position = 'relative'
    overlay.style.position = 'absolute'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.zIndex = '999'
    post.element.appendChild(overlay)
  }
  
  getPostSelector(): string {
    return 'article[data-testid="tweet"]'
  }
  
  getTextSelector(): string {
    return '[data-testid="tweetText"]'
  }
  
  getImageSelector(): string {
    return '[data-testid="tweetPhoto"] img'
  }
  
  getAuthorSelector(): string {
    return '[data-testid="User-Name"]'
  }
  
  observeNewContent(callback: (newPosts: PostElement[]) => void): void {
    if (this.observer) {
      this.observer.disconnect()
    }
    
    this.observer = new MutationObserver((mutations) => {
      let newPostsFound = false
      let shouldCheckPersistence = false
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            // Check if the added node is a tweet or contains tweets
            if (element.matches(this.getPostSelector()) || 
            element.querySelector(this.getPostSelector())) {
              newPostsFound = true
            }
          }
        })
        
        // Check if any nodes were removed (potential icon loss)
        if (mutation.removedNodes.length > 0) {
          shouldCheckPersistence = true
        }
        
        // Check if content or attributes changed (potential icon loss)
        if (mutation.type === 'characterData' || mutation.type === 'attributes') {
          const target = mutation.target as Element
          // Check if the changed element is a post or contains posts
          if (target.closest && target.closest(this.getPostSelector())) {
            shouldCheckPersistence = true
          }
        }
      })
      
      if (newPostsFound) {
        const newPosts = this.detectPosts()
        callback(newPosts)
      }
      
      // Check icon persistence after DOM mutations
      if (shouldCheckPersistence) {
        this.checkResistElementsPersistence()
      }
    })
    
    // Observe the main timeline container
    const timelineContainer = document.querySelector('[data-testid="primaryColumn"]') || 
    document.querySelector('main') || 
    document.body
    
    this.observer.observe(timelineContainer, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'data-testid', 'aria-label']
    })
  }
  
  // Cache-related methods
  getPlatformName(): string {
    return 'twitter'
  }
  
  extractPostId(element: HTMLElement): string | null {
    // Strategy 1: Look for href with tweet ID pattern
    const links = element.querySelectorAll('a[href*="/status/"]')
    for (const link of links) {
      const href = (link as HTMLAnchorElement).href
      const match = href.match(/\/status\/(\d+)/)
      if (match) return match[1]
    }
    
    // Strategy 2: Look for time elements with datetime that might contain tweet info
    const timeElements = element.querySelectorAll('time[datetime]')
    for (const time of timeElements) {
      const closest = time.closest('a[href*="/status/"]')
      if (closest) {
        const href = (closest as HTMLAnchorElement).href
        const match = href.match(/\/status\/(\d+)/)
        if (match) return match[1]
      }
    }
    
    return null
  }

  
  
  private checkResistElementsPersistence(): void {
    // Get all current posts and check if they have icons and screens
    const currentPosts = this.detectPosts()
    
    currentPosts.forEach(async post => {
      const hasIcon = post.element.querySelector('.resist-btn')
      const hasScreen = post.element.querySelector('.resist-screen')
      
      if (!hasIcon) {
        // Icon is missing, try to reattach it
        console.log(`[${post.id}] Icon missing, attempting reattachment`)
        await this.reattachIcon(post)
      }
      
      if (!hasScreen) {
        // Screen is missing, try to reattach it
        console.log(`[${post.id}] Screen missing, attempting reattachment`)
        await this.reattachScreen(post)
      }
    })
  }
  
  private async reattachIcon(post: PostElement): Promise<void> {
    // Simply call the existing addResistIcon method
    console.log(`[${post.id}] Reattaching icon using addResistIcon`)
    await this.addResistIcon(post)
  }

  private async reattachScreen(post: PostElement): Promise<void> {
    // Simply call the existing addResistScreen method
    console.log(`[${post.id}] Reattaching screen using addResistScreen`)
    await this.addResistScreen(post)
  }

  async showResistScreen(post: PostElement): Promise<void> {
    const screen = post.element.querySelector('.resist-screen') as HTMLElement
    if (screen) {
      screen.style.display = 'block'
      console.log(`[${post.id}] Screen shown`)
      
      // Pause time tracking since post is now screened
      if (this.timeTracker) {
        await this.timeTracker.pauseForScreen(post.id)
      }
    } else {
      console.warn(`[${post.id}] Screen not found, cannot show`)
    }
  }

  hideResistScreen(post: PostElement): void {
    const screen = post.element.querySelector('.resist-screen') as HTMLElement
    if (screen) {
      screen.style.display = 'none'
      console.log(`[${post.id}] Screen hidden`)
      
      // Resume time tracking since post is no longer screened
      if (this.timeTracker) {
        this.timeTracker.resumeFromScreen(post.id)
      }
    } else {
      console.warn(`[${post.id}] Screen not found, cannot hide`)
    }
  }

  // Update overlay content for a specific post
  updateOverlayContent(post: PostElement, htmlContent: string): void {
    const overlay = createResistOverlay(post.id, htmlContent)
    console.log(`[${post.id}] Updated overlay with new content`)
    
    // Make sure overlay is in the DOM
    if (!document.getElementById(`overlay-${post.id}`)) {
      document.body.appendChild(overlay)
    }
  }

}


import { SocialMediaPlatform, PostElement, PostContent, AuthorInfo, MediaElement } from '../types'
import { createResistOverlay, setupOverlayMessageCycling } from '../overlay'

export class TwitterPlatform implements SocialMediaPlatform {
  private observer: MutationObserver | null = null

  detectPosts(): PostElement[] {
    const posts = document.querySelectorAll('article[data-testid="tweet"]')
    return Array.from(posts).map((element, index) => {
      const authorInfo = this.extractAuthorInfo({ element: element as HTMLElement, id: 'temp' })
      const authorSlug = authorInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      
      return {
        element: element as HTMLElement,
        id: `twitter-${index}-${authorSlug}-${Date.now()}`
      }
    })
  }

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

  extractAuthorInfo(post: PostElement): AuthorInfo {
    const authorElement = post.element.querySelector('[data-testid="User-Name"]')
    // Look for the actual name - it's typically the first text content in the User-Name element
    const nameElement = authorElement?.querySelector('span span')
    const name = nameElement?.textContent?.trim() || 'Unknown'
    
    return { name }
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

  private extractText(element: HTMLElement): string {
    const tweetTextElement = element.querySelector('[data-testid="tweetText"]')
    return tweetTextElement?.textContent?.trim() || ''
  }


addResistIcon(post: PostElement): void {
  const tweetNode = post.element;
 
  // Check if button already exists in DOM (avoid duplicates)
  if (tweetNode.querySelector('.resist-btn')) return;
  
  // Try to find placement target
  const placementTarget = this.findButtonPlacementTarget(tweetNode);
  if (!placementTarget) {
    return;
  }
  
  const btn = document.createElement('button');
  btn.className = 'resist-btn';
  btn.textContent = '🔍';
  btn.style.zIndex = '1000';
  btn.setAttribute('aria-label', 'Resist - Digital Nutrition');
  btn.setAttribute('type', 'button');
  
  const overlay = createResistOverlay(tweetNode.id);
  setupOverlayMessageCycling(overlay);

  document.body.appendChild(overlay);
  
  // Add hover functionality
  btn.addEventListener('mouseenter', () => {
    const rect = btn.getBoundingClientRect();
    overlay.style.left = `${rect.right + window.scrollX - 10}px`;
    overlay.style.top = `${rect.top + window.scrollY + 20}px`;
    overlay.style.display = 'block';
  });
  
  btn.addEventListener('mouseleave', () => {
    overlay.style.display = 'none';
  });
  
  placementTarget.appendChild(btn);
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

  /*
  addResistIcon(post: PostElement, icon?: HTMLElement): void {
    console.log(`[${post.id}] Starting addResistIcon`)
    
    // Check if button already exists (avoid duplicates)
    if (post.element.querySelector('.resist-btn')) {
      console.log(`[${post.id}] Button already exists, skipping`)
      return
    }
    
    // Always place in footer actions area - it's always present and loaded
    const placementTarget = this.findFooterActionsContainer(post.element, post.id)
    if (!placementTarget) {
      console.log(`[${post.id}] No footer actions found, using fallback`)
      this.addToHeaderFallback(post, icon)
      return
    }
    
    console.log(`[${post.id}] Found footer actions container:`, placementTarget.tagName, placementTarget.className)
    
    // Create the button exactly like addClassifierButton
    const resistButton = document.createElement('button')
    resistButton.className = 'resist-btn'
    resistButton.innerText = '🔍'
    resistButton.style.zIndex = '1000'
    resistButton.style.marginLeft = '10px'
    
    // Add the button directly to the footer actions
    placementTarget.appendChild(resistButton)
    console.log(`[${post.id}] Button added to footer actions`)
  }

  private findFooterActionsContainer(tweetNode: HTMLElement, tweetId: string): HTMLElement | null {
    console.log(`[${tweetId}] Looking for footer actions container`)
    
    // Strategy 1: Look for the role="group" container that has reply/like/retweet buttons
    const actionContainers = tweetNode.querySelectorAll('[role="group"]')
    for (const container of actionContainers) {
      const hasReplyButton = container.querySelector('[data-testid="reply"]')
      const hasLikeButton = container.querySelector('[data-testid="like"]')
      const hasRetweetButton = container.querySelector('[data-testid="retweet"]')
      
      if (hasReplyButton || hasLikeButton || hasRetweetButton) {
        console.log(`[${tweetId}] Found footer actions container with reply=${!!hasReplyButton}, like=${!!hasLikeButton}, retweet=${!!hasRetweetButton}`)
        return container as HTMLElement
      }
    }
    
    // Strategy 2: Look for any of the action buttons and get their parent container
    const replyButton = tweetNode.querySelector('[data-testid="reply"]')
    const likeButton = tweetNode.querySelector('[data-testid="like"]')
    const retweetButton = tweetNode.querySelector('[data-testid="retweet"]')
    
    const actionButton = replyButton || likeButton || retweetButton
    if (actionButton) {
      const container = actionButton.closest('[role="group"]')
      if (container) {
        console.log(`[${tweetId}] Found actions container via action button`)
        return container as HTMLElement
      }
    }
    
    console.log(`[${tweetId}] No footer actions container found`)
    return null
  }


  private addToHeaderFallback(post: PostElement, icon?: HTMLElement): void {
    // Create a basic Resist button as fallback
    const resistButton = document.createElement('button')
    resistButton.className = 'resist-btn-fallback'
    resistButton.style.zIndex = '1000'
    resistButton.style.marginLeft = '10px'
    resistButton.setAttribute('aria-label', 'Resist - Digital Nutrition')
    resistButton.setAttribute('type', 'button')
    
    // Add basic styling
    resistButton.style.position = 'absolute'
    resistButton.style.top = '12px'
    resistButton.style.right = '12px'
    resistButton.style.background = 'transparent'
    resistButton.style.border = 'none'
    resistButton.style.cursor = 'pointer'
    resistButton.style.padding = '4px'
    
    // Add the magnifying glass icon
    resistButton.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(29, 161, 242, 0.1);
        color: rgb(29, 161, 242);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
        </svg>
      </div>
    `
    
    post.element.style.position = 'relative'
    post.element.appendChild(resistButton)
  }
  */

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
      })
      
      if (newPostsFound) {
        const newPosts = this.detectPosts()
        callback(newPosts)
      }
    })

    // Observe the main timeline container
    const timelineContainer = document.querySelector('[data-testid="primaryColumn"]') || 
                            document.querySelector('main') || 
                            document.body
    
    this.observer.observe(timelineContainer, {
      childList: true,
      subtree: true
    })
  }
}


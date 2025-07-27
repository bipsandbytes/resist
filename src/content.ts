import { TwitterPlatform } from './platforms/twitter'
import { PostElement } from './types'

console.log('Resist content script loaded')

export function ocrDone() {
  console.log('Resist: OCR done')
}

class ResistContentScript {
  private platform: TwitterPlatform
  private processedPosts = new Set<string>()

  constructor() {
    this.platform = new TwitterPlatform()
    this.init()
  }

  private init() {
    // Process initial posts
    this.processExistingPosts()
    
    // Set up observer for new content
    this.platform.observeNewContent((newPosts) => {
      console.log(`Resist: Detected ${newPosts.length} new posts`)
      this.processPosts(newPosts)
    })
  }

  private processExistingPosts() {
    const posts = this.platform.detectPosts()
    console.log(`Resist: Found ${posts.length} existing posts on page`)
    this.processPosts(posts)
  }

  private processPosts(posts: PostElement[]) {
    posts.forEach(post => {
      if (!this.processedPosts.has(post.id)) {
        console.log(`[${post.id}] Processing new post`)
        this.processedPosts.add(post.id)
        this.addResistIconToPost(post)
      }
    })
  }

  private addResistIconToPost(post: PostElement) {
    console.log(`[${post.id}] Adding Resist icon`)
    
    // Add the Resist button directly (no longer need to pass icon)
    this.platform.addResistIcon(post)
    
    // TODO: Start classification process here
    // For now, we'll find the button and add event listeners
    setTimeout(() => {
      console.log(`[${post.id}] Classification complete, adding event listeners`)
      const resistButton = post.element.querySelector('.resist-btn') as HTMLElement
      
      if (resistButton) {
        // TODO: Add hover event for nutrition label
        resistButton.addEventListener('mouseenter', () => {
          this.showNutritionLabel(post, resistButton)
        })
        
        resistButton.addEventListener('mouseleave', () => {
          this.hideNutritionLabel()
        })
      }
      
    }, 100) // Short delay to ensure button is added
  }

  private showNutritionLabel(post: PostElement, icon: HTMLElement) {
    // TODO: Implement nutrition label display
    console.log(`[${post.id}] Show nutrition label for post`)
  }

  private hideNutritionLabel() {
    // TODO: Implement nutrition label hiding
    console.log('Hide nutrition label')
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ResistContentScript()
  })
} else {
  new ResistContentScript()
}

export {}
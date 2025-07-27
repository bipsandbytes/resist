import { TwitterPlatform } from './platforms/twitter'
import { PostElement } from './types'
import { ContentProcessor } from './content-processor'

console.log('Resist content script loaded')

export function ocrDone() {
  console.log('Resist: OCR done')
}

class ResistContentScript {
  private platform: TwitterPlatform
  private processor: ContentProcessor
  private processedPosts = new Set<string>()

  constructor() {
    this.platform = new TwitterPlatform()
    this.processor = new ContentProcessor(this.platform)
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

  private async addResistIconToPost(post: PostElement) {
    console.log(`[${post.id}] Adding Resist icon`)
    
    // Add the Resist button directly (no longer need to pass icon)
    this.platform.addResistIcon(post)
    
    // Start classification process here
    console.log(`[${post.id}] Starting classification process`)
    try {
      const analysis = await this.processor.processPost(post)
      
      if (analysis) {
        console.log(`[${post.id}] Classification complete:`, analysis.classification)
        
        // Find the button and add event listeners
        const resistButton = post.element.querySelector('.resist-btn') as HTMLElement
        
        if (resistButton) {
          // Add hover event for nutrition label
          resistButton.addEventListener('mouseenter', () => {
            this.showNutritionLabel(post, resistButton, analysis)
          })
          
          resistButton.addEventListener('mouseleave', () => {
            this.hideNutritionLabel()
          })
        }
      } else {
        console.error(`[${post.id}] Classification failed`)
      }
      
    } catch (error) {
      console.error(`[${post.id}] Classification error:`, error)
    }
  }

  private showNutritionLabel(post: PostElement, icon: HTMLElement, analysis: any) {
    // TODO: Implement nutrition label display
    console.log(`[${post.id}] Show nutrition label for post:`, analysis.classification)
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
import { TwitterPlatform } from './platforms/twitter'
import { PostElement } from './types'
import { ContentProcessor } from './content-processor'
import { postPersistence } from './post-persistence'

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

  private async init() {
    // Process initial posts
    await this.processExistingPosts()
    
    // Set up observer for new content
    this.platform.observeNewContent(async (newPosts) => {
      console.log(`Resist: Detected ${newPosts.length} new posts`)
      await this.processPosts(newPosts)
    })
  }

  private async processExistingPosts() {
    const posts = this.platform.detectPosts()
    console.log(`Resist: Found ${posts.length} existing posts on page`)
    await this.processPosts(posts)
  }

  private async processPosts(posts: PostElement[]) {
    for (const post of posts) {
      if (!this.processedPosts.has(post.id)) {
        console.log(`[${post.id}] Processing new post`)
        this.processedPosts.add(post.id)
        await this.addResistIconToPost(post)
      }
    }
  }

  private async addResistIconToPost(post: PostElement) {
    console.log(`[${post.id}] Adding Resist icon`)
    
    // Check if we have cached analysis first to potentially restore overlay state
    const cachedEntry = await postPersistence.getPost(post.id)
    
    // Add the Resist button (this handles checking for existing icons)
    await this.platform.addResistIcon(post)
    
    // If we have cached complete analysis, set up the overlay immediately
    if (cachedEntry?.state === 'complete' && cachedEntry.classification) {
      console.log(`[${post.id}] Found cached complete analysis, setting up overlay`)
      this.setupIconOverlay(post, cachedEntry.classification)
      return
    }
    
    // Otherwise, start classification process
    console.log(`[${post.id}] Starting classification process`)
    try {
      const analysis = await this.processor.processPost(post)
      
      if (analysis) {
        console.log(`[${post.id}] Classification complete:`, analysis.classification)
        this.setupIconOverlay(post, analysis.classification)
      } else {
        console.error(`[${post.id}] Classification failed`)
      }
      
    } catch (error) {
      console.error(`[${post.id}] Classification error:`, error)
    }
  }

  private setupIconOverlay(post: PostElement, classification: any) {
    // Find the button that was added
    const resistButton = post.element.querySelector('.resist-btn') as HTMLElement
    
    if (resistButton) {
      // Add hover event for nutrition label
      resistButton.addEventListener('mouseenter', () => {
        this.showNutritionLabel(post, resistButton, classification)
      })
      
      resistButton.addEventListener('mouseleave', () => {
        this.hideNutritionLabel()
      })
    }
  }

  private showNutritionLabel(post: PostElement, icon: HTMLElement, classification: any) {
    console.log(`[${post.id}] Show nutrition label for post:`, classification)
    // The overlay functionality is already handled in addResistIcon() in the platform
  }

  private hideNutritionLabel() {
    console.log('Hide nutrition label')
    // The overlay functionality is already handled in addResistIcon() in the platform
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
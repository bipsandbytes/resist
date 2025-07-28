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
      console.log(`[${post.id}] Processing post`)
      
      // Step A: Add icon (with built-in duplicate check)
      await this.platform.addResistIcon(post)
      
      // Step B: Start time tracking (with built-in duplicate/stale check)
      this.processor.startTimeTracking(post)
      
      // Step C: Process for classification
      await this.processor.processPost(post)
    }
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
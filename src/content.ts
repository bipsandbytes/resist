import { TwitterPlatform } from './platforms/twitter'
import { PostElement } from './types'
import { ContentProcessor } from './content-processor'
import { postPersistence } from './post-persistence'
import { storageManager } from './storage-manager'

// Debug imports
console.log('Resist: All imports loaded successfully')
console.log('Resist: ContentProcessor import:', typeof ContentProcessor)
console.log('Resist: TwitterPlatform import:', typeof TwitterPlatform)
console.log('Resist: storageManager import:', typeof storageManager)

console.log('Resist content script loaded')

function ocrDone(imageSrc: string, text: string, post_id: string) {
  console.log('Resist: OCR done for image:', imageSrc, 'Text length:', text.length, 'Post ID:', post_id)
}

// Make ocrDone available globally for the OCR script
;(window as any).ocrDone = ocrDone

class ResistContentScript {
  private platform: TwitterPlatform | null = null
  private processor: ContentProcessor | null = null

  constructor() {
    // Don't create components yet - wait for storage to be ready
    this.init()
  }

  private async init() {
    console.log('Resist: Starting initialization process...')
    
    // Initialize StorageManager first
    try {
      console.log('Resist: About to initialize StorageManager...')
      await storageManager.initialize()
      console.log('Resist: StorageManager initialized successfully')
    } catch (error) {
      console.error('Resist: Failed to initialize StorageManager:', error)
      // Continue without StorageManager - fall back to direct Chrome storage
    }
    
    // Now that storage is ready, create the components
    console.log('Resist: Storage ready, creating ContentProcessor...')
    console.log('Resist: About to call new ContentProcessor()...')
    try {
      this.processor = new ContentProcessor()
      console.log('Resist: ContentProcessor created successfully')
    } catch (error) {
      console.error('Resist: Failed to create ContentProcessor:', error)
      console.error('Resist: Error details:', error)
      console.error('Resist: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return // Don't continue if we can't create the processor
    }
    
    console.log('Resist: Creating TwitterPlatform...')
    try {
      this.platform = new TwitterPlatform(this.processor.timeTracker)
      console.log('Resist: TwitterPlatform created successfully')
    } catch (error) {
      console.error('Resist: Failed to create TwitterPlatform:', error)
      return // Don't continue if we can't create the platform
    }
    
    console.log('Resist: Setting up platform.processor relationship...')
    try {
      this.processor.platform = this.platform
      console.log('Resist: Platform.processor relationship established')
    } catch (error) {
      console.error('Resist: Failed to set up platform.processor relationship:', error)
      return
    }
    
    console.log('Resist: All components created successfully, processing existing posts...')
    
    // Process initial posts
    await this.processExistingPosts()
    
    // Set up observer for new content
    console.log('Resist: Setting up content observer...')
    if (this.platform) {
      this.platform.observeNewContent(async (newPosts) => {
        console.log(`Resist: Detected ${newPosts.length} new posts`)
        await this.processPosts(newPosts)
      })
      console.log('Resist: Content observer set up successfully')
    }
    
    console.log('Resist: Initialization process completed successfully!')
  }

  private async processExistingPosts() {
    if (!this.platform) {
      console.warn('Resist: Platform not initialized yet')
      return
    }
    
    const posts = this.platform.detectPosts()
    console.log(`Resist: Found ${posts.length} existing posts on page`)
    await this.processPosts(posts)
  }

  private async processPosts(posts: PostElement[]) {
    if (!this.platform || !this.processor) {
      console.warn('Resist: Components not initialized yet')
      return
    }
    
    for (const post of posts) {
      console.log(`[${post.id}] Processing post`)
      
      // Step A: Add icon (with built-in duplicate check)
      await this.platform.addResistIcon(post)
      
      // Step B: Start time tracking (with built-in duplicate/stale check)
      await this.processor.startTimeTracking(post)
      
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
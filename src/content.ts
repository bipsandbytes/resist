import { TwitterPlatform } from './platforms/twitter'
import { PostElement } from './types'
import { ContentProcessor } from './content-processor'
import { postPersistence } from './post-persistence'
import { storageManager } from './storage-manager'
import { logger } from './utils/logger'

// Debug imports
logger.debug('Resist: All imports loaded successfully')
logger.debug('Resist: ContentProcessor import:', typeof ContentProcessor)
logger.debug('Resist: TwitterPlatform import:', typeof TwitterPlatform)
logger.debug('Resist: storageManager import:', typeof storageManager)

logger.info('Resist content script loaded')

function ocrDone(imageSrc: string, text: string, post_id: string) {
  logger.info('Resist: OCR done for image:', imageSrc, 'Text length:', text.length, 'Post ID:', post_id)
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
    logger.info('Resist: Starting initialization process...')
    
    // Initialize StorageManager first
    try {
      logger.debug('Resist: About to initialize StorageManager...')
      await storageManager.initialize()
      logger.info('Resist: StorageManager initialized successfully')
    } catch (error) {
      logger.error('Resist: Failed to initialize StorageManager:', error)
      // Continue without StorageManager - fall back to direct Chrome storage
    }
    
    // Now that storage is ready, create the components
    logger.debug('Resist: Storage ready, creating ContentProcessor...')
    logger.debug('Resist: About to call new ContentProcessor()...')
    try {
      this.processor = new ContentProcessor()
      logger.info('Resist: ContentProcessor created successfully')
    } catch (error) {
      logger.error('Resist: Failed to create ContentProcessor:', error)
      logger.error('Resist: Error details:', error)
      logger.error('Resist: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return // Don't continue if we can't create the processor
    }
    
    logger.debug('Resist: Creating TwitterPlatform...')
    try {
      this.platform = new TwitterPlatform(this.processor.timeTracker)
      logger.info('Resist: TwitterPlatform created successfully')
    } catch (error) {
      logger.error('Resist: Failed to create TwitterPlatform:', error)
      return // Don't continue if we can't create the platform
    }
    
    logger.debug('Resist: Setting up platform.processor relationship...')
    try {
      this.processor.platform = this.platform
      logger.info('Resist: Platform.processor relationship established')
    } catch (error) {
      logger.error('Resist: Failed to set up platform.processor relationship:', error)
      return
    }
    
    logger.info('Resist: All components created successfully, processing existing posts...')
    
    // Process initial posts
    await this.processExistingPosts()
    
    // Set up observer for new content
    logger.debug('Resist: Setting up content observer...')
    if (this.platform) {
      this.platform.observeNewContent(async (newPosts) => {
        logger.info(`Resist: Detected ${newPosts.length} new posts`)
        await this.processPosts(newPosts)
      })
      logger.info('Resist: Content observer set up successfully')
    }
    
    logger.info('Resist: Initialization process completed successfully!')
  }

  private async processExistingPosts() {
    if (!this.platform) {
      logger.warn('Resist: Platform not initialized yet')
      return
    }
    
    const posts = this.platform.detectPosts()
    logger.info(`Resist: Found ${posts.length} existing posts on page`)
    await this.processPosts(posts)
  }

  private async processPosts(posts: PostElement[]) {
    if (!this.platform || !this.processor) {
      logger.warn('Resist: Components not initialized yet')
      return
    }
    
    for (const post of posts) {
      logger.info(`[${post.id}] Processing post`)
      
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
/**
 * OCR Analyzer - Progressive text recognition from images
 * 
 * Hooks into OCR worker messages to get real-time text recognition
 * as regions are processed, enabling immediate classification updates.
 */

import { MediaElement } from './types'

interface OCRProgressCallback {
  (postId: string, accumulatedText: string): void
}

export class OCRAnalyzer {
  private static instance: OCRAnalyzer | null = null
  private activeOCRSessions = new Map<string, OCRSession>()
  private messageListener: ((request: any, sender: any, sendResponse: any) => boolean) | null = null

  constructor() {
    console.log('[OCR] OCR analyzer initialized')
    this.setupMessageListener()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): OCRAnalyzer {
    if (!OCRAnalyzer.instance) {
      OCRAnalyzer.instance = new OCRAnalyzer()
    }
    return OCRAnalyzer.instance
  }

  /**
   * Start OCR analysis for images in a post
   */
  async analyzeImages(images: MediaElement[], postId: string, progressCallback?: OCRProgressCallback): Promise<string> {
    const logPrefix = `[${postId}]`
    
    if (!images || images.length === 0) {
      console.log(`${logPrefix} [OCR] No images to analyze`)
      return ''
    }

    console.log(`${logPrefix} [OCR] Starting OCR analysis for ${images.length} images`)

    // Create OCR session to track this post's progress
    const session: OCRSession = {
      postId,
      imageCount: images.length,
      recognizedRegions: new Map(),
      accumulatedText: '',
      progressCallback,
      startTime: Date.now()
    }

    this.activeOCRSessions.set(postId, session)

    try {
      // Start OCR processing for each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        await this.startImageOCR(image, postId, i + 1)
      }

      console.log(`${logPrefix} [OCR] Started OCR for all images`)
      return session.accumulatedText // Return current text (will be updated progressively)

    } catch (error) {
      console.error(`${logPrefix} [OCR] Failed to start OCR analysis:`, error)
      this.activeOCRSessions.delete(postId)
      return `[OCR analysis failed: ${error}]`
    }
  }

  /**
   * Start OCR for a single image
   */
  private async startImageOCR(image: MediaElement, postId: string, imageIndex: number): Promise<void> {
    const logPrefix = `[${postId}]`
    
    try {
      // Get image element
      const imageElement = this.getImageElement(image)
      if (!imageElement) {
        console.warn(`${logPrefix} [OCR] No image element found for image ${imageIndex}`)
        return
      }

      console.log(`${logPrefix} [OCR] Starting OCR for image ${imageIndex}:`, imageElement.src)

      // Call the existing OCR function
      // This is defined in the OCR script that's loaded globally
      // The OCR system will store the postId in images[imageId].tweetId
      if (typeof (window as any).ocr_image === 'function') {
        console.log(`${logPrefix} [OCR] Calling ocr_image function for image ${imageIndex}`)
        ;(window as any).ocr_image(imageElement, postId)
        console.log(`${logPrefix} [OCR] Started OCR for image ${imageIndex}, postId will be stored in OCR system`)
      } else {
        console.error(`${logPrefix} [OCR] ocr_image function not available`)
      }

    } catch (error) {
      console.error(`${logPrefix} [OCR] Failed to start OCR for image ${imageIndex}:`, error)
    }
  }

  /**
   * Get image element from MediaElement
   */
  private getImageElement(image: MediaElement): HTMLImageElement | null {
    // Try to get image element
    if (image.element instanceof HTMLImageElement) {
      return image.element
    }

    // If not an image element, try to find src and create one
    const src = image.src || image.element.getAttribute('src') || image.element.getAttribute('data-src')
    if (src) {
      const img = new Image()
      img.src = src
      img.crossOrigin = 'anonymous'
      return img
    }

    return null
  }


  /**
   * Set up message listener for OCR worker messages
   */
  private setupMessageListener(): void {
    if (this.messageListener) {
      return // Already set up
    }

    this.messageListener = (request: any, sender: any, sendResponse: any) => {
      // Filter for OCR recognition messages
      console.log('[OCR] Received Chrome extension message:', request?.type, request)
      if (request && request.type === 'recognized') {
        console.log('[OCR] Processing recognized message:', request)
        this.handleRecognizedMessage(request)
      }
      // Don't return true - let other listeners handle non-OCR messages
      return false
    }

    // Listen for messages from background script (OCR workers)
    chrome.runtime.onMessage.addListener(this.messageListener)
    
    console.log('[OCR] Chrome extension message listener set up for recognized events')
  }

  /**
   * Handle a recognized text message from OCR worker
   */
  private handleRecognizedMessage(data: any): void {
    try {
      console.log('[OCR] Received recognized message:', data)

      // Extract text from the message
      let recognizedText = data.text || ''
      
      // Parse if it's JSON (tesseract format)
      if (data.enc === 'tesseract' && recognizedText) {
        try {
          const parsed = JSON.parse(recognizedText)
          recognizedText = parsed.text || ''
        } catch (e) {
          console.warn('[OCR] Failed to parse tesseract JSON:', e)
        }
      }

      // Skip if no text or error
      if (!recognizedText || data.enc === 'error' || /^ERROR/i.test(recognizedText)) {
        console.log('[OCR] Skipping recognition due to error or empty text')
        return
      }

      console.log('[OCR] Extracted text from region:', recognizedText)

      // Find which post this image belongs to using the OCR system's built-in storage
      const imageId = data.id
      console.log(`[OCR] Looking up post ID for image ID: "${imageId}"`)
      
      // Access the global images object from the OCR system
      const images = (window as any).images
      if (!images || !images[imageId]) {
        console.warn(`[OCR] No image data found in OCR system for image ID: ${imageId}`)
        return
      }
      
      const postId = images[imageId].post_id
      if (!postId) {
        console.warn(`[OCR] No post_id found in image data for image ID: ${imageId}`)
        return
      }
      
      console.log(`[OCR] Found post ID "${postId}" for image ID "${imageId}"`)
      
      // Find the specific session for this post
      const session = this.activeOCRSessions.get(postId)
      if (!session) {
        console.warn(`[OCR] No active session found for post: ${postId}`)
        return
      }
      
      console.log(`[OCR] Routing recognized text to post: ${postId}`)
      this.updateSessionWithRecognizedText(session, data.reg_id || Date.now().toString(), recognizedText)

    } catch (error) {
      console.error('[OCR] Error handling recognized message:', error)
    }
  }

  /**
   * Update an OCR session with newly recognized text
   */
  private updateSessionWithRecognizedText(session: OCRSession, regionId: string, text: string): void {
    const logPrefix = `[${session.postId}]`
    
    // Store this region's text
    session.recognizedRegions.set(regionId, text)
    
    // Rebuild accumulated text from all regions
    const allTexts = Array.from(session.recognizedRegions.values())
    session.accumulatedText = allTexts.join(' ').trim()
    
    console.log(`${logPrefix} [OCR] Updated accumulated text: "${session.accumulatedText}"`)
    
    // Notify progress callback if provided
    if (session.progressCallback) {
      session.progressCallback(session.postId, session.accumulatedText)
    }
  }

  /**
   * Get current accumulated text for a post
   */
  getAccumulatedText(postId: string): string {
    const session = this.activeOCRSessions.get(postId)
    return session ? session.accumulatedText : ''
  }

  /**
   * Clean up OCR session (call when post processing is complete)
   */
  cleanup(postId: string): void {
    this.activeOCRSessions.delete(postId)
    console.log(`[${postId}] [OCR] Cleaned up OCR session`)
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    if (this.messageListener) {
      chrome.runtime.onMessage.removeListener(this.messageListener)
      this.messageListener = null
    }
    
    this.activeOCRSessions.clear()
    console.log('[OCR] OCR analyzer disposed')
  }
}

interface OCRSession {
  postId: string
  imageCount: number
  recognizedRegions: Map<string, string>
  accumulatedText: string
  progressCallback?: OCRProgressCallback
  startTime: number
}
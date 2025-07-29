/**
 * Image Analyzer - Client for background script image captioning
 * 
 * Communicates with background script to get ML-powered image descriptions.
 * These descriptions are added to accumulated text for classification.
 */

import { MediaElement } from './types'

interface ImageAnalysisRequest {
  id: string
  images: Array<{ url: string, index: number }>
  type: 'ANALYZE_IMAGES'
}

interface ImageAnalysisResponse {
  id: string
  result?: string
  error?: string
  type: 'IMAGE_ANALYSIS_RESULT'
}

export class ImageAnalyzer {
  private requestCounter = 0

  constructor() {
    console.log('[Content] Background image captioning client initialized')
  }

  async analyzeImages(images: MediaElement[], postId: string): Promise<string> {
    const logPrefix = `[${postId}]`
    
    if (!images || images.length === 0) {
      console.log(`${logPrefix} No images to analyze`)
      return ''
    }

    try {
      // Extract image URLs for message passing
      const imageUrls = this.extractImageUrls(images, postId)
      
      if (imageUrls.length === 0) {
        console.log(`${logPrefix} No valid images found`)
        return ''
      }

      return new Promise((resolve, reject) => {
        const id = `img_req_${++this.requestCounter}_${Date.now()}`
        
        const request: ImageAnalysisRequest = {
          id,
          images: imageUrls,
          type: 'ANALYZE_IMAGES'
        }

        if (typeof chrome !== 'undefined' && chrome.runtime) {
          console.log(`${logPrefix} Sending image analysis request:`, id, `${imageUrls.length} images`)
          
          chrome.runtime.sendMessage(request, (response: ImageAnalysisResponse) => {
            if (chrome.runtime.lastError) {
              console.error(`${logPrefix} Message send error:`, chrome.runtime.lastError.message)
              reject(new Error(chrome.runtime.lastError.message))
              return
            }

            if (response.error) {
              console.error(`${logPrefix} Image analysis error:`, response.error)
              reject(new Error(response.error))
            } else if (response.result !== undefined) {
              console.log(`${logPrefix} Image analysis success for request:`, id)
              console.log(`${logPrefix} Image analysis result for image:`, imageUrls, response.result)
              resolve(response.result)
            } else {
              reject(new Error('No result received from background script'))
            }
          })
        } else {
          // Fallback for environments without chrome.runtime
          reject(new Error('Chrome runtime not available'))
        }

        // Timeout after 60 seconds (image processing can take longer than text)
        setTimeout(() => {
          reject(new Error('Image analysis request timeout'))
        }, 60000)
      })

    } catch (error) {
      console.error(`${logPrefix} Image analysis client error:`, error)
      return `[Image analysis failed: ${error}]`
    }
  }

  /**
   * Extract image URLs from MediaElement objects for message passing
   */
  private extractImageUrls(images: MediaElement[], postId: string): Array<{ url: string, index: number }> {
    const logPrefix = `[${postId}]`
    const imageUrls: Array<{ url: string, index: number }> = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      try {
        const imageUrl = this.getImageUrl(image)
        if (imageUrl) {
          imageUrls.push({ url: imageUrl, index: i + 1 })
        } else {
          console.warn(`${logPrefix} No URL found for image ${i + 1}`)
        }
      } catch (error) {
        console.error(`${logPrefix} Failed to extract URL for image ${i + 1}:`, error)
        // Continue with other images
      }
    }

    console.log(`${logPrefix} Extracted ${imageUrls.length}/${images.length} image URLs`)
    return imageUrls
  }

  /**
   * Get image URL from MediaElement and optimize for ML processing
   */
  private getImageUrl(image: MediaElement): string | null {
    // Try multiple sources for image URL
    let imageUrl: string | null = null
    
    if (image.src) {
      imageUrl = image.src
    } else {
      // Check element attributes
      const element = image.element
      if (element instanceof HTMLImageElement) {
        imageUrl = element.src || element.currentSrc
      } else {
        // Check data attributes
        const dataSrc = element.getAttribute('data-src')
        if (dataSrc) {
          imageUrl = dataSrc
        }
      }
    }

    // Optimize URL for smaller image size
    if (imageUrl) {
      const originalUrl = imageUrl
      imageUrl = this.optimizeImageUrl(imageUrl)
      
      // Log optimization if URL changed
      if (originalUrl !== imageUrl) {
        console.log(`[Image URL optimized] ${originalUrl} → ${imageUrl}`)
      }
    }

    return imageUrl
  }

  /**
   * Convert image URL to use smaller version for faster ML processing
   */
  private optimizeImageUrl(url: string): string {
    try {
      // Parse URL to manipulate query parameters
      const urlObj = new URL(url)
      
      // Twitter/X image optimizations
      if (urlObj.hostname.includes('twimg.com') || urlObj.hostname.includes('x.com')) {
        // Twitter uses format= parameter for size
        // Convert large formats to small
        if (urlObj.searchParams.has('format')) {
          urlObj.searchParams.set('name', 'small')  // Twitter uses 'name' for size
        }
        
        // Also check for 'name' parameter directly
        if (urlObj.searchParams.has('name')) {
          const currentName = urlObj.searchParams.get('name')
          if (currentName === 'large' || currentName === 'medium' || currentName === 'orig') {
            urlObj.searchParams.set('name', 'small')
          }
        }
      }
      
      // Generic optimizations for other platforms
      // Convert common large size parameters to small
      const sizeParams = ['size', 'width', 'height', 'quality', 'scale']
      sizeParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          const value = urlObj.searchParams.get(param)
          if (value === 'large' || value === 'big' || value === 'full' || value === 'original') {
            urlObj.searchParams.set(param, 'small')
          }
        }
      })
      
      // Add small size hint if no size parameter exists
      if (!urlObj.searchParams.has('name') && !urlObj.searchParams.has('size')) {
        if (urlObj.hostname.includes('twimg.com') || urlObj.hostname.includes('x.com')) {
          urlObj.searchParams.set('name', 'small')
        }
      }

      return urlObj.toString()
      
    } catch (error) {
      // If URL parsing fails, return original URL
      console.warn('Failed to optimize image URL:', error)
      return url
    }
  }

}


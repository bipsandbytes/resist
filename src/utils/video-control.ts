/**
 * Video Control Utility
 * 
 * Provides functions to control video playback and autoplay behavior
 * when posts are screened or filtered.
 */

import { logger } from './logger'

export interface VideoControlOptions {
  pauseVideos?: boolean
  disableAutoplay?: boolean
  muteVideos?: boolean
}

/**
 * Control all videos within a post element
 */
export function controlPostVideos(
  postElement: HTMLElement, 
  postId: string,
  options: VideoControlOptions = {}
): void {
  logger.debug(`[${postId}] [VideoControl] [DEBUG] Function called with postElement:`, postElement)
  logger.debug(`[${postId}] [VideoControl] [DEBUG] postElement type:`, typeof postElement)
  logger.debug(`[${postId}] [VideoControl] [DEBUG] postElement tagName:`, postElement.tagName)
  logger.debug(`[${postId}] [VideoControl] [DEBUG] postElement classList:`, postElement.classList.toString())
  
  const {
    pauseVideos = true,
    disableAutoplay = true,
    muteVideos = false
  } = options

  logger.debug(`[${postId}] [VideoControl] [DEBUG] Options:`, { pauseVideos, disableAutoplay, muteVideos })

  try {
    // Find all video elements within the post
    logger.debug(`[${postId}] [VideoControl] [DEBUG] About to query for video elements`)
    const videos = postElement.querySelectorAll('video')
    logger.debug(`[${postId}] [VideoControl] [DEBUG] querySelectorAll result:`, videos)
    logger.debug(`[${postId}] [VideoControl] [DEBUG] videos.length:`, videos.length)
    logger.debug(`[${postId}] [VideoControl] [DEBUG] videos NodeList:`, Array.from(videos).map(v => ({ tagName: v.tagName, src: v.src, paused: v.paused })))
    
    logger.info(`[${postId}] [VideoControl] Found ${videos.length} video elements in post`)

    // Control HTML5 videos
    videos.forEach((video, index) => {
      try {
        logger.debug(`[${postId}] [VideoControl] [DEBUG] Processing video ${index + 1}:`, { tagName: video.tagName, src: video.src, paused: video.paused, autoplay: video.autoplay })
        
        if (pauseVideos && !video.paused) {
          video.pause()
          logger.debug(`[${postId}] [VideoControl] Paused video ${index + 1}`)
        } else {
          logger.debug(`[${postId}] [VideoControl] [DEBUG] Video ${index + 1} not paused (pauseVideos: ${pauseVideos}, video.paused: ${video.paused})`)
        }
        
        if (disableAutoplay) {
          video.autoplay = false
          video.removeAttribute('autoplay')
          logger.debug(`[${postId}] [VideoControl] Disabled autoplay for video ${index + 1}`)
        }
        
        if (muteVideos) {
          video.muted = true
          video.volume = 0
          logger.debug(`[${postId}] [VideoControl] Muted video ${index + 1}`)
        }
        
        // Remove any autoplay-related attributes
        video.removeAttribute('autoplay')
        video.removeAttribute('muted')
        video.removeAttribute('loop')
        
        logger.debug(`[${postId}] [VideoControl] [DEBUG] Video ${index + 1} after processing:`, { autoplay: video.autoplay, muted: video.muted, paused: video.paused })
        
      } catch (error) {
        logger.warn(`[${postId}] [VideoControl] Failed to control video ${index + 1}:`, error)
      }
    })

    // Also check for any elements with autoplay attributes
    logger.debug(`[${postId}] [VideoControl] [DEBUG] About to query for autoplay elements`)
    const autoplayElements = postElement.querySelectorAll('[autoplay]')
    logger.debug(`[${postId}] [VideoControl] [DEBUG] autoplayElements found:`, autoplayElements.length)
    
    autoplayElements.forEach((element, index) => {
      try {
        logger.debug(`[${postId}] [VideoControl] [DEBUG] Processing autoplay element ${index + 1}:`, { tagName: element.tagName, autoplay: element.getAttribute('autoplay') })
        element.removeAttribute('autoplay')
        logger.debug(`[${postId}] [VideoControl] Removed autoplay attribute from element ${index + 1}`)
      } catch (error) {
        logger.warn(`[${postId}] [VideoControl] Failed to remove autoplay from element ${index + 1}:`, error)
      }
    })

    logger.info(`[${postId}] [VideoControl] Successfully controlled ${videos.length} video elements in post`)
    
  } catch (error) {
    logger.error(`[${postId}] [VideoControl] Failed to control post videos:`, error)
    logger.error(`[${postId}] [VideoControl] [DEBUG] Error details:`, error)
    if (error instanceof Error) {
      logger.error(`[${postId}] [VideoControl] [DEBUG] Error stack:`, error.stack)
    }
  }
}

/**
 * Restore video playback for a post (when unscreening)
 */
export function restorePostVideos(postElement: HTMLElement, postId: string): void {
  try {
    const videos = postElement.querySelectorAll('video')
    logger.info(`[${postId}] [VideoControl] Restoring ${videos.length} videos in post`)
    
    videos.forEach((video, index) => {
      try {
        // Note: We don't automatically resume videos as this could be disruptive
        // Users can manually resume if they want
        logger.debug(`[${postId}] [VideoControl] Video ${index + 1} ready for manual resume`)
      } catch (error) {
        logger.warn(`[${postId}] [VideoControl] Failed to restore video ${index + 1}:`, error)
      }
    })
    
    logger.info(`[${postId}] [VideoControl] Successfully restored video controls for post`)
    
  } catch (error) {
    logger.error(`[${postId}] [VideoControl] Failed to restore post videos:`, error)
  }
}

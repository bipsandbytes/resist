/**
 * Task-Based Text Aggregation System
 * 
 * Manages multiple asynchronous text extraction tasks for each post.
 * As tasks complete, text is accumulated and classification is updated.
 */

import { SocialMediaPlatform, PostElement, PostContent } from './types'
import { ImageAnalyzer } from './image-analyzer'
import { OCRAnalyzer } from './ocr-analyzer'
import { settingsManager, IngredientCategories } from './settings'
import { ClassificationResult, CategoryData } from './classification'
import { postPersistence } from './post-persistence'
import { logger } from './utils/logger'

export interface Task {
  id: string                                    // Unique task identifier
  type: string                                 // Task type ('post-text', 'mock-task', 'ocr', etc.)
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string                              // Text result when completed (or JSON string for classification)
  resultType?: 'text' | 'classification'      // Type of result this task returns
  error?: string                               // Error message if failed
  startedAt?: number                           // Timestamp when started
  completedAt?: number                         // Timestamp when completed
}

export interface TaskCompletionHandler {
  (postId: string, task: Task, accumulatedText: string): Promise<void>
}

export class TaskManager {
  private tasks = new Map<string, Task[]>()        // postId -> Task[]
  private completionHandler?: TaskCompletionHandler

  constructor(completionHandler?: TaskCompletionHandler) {
    this.completionHandler = completionHandler
  }

  /**
   * Initialize task queue for a post
   */
  initializeTasksForPost(postId: string, platform: SocialMediaPlatform, post: PostElement): void {
    logger.info(`[${postId}] [TaskManager] Initializing task queue`)
    
    const tasks: Task[] = [
      {
        id: `${postId}-post-text`,
        type: 'post-text',
        status: 'pending',
        resultType: 'text'
      },/*
      {
        id: `${postId}-mock-task`,
        type: 'mock-task', 
        status: 'pending',
        resultType: 'text'
      },*/
      {
        id: `${postId}-image-description`,
        type: 'image-description',
        status: 'pending',
        resultType: 'text'
      },
      /* Disable OCR for now — too resource intensive
      {
        id: `${postId}-ocr`,
        type: 'ocr',
        status: 'pending',
        resultType: 'text'
      },*/
      {
        id: `${postId}-remote-analysis`,
        type: 'remote-analysis',
        status: 'pending',
        resultType: 'classification'
      }
    ]

    this.tasks.set(postId, tasks)
    
    // Start all tasks immediately
    this.startAllTasks(postId, platform, post)
  }

  /**
   * Start all pending tasks for a post
   */
  private async startAllTasks(postId: string, platform: SocialMediaPlatform, post: PostElement): Promise<void> {
    const tasks = this.tasks.get(postId) || []
    
    for (const task of tasks) {
      if (task.status === 'pending') {
        this.startTask(postId, task, platform, post)
      }
    }
  }

  /**
   * Start a specific task
   */
  private async startTask(postId: string, task: Task, platform: SocialMediaPlatform, post: PostElement): Promise<void> {
    logger.info(`[${postId}] [TaskManager] Starting task: ${task.type}`)
    
    task.status = 'running'
    task.startedAt = Date.now()

    try {
      let result: string

      switch (task.type) {
        case 'post-text':
          result = await this.executePostTextTask(platform, post)
          break
        case 'mock-task':
          result = await this.executeMockTask()
          break
        case 'image-description':
          result = await this.executeImageDescriptionTask(platform, post, postId)
          break
        case 'ocr':
          result = await this.executeOCRTask(platform, post, postId)
          break
        case 'remote-analysis':
          result = await this.executeRemoteAnalysisTask(platform, post, postId)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      // Task completed successfully
      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      
      logger.info(`[${postId}] [TaskManager] Task completed: ${task.type} -> "${result}"`)

      // Notify completion handler
      if (this.completionHandler) {
        const accumulatedText = this.getAccumulatedText(postId)
        await this.completionHandler(postId, task, accumulatedText)
      }

    } catch (error) {
      // Task failed
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = Date.now()
      
      logger.error(`[${postId}] [TaskManager] Task failed: ${task.type} ->`, error)
    }
  }

  /**
   * Execute post text extraction task
   */
  private async executePostTextTask(platform: SocialMediaPlatform, post: PostElement): Promise<string> {
    const content = platform.extractPostContent(post)
    return content.text || ''
  }

  /**
   * Execute mock task (returns 'hello world' after random delay)
   */
  private async executeMockTask(): Promise<string> {
    const delayMs = Math.floor(Math.random() * 4000) + 1000 // 1-5 seconds
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('education school essay homework learning')
      }, delayMs)
    })
  }

  /**
   * Execute image description task using ML model
   */
  private async executeImageDescriptionTask(platform: SocialMediaPlatform, post: PostElement, postId: string): Promise<string> {
    // wait for 5 seconds to check if the remote analysis returns results
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check if post classification is already complete
    if (await postPersistence.hasCompleteAnalysis(postId)) {
      logger.info(`[${postId}] [TaskManager] Post classification already complete, skipping Image Description task`)
      return ''
    }

    try {
      // Extract images from the post
      const mediaElements = platform.extractMediaElements(post)
      const images = mediaElements.filter(media => media.type === 'image')
      
      if (images.length === 0) {
        logger.info(`[${postId}] [TaskManager] No images found in post`)
        return ''
      }

      logger.info(`[${postId}] [TaskManager] Found ${images.length} images, starting ML analysis`)
      
      // Use ImageAnalyzer to get descriptions
      const imageAnalyzer = new ImageAnalyzer()
      const descriptions = await imageAnalyzer.analyzeImages(images, postId)
      
      return descriptions

    } catch (error) {
      logger.error(`[${postId}] [TaskManager] Image description task failed:`, error)
      throw error
    }
  }

  /**
   * Execute OCR task - extract text from images using OCR
   */
  private async executeOCRTask(platform: SocialMediaPlatform, post: PostElement, postId: string): Promise<string> {
    // wait for 5 seconds to check if the remote analysis returns results
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Check if post classification is already complete
    if (await postPersistence.hasCompleteAnalysis(postId)) {
      logger.info(`[${postId}] [TaskManager] Post classification already complete, skipping OCR task`)
      return ''
    }
    
    try {
      // Extract images from the post
      const mediaElements = platform.extractMediaElements(post)
      const images = mediaElements.filter(media => media.type === 'image')
      
      if (images.length === 0) {
        logger.info(`[${postId}] [TaskManager] No images found for OCR`)
        return ''
      }

      logger.info(`[${postId}] [TaskManager] Found ${images.length} images, starting OCR analysis`)
      
      // Use OCRAnalyzer to get text from images
      const ocrAnalyzer = OCRAnalyzer.getInstance()
      
      // Set up progress callback to update task progressively
      const progressCallback = (postId: string, accumulatedText: string) => {
        // Update the task's result immediately
        const tasks = this.tasks.get(postId)
        if (tasks) {
          const ocrTask = tasks.find(t => t.type === 'ocr')
          if (ocrTask && ocrTask.status === 'running') {
            ocrTask.result = accumulatedText
            logger.info(`[${postId}] [TaskManager] OCR progress update: "${accumulatedText}"`)
            
            // Trigger completion handler with current progress
            if (this.completionHandler) {
              const fullAccumulatedText = this.getAccumulatedText(postId)
              this.completionHandler(postId, ocrTask, fullAccumulatedText)
            }
          }
        }
      }
      
      const ocrText = await ocrAnalyzer.analyzeImages(images, postId, progressCallback)
      
      return ocrText

    } catch (error) {
      logger.error(`[${postId}] [TaskManager] OCR task failed:`, error)
      throw error
    }
  }

  /**
   * Execute remote analysis task - send post to remote server for analysis
   */
  private async executeRemoteAnalysisTask(platform: SocialMediaPlatform, post: PostElement, postId: string): Promise<string> {
    try {
      logger.info(`[${postId}] [TaskManager] Starting remote analysis task`)
      
      // Extract post content using platform methods
      const postContent = platform.extractPostContent(post)
      
      // Prepare content payload for the API
      const contentPayload = this.prepareContentPayload(postContent)
      
      const result = await this.analyzeContent(contentPayload, postId)
      logger.info(`[${postId}] [TaskManager] Remote analysis completed`)
      
      return result

    } catch (error) {
      logger.error(`[${postId}] [TaskManager] Remote analysis task failed:`, error)
      throw error
    }
  }

  /**
   * Analyze content using remote server with retry mechanism
   */
  private async analyzeContent(contentPayload: any, postId: string): Promise<string> {
    try {
      logger.info(`[${postId}] [TaskManager] Sending content to remote server...`)
      
      const fetchUrl = `https://api.resist-extension.org/api/analyze?content=${encodeURIComponent(JSON.stringify(contentPayload))}`  
      logger.debug(`[${postId}] [TaskManager] Sending request to remote server: ${fetchUrl.substring(0, 150)}...`)
      const response = await fetch(
        fetchUrl
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'completed') {
        // Got results immediately (from cache)
        logger.info(`[${postId}] [TaskManager] Remote analysis completed immediately`)
        const classification = data.classification || data.result
        if (classification) {
          logger.debug(`[${postId}] [TaskManager] Raw classification`, classification)
          return JSON.stringify(classification)
        } else {
          logger.warn(`[${postId}] [TaskManager] Remote analysis completed but no classification data received, using default`)
          const defaultClassification = await this.createDefaultClassification()
          return JSON.stringify(defaultClassification)
        }
      }

      if (data.status === 'processing') {
        // Need to wait and retry
        const retryAfter = data.retry_after || 5 // Default 5 seconds if not specified
        logger.info(`[${postId}] [TaskManager] Waiting ${retryAfter} seconds for remote processing...`)
        
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        return this.analyzeContent(contentPayload, postId) // Retry same call
      }

      // Handle other statuses
      if (data.status === 'error') {
        throw new Error(data.message || 'Remote analysis failed')
      }

      // Unknown status
      throw new Error(`Unknown status from remote server: ${data.status}`)

    } catch (error) {
      logger.error(`[${postId}] [TaskManager] Remote analysis failed:`, error)
      
      // Throw the error so the task fails properly - we don't want to continue
      // with empty classification data
      throw error
    }
  }

  /**
   * Prepare content payload for remote analysis API
   */
  private prepareContentPayload(postContent: PostContent): any {
    // Combine author name and post text, and truncate to 100 characters
    const text = `${postContent.authorName}: ${postContent.text}`.substring(0, 1000)
    
    // Extract media URLs from media elements
    const media_elements = postContent.mediaElements
      .map(media => media.src)
      .filter(src => src !== undefined && src !== null && src !== '') as string[]
    
    return {
      text,
      media_elements
    }
  }

  /**
   * Get accumulated text from all completed tasks (excludes classification tasks)
   */
  getAccumulatedText(postId: string): string {
    const tasks = this.tasks.get(postId) || []
    const completedTexts = tasks
      .filter(task => 
        task.status === 'completed' && 
        task.result && 
        task.resultType === 'text'
      )
      .map(task => task.result!)
    
    return completedTexts.join(' ').trim()
  }

  /**
   * Get task statistics for a post
   */
  getTaskStats(postId: string): { total: number, pending: number, running: number, completed: number, failed: number } {
    const tasks = this.tasks.get(postId) || []
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length
    }
  }

  /**
   * Get all tasks for a post
   */
  getTasks(postId: string): Task[] {
    return this.tasks.get(postId) || []
  }

  /**
   * Check if all tasks are completed for a post
   */
  areAllTasksCompleted(postId: string): boolean {
    const tasks = this.tasks.get(postId) || []
    return tasks.length > 0 && tasks.every(task => task.status === 'completed' || task.status === 'failed')
  }

  /**
   * Check if remote-analysis task has completed successfully
   */
  hasRemoteAnalysisCompleted(postId: string): boolean {
    const tasks = this.tasks.get(postId) || []
    const remoteAnalysisTask = tasks.find(task => task.type === 'remote-analysis')
    return remoteAnalysisTask?.status === 'completed'
  }

  /**
   * Check if remote-analysis task is pending for a post
   */
  hasRemoteAnalysisPending(postId: string, tasksOverride?: Task[]): boolean {
    // Use provided tasks if available, otherwise fall back to in-memory tasks
    const tasks = tasksOverride || this.tasks.get(postId) || []
    const remoteAnalysisTask = tasks.find(task => task.type === 'remote-analysis')
    return remoteAnalysisTask?.status === 'pending' || remoteAnalysisTask?.status === 'running'
  }

  /**
   * Get the classification result from the most recent completed remote-analysis task
   */
  getRemoteAnalysisResult(postId: string): any | null {
    const tasks = this.tasks.get(postId) || []
    
    // Find all completed remote analysis tasks
    const completedRemoteTasks = tasks.filter(task => 
      task.type === 'remote-analysis' && 
      task.status === 'completed' && 
      task.result
    )
    
    if (completedRemoteTasks.length === 0) {
      return null
    }
    
    // Sort by completedAt timestamp (most recent first) and get the most recent one
    const mostRecentTask = completedRemoteTasks.sort((a, b) => 
      (b.completedAt || 0) - (a.completedAt || 0)
    )[0]
    
    if (mostRecentTask?.result) {
      try {
        logger.info(`[${postId}] [TaskManager] Using most recent remote analysis result from task completed at ${new Date(mostRecentTask.completedAt || 0).toISOString()}`)
        logger.debug(`[${postId}] [TaskManager] Found ${completedRemoteTasks.length} completed remote analysis tasks total`)
        if (completedRemoteTasks.length > 1) {
          logger.debug(`[${postId}] [TaskManager] Multiple remote analysis tasks completed, ensuring most recent result is used`)
          completedRemoteTasks.forEach((task, index) => {
            logger.debug(`[${postId}] [TaskManager] Task ${index + 1}: completed at ${new Date(task.completedAt || 0).toISOString()}, result: ${task.result?.substring(0, 100)}...`)
          })
        }
        return JSON.parse(mostRecentTask.result)
      } catch (error) {
        logger.error(`[${postId}] Failed to parse remote analysis result:`, error)
        return null
      }
    }
    
    return null
  }

  /**
   * Add another remote-analysis task for a post (special case when one is already pending)
   */
  addRemoteAnalysisTask(postId: string, platform: SocialMediaPlatform, post: PostElement): void {
    const existingTasks = this.tasks.get(postId) || []
    
    // Create a new remote-analysis task with a unique ID
    const newTask: Task = {
      id: `${postId}-remote-analysis-${Date.now()}`,
      type: 'remote-analysis',
      status: 'pending',
      resultType: 'classification'
    }
    
    // Add the new task to the existing tasks
    existingTasks.push(newTask)
    this.tasks.set(postId, existingTasks)
    
    logger.info(`[${postId}] [TaskManager] Added additional remote-analysis task`)
    
    // Start the new task immediately
    this.startTask(postId, newTask, platform, post)
  }

  /**
   * Create a default classification result with all scores set to 0
   * Uses current ingredient categories from settings
   */
  private async createDefaultClassification(): Promise<ClassificationResult> {
    try {
      const ingredientCategories = await settingsManager.getIngredientCategories()
      const categories: { [categoryName: string]: CategoryData } = {}
      
      // Create each category with its subcategories, all scores set to 0
      for (const [categoryName, subcategoryNames] of Object.entries(ingredientCategories)) {
        const subcategories: { [subcategoryName: string]: { score: number } } = {}
        
        // Create each subcategory with score 0
        for (const subcategoryName of subcategoryNames) {
          subcategories[subcategoryName] = { score: 0 }
        }
        
        categories[categoryName] = {
          subcategories,
          totalScore: 0
        }
      }

      const result: ClassificationResult = {
        ...categories
      }
      ;(result as any).totalAttentionScore = 0
      return result
    } catch (error) {
      logger.error('Failed to create default classification:', error)
      // Fallback to minimal structure if settings fail
      const fallbackResult: ClassificationResult = {}
      ;(fallbackResult as any).totalAttentionScore = 0
      return fallbackResult
    }
  }

  /**
   * Clean up tasks for a post (when post is removed)
   */
  cleanupPost(postId: string): void {
    logger.info(`[${postId}] [TaskManager] Cleaning up tasks`)
    this.tasks.delete(postId)
  }
}
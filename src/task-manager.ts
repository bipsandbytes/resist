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
import { ClassificationResult, CategoryScore, SubcategoryScore } from './post-persistence'

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
    console.log(`[${postId}] [TaskManager] Initializing task queue`)
    
    const tasks: Task[] = [
      /*
      {
        id: `${postId}-post-text`,
        type: 'post-text',
        status: 'pending',
        resultType: 'text'
      },*/
      {
        id: `${postId}-mock-task`,
        type: 'mock-task', 
        status: 'pending',
        resultType: 'text'
      },/*
      {
        id: `${postId}-image-description`,
        type: 'image-description',
        status: 'pending',
        resultType: 'text'
      },
      {
        id: `${postId}-ocr`,
        type: 'ocr',
        status: 'pending',
        resultType: 'text'
      },
      {
        id: `${postId}-remote-analysis`,
        type: 'remote-analysis',
        status: 'pending',
        resultType: 'classification'
      }*/
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
    console.log(`[${postId}] [TaskManager] Starting task: ${task.type}`)
    
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
      
      console.log(`[${postId}] [TaskManager] Task completed: ${task.type} -> "${result}"`)

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
      
      console.error(`[${postId}] [TaskManager] Task failed: ${task.type} ->`, error)
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
    try {
      // Extract images from the post
      const mediaElements = platform.extractMediaElements(post)
      const images = mediaElements.filter(media => media.type === 'image')
      
      if (images.length === 0) {
        console.log(`[${postId}] [TaskManager] No images found in post`)
        return ''
      }

      console.log(`[${postId}] [TaskManager] Found ${images.length} images, starting ML analysis`)
      
      // Use ImageAnalyzer to get descriptions
      const imageAnalyzer = new ImageAnalyzer()
      const descriptions = await imageAnalyzer.analyzeImages(images, postId)
      
      return descriptions

    } catch (error) {
      console.error(`[${postId}] [TaskManager] Image description task failed:`, error)
      throw error
    }
  }

  /**
   * Execute OCR task - extract text from images using OCR
   */
  private async executeOCRTask(platform: SocialMediaPlatform, post: PostElement, postId: string): Promise<string> {
    try {
      // Extract images from the post
      const mediaElements = platform.extractMediaElements(post)
      const images = mediaElements.filter(media => media.type === 'image')
      
      if (images.length === 0) {
        console.log(`[${postId}] [TaskManager] No images found for OCR`)
        return ''
      }

      console.log(`[${postId}] [TaskManager] Found ${images.length} images, starting OCR analysis`)
      
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
            console.log(`[${postId}] [TaskManager] OCR progress update: "${accumulatedText}"`)
            
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
      console.error(`[${postId}] [TaskManager] OCR task failed:`, error)
      throw error
    }
  }

  /**
   * Execute remote analysis task - send post to remote server for analysis
   */
  private async executeRemoteAnalysisTask(platform: SocialMediaPlatform, post: PostElement, postId: string): Promise<string> {
    try {
      console.log(`[${postId}] [TaskManager] Starting remote analysis task`)
      
      // Extract post content using platform methods
      const postContent = platform.extractPostContent(post)
      
      // Prepare content payload for the API
      const contentPayload = this.prepareContentPayload(postContent)
      
      const result = await this.analyzeContent(contentPayload, postId)
      console.log(`[${postId}] [TaskManager] Remote analysis completed`)
      
      return result

    } catch (error) {
      console.error(`[${postId}] [TaskManager] Remote analysis task failed:`, error)
      throw error
    }
  }

  /**
   * Analyze content using remote server with retry mechanism
   */
  private async analyzeContent(contentPayload: any, postId: string): Promise<string> {
    try {
      console.log(`[${postId}] [TaskManager] Sending content to remote server...`)
      
      const fetchUrl = `https://d2fu55o6hgtd0l.cloudfront.net/api/analyze?content=${encodeURIComponent(JSON.stringify(contentPayload))}`  
      console.log(`[${postId}] [TaskManager] Sending request to remote server: ${fetchUrl.substring(0, 150)}...`)
      const response = await fetch(
        fetchUrl
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'completed') {
        // Got results immediately (from cache)
        console.log(`[${postId}] [TaskManager] Remote analysis completed immediately`)
        const classification = data.classification || data.result
        if (classification) {
          console.log(`[${postId}] [TaskManager] Raw classification`, classification)
          return JSON.stringify(classification)
        } else {
          console.warn(`[${postId}] [TaskManager] Remote analysis completed but no classification data received, using default`)
          const defaultClassification = await this.createDefaultClassification()
          return JSON.stringify(defaultClassification)
        }
      }

      if (data.status === 'processing') {
        // Need to wait and retry
        const retryAfter = data.retry_after || 5 // Default 5 seconds if not specified
        console.log(`[${postId}] [TaskManager] Waiting ${retryAfter} seconds for remote processing...`)
        
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
      console.error(`[${postId}] [TaskManager] Remote analysis failed:`, error)
      
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
    const text = `${postContent.authorName}: ${postContent.text}`.substring(0, 100)
    
    // Extract media URLs from media elements
    const media_elements = postContent.mediaElements
      .map(media => media.src)
      .filter(src => src !== undefined) as string[]
    
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
   * Get the classification result from completed remote-analysis task
   */
  getRemoteAnalysisResult(postId: string): any | null {
    const tasks = this.tasks.get(postId) || []
    const remoteAnalysisTask = tasks.find(task => 
      task.type === 'remote-analysis' && 
      task.status === 'completed' && 
      task.result
    )
    
    if (remoteAnalysisTask?.result) {
      try {
        return JSON.parse(remoteAnalysisTask.result)
      } catch (error) {
        console.error(`[${postId}] Failed to parse remote analysis result:`, error)
        return null
      }
    }
    
    return null
  }

  /**
   * Create a default classification result with all scores set to 0
   * Uses current ingredient categories from settings
   */
  private async createDefaultClassification(): Promise<ClassificationResult> {
    try {
      const ingredientCategories = await settingsManager.getIngredientCategories()
      const categories: { [categoryName: string]: CategoryScore } = {}
      
      // Create each category with its subcategories, all scores set to 0
      for (const [categoryName, subcategoryNames] of Object.entries(ingredientCategories)) {
        const subcategories: { [subcategoryName: string]: SubcategoryScore } = {}
        
        // Create each subcategory with score 0
        for (const subcategoryName of subcategoryNames) {
          subcategories[subcategoryName] = { score: 0 }
        }
        
        categories[categoryName] = {
          subcategories,
          totalScore: 0
        }
      }

      return {
        categories,
        totalAttentionScore: 0
      }
    } catch (error) {
      console.error('Failed to create default classification:', error)
      // Fallback to minimal structure if settings fail
      return {
        categories: {},
        totalAttentionScore: 0
      }
    }
  }

  /**
   * Clean up tasks for a post (when post is removed)
   */
  cleanupPost(postId: string): void {
    console.log(`[${postId}] [TaskManager] Cleaning up tasks`)
    this.tasks.delete(postId)
  }
}
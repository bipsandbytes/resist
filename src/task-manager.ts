/**
 * Task-Based Text Aggregation System
 * 
 * Manages multiple asynchronous text extraction tasks for each post.
 * As tasks complete, text is accumulated and classification is updated.
 */

import { SocialMediaPlatform, PostElement } from './types'

export interface Task {
  id: string                                    // Unique task identifier
  type: string                                 // Task type ('post-text', 'mock-task', 'ocr', etc.)
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string                              // Text result when completed
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
      {
        id: `${postId}-post-text`,
        type: 'post-text',
        status: 'pending'
      },
      {
        id: `${postId}-mock-task`,
        type: 'mock-task', 
        status: 'pending'
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
   * Get accumulated text from all completed tasks
   */
  getAccumulatedText(postId: string): string {
    const tasks = this.tasks.get(postId) || []
    const completedTexts = tasks
      .filter(task => task.status === 'completed' && task.result)
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
   * Clean up tasks for a post (when post is removed)
   */
  cleanupPost(postId: string): void {
    console.log(`[${postId}] [TaskManager] Cleaning up tasks`)
    this.tasks.delete(postId)
  }
}
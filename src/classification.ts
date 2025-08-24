// Content script classification client - communicates with background script using dynamic ES imports approach

import { logger } from './utils/logger'

// Classification categories
export enum ContentCategory {
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment', 
  EMOTION = 'Emotion'
}

export interface CategoryData {
  subcategories: {
    [subcategoryName: string]: {
      score: number
    }
  }
  totalScore: number
}

export interface ClassificationResult {
  [categoryName: string]: CategoryData
  totalAttentionScore?: number  // Optional total of all category scores
}

interface ClassificationRequest {
  id: string
  text: string
  ingredientCategories: { [categoryName: string]: string[] }
  type: 'CLASSIFY_TEXT'
}

interface ClassificationResponse {
  id: string
  result?: ClassificationResult
  error?: string
  type: 'CLASSIFICATION_RESULT'
}

class BackgroundClassificationClient {
  private requestCounter = 0

  constructor() {
    logger.info('[Content] Background classification client initialized')
  }

  async classify(text: string, ingredientCategories: { [categoryName: string]: string[] }, tweetId?: string): Promise<ClassificationResult> {
    const logPrefix = tweetId ? `[${tweetId}]` : '[Content]'
    
    if (!text?.trim()) {
      logger.info(`${logPrefix} Empty text provided, returning empty classification result`)
      // Return empty structure if no text
      const emptyResult: ClassificationResult = {}
      for (const [categoryName, subcategories] of Object.entries(ingredientCategories)) {
        emptyResult[categoryName] = {
          subcategories: {},
          totalScore: 0
        }
        for (const subcategoryName of subcategories) {
          emptyResult[categoryName].subcategories[subcategoryName] = { score: 0 }
        }
      }
      return emptyResult
    }

    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestCounter}_${Date.now()}`
      
      const request: ClassificationRequest = {
        id,
        text,
        ingredientCategories,
        type: 'CLASSIFY_TEXT'
      }

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        logger.info(`${logPrefix} Sending classification request:`, id, text.substring(0, 50) + '...')
        
        chrome.runtime.sendMessage(request, (response: ClassificationResponse) => {
          if (chrome.runtime.lastError) {
            logger.error(`${logPrefix} Message send error:`, chrome.runtime.lastError.message)
            reject(new Error(chrome.runtime.lastError.message))
            return
          }

          if (response.error) {
            logger.error(`${logPrefix} Classification error:`, response.error)
            reject(new Error(response.error))
          } else if (response.result) {
            logger.info(`${logPrefix} Classification success for request:`, id)
            resolve(response.result)
          } else {
            reject(new Error('No result received from background script'))
          }
        })
      } else {
        // Fallback for environments without chrome.runtime
        reject(new Error('Chrome runtime not available'))
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Classification request timeout'))
      }, 30000)
    })
  }
}

// Create singleton instance
const textClassifier = new BackgroundClassificationClient()

// Export the classify function
export async function classifyText(text: string, ingredientCategories: { [categoryName: string]: string[] }, tweetId?: string): Promise<ClassificationResult> {
  return textClassifier.classify(text, ingredientCategories, tweetId)
}
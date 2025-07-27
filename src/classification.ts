// Content script classification client - communicates with background script using dynamic ES imports approach

// Classification categories
export enum ContentCategory {
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment', 
  EMOTION = 'Emotion'
}

export interface ClassificationResult {
  category: ContentCategory
  confidence: number
  scores: Record<ContentCategory, number>
}

interface ClassificationRequest {
  id: string
  text: string
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
    console.log('[Content] Background classification client initialized')
  }

  async classify(text: string): Promise<ClassificationResult> {
    if (!text?.trim()) {
      return {
        category: ContentCategory.ENTERTAINMENT,
        confidence: 0.33,
        scores: {
          [ContentCategory.EDUCATION]: 0.33,
          [ContentCategory.ENTERTAINMENT]: 0.33,
          [ContentCategory.EMOTION]: 0.33
        }
      }
    }

    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestCounter}_${Date.now()}`
      
      const request: ClassificationRequest = {
        id,
        text,
        type: 'CLASSIFY_TEXT'
      }

      if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('[Content] Sending classification request:', id, text.substring(0, 50) + '...')
        
        chrome.runtime.sendMessage(request, (response: ClassificationResponse) => {
          if (chrome.runtime.lastError) {
            console.error('[Content] Message send error:', chrome.runtime.lastError.message)
            reject(new Error(chrome.runtime.lastError.message))
            return
          }

          if (response.error) {
            console.error('[Content] Classification error:', response.error)
            reject(new Error(response.error))
          } else if (response.result) {
            console.log('[Content] Classification success:', response.result.category)
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
export async function classifyText(text: string): Promise<ClassificationResult> {
  return textClassifier.classify(text)
}
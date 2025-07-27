// Background script for text classification using dynamic ES imports
// Based on working example - pure JavaScript to avoid Vite preprocessing

// Classification categories
const ContentCategory = {
  EDUCATION: 'Education',
  ENTERTAINMENT: 'Entertainment', 
  EMOTION: 'Emotion'
};

class ZeroShotClassificationPipelineSingleton {
  static task = 'zero-shot-classification';
  static model = 'Xenova/mobilebert-uncased-mnli';
  static instance = null;

  static async getInstance(progress_callback = null) {
    try {
      console.log('[Background] Loading transformers.js from CDN...');
      
      // Dynamic import from CDN exactly like the working example
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/transformers.min.js');
      
      // Configure environment - only allow remote models
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      
      console.log('[Background] Creating zero-shot classification pipeline...');
      
      // Create pipeline instance
      this.instance ??= await pipeline(this.task, this.model, { progress_callback });
      
      console.log('[Background] Zero-shot classification pipeline ready');
      return this.instance;
    } catch (error) {
      console.error('[Background] Error loading ZeroShotClassificationPipelineSingleton:', error);
      throw error;
    }
  }
}

class ClassificationService {
  constructor() {
    this.classifier = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('[Background] Initializing classification service...');
      
      this.classifier = await ZeroShotClassificationPipelineSingleton.getInstance((data) => {
        console.log('[Background] Pipeline loading progress:', data);
      });
      
      this.isInitialized = true;
      console.log('[Background] Classification service initialized successfully');
    } catch (error) {
      console.error('[Background] Failed to initialize classification service:', error);
      throw error;
    }
  }

  async classify(text) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!text?.trim()) {
      return {
        category: ContentCategory.ENTERTAINMENT,
        confidence: 0.33,
        scores: {
          [ContentCategory.EDUCATION]: 0.33,
          [ContentCategory.ENTERTAINMENT]: 0.33,
          [ContentCategory.EMOTION]: 0.33
        }
      };
    }

    try {
      console.log(`[Background] Classifying text: "${text.substring(0, 50)}..."`);
      
      const candidateLabels = [
        ContentCategory.EDUCATION,
        ContentCategory.ENTERTAINMENT,
        ContentCategory.EMOTION
      ];

      const result = await this.classifier(text, candidateLabels);
      
      // Convert to our expected format
      const scores = {};
      result.labels.forEach((label, index) => {
        scores[label] = result.scores[index];
      });

      const classificationResult = {
        category: result.labels[0],
        confidence: result.scores[0],
        scores: scores
      };

      console.log(`[Background] Classification result: ${classificationResult.category} (${(classificationResult.confidence * 100).toFixed(1)}%)`);
      
      return classificationResult;
    } catch (error) {
      console.error('[Background] Classification failed:', error);
      
      // Fallback classification
      return {
        category: ContentCategory.ENTERTAINMENT,
        confidence: 0.5,
        scores: {
          [ContentCategory.EDUCATION]: 0.2,
          [ContentCategory.ENTERTAINMENT]: 0.5,
          [ContentCategory.EMOTION]: 0.3
        }
      };
    }
  }
}

// Create singleton service instance
const classificationService = new ClassificationService();

// Preload classifier on background script startup
console.log('[Background] Starting classification service preload...');
classificationService.initialize().catch(error => {
  console.error('[Background] Failed to preload classification service:', error);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only handle classification requests
  if (request.type === 'CLASSIFY_TEXT') {
    console.log('[Background] Received classification request:', request.id);
    
    classificationService.classify(request.text)
      .then(result => {
        const response = {
          id: request.id,
          result,
          type: 'CLASSIFICATION_RESULT'
        };
        console.log('[Background] Sending classification result:', response.id);
        sendResponse(response);
      })
      .catch(error => {
        console.error('[Background] Classification error:', error);
        const response = {
          id: request.id,
          error: error.message,
          type: 'CLASSIFICATION_RESULT'
        };
        sendResponse(response);
      });
    
    return true; // Keep message channel open for async response
  }
  
  // For all other message types, don't handle them - let other listeners handle
  return false;
});

console.log('[Background] Classification background script loaded');
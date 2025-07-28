// Background script for text classification using dynamic ES imports
// Based on working example - pure JavaScript to avoid Vite preprocessing

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

  async classify(text, ingredientCategories, requestId) {
    const logPrefix = requestId ? `[Background:${requestId}]` : '[Background]'
    
    if (!this.isInitialized) {
      console.log(`${logPrefix} Initializing classifier...`)
      await this.initialize();
    }

    if (!text?.trim()) {
      console.log(`${logPrefix} Empty text provided, returning empty classification result`)
      // Return empty structure for empty text
      const emptyResult = {};
      for (const [categoryName, subcategories] of Object.entries(ingredientCategories)) {
        emptyResult[categoryName] = {
          subcategories: {},
          totalScore: 0
        };
        for (const subcategoryName of subcategories) {
          emptyResult[categoryName].subcategories[subcategoryName] = { score: 0 };
        }
      }
      return emptyResult;
    }

    try {
      console.log(`${logPrefix} Classifying text: "${text.substring(0, 50)}..."`);
      
      // Use all subcategories as candidate labels for zero-shot classification
      const candidateLabels = [];
      const subcategoryToCategory = {};
      
      for (const [categoryName, subcategories] of Object.entries(ingredientCategories)) {
        for (const subcategoryName of subcategories) {
          candidateLabels.push(subcategoryName);
          subcategoryToCategory[subcategoryName] = categoryName;
        }
      }

      console.log(`${logPrefix} Using ${candidateLabels.length} subcategories as labels:`, candidateLabels);

      const result = await this.classifier(text, candidateLabels);
      
      // Build structured result
      const structuredResult = {};
      
      // Initialize categories
      for (const [categoryName, subcategories] of Object.entries(ingredientCategories)) {
        structuredResult[categoryName] = {
          subcategories: {},
          totalScore: 0
        };
        
        // Initialize subcategories with 0 scores
        for (const subcategoryName of subcategories) {
          structuredResult[categoryName].subcategories[subcategoryName] = { score: 0 };
        }
      }
      
      // Fill in the classification scores
      result.labels.forEach((label, index) => {
        const categoryName = subcategoryToCategory[label];
        if (categoryName && structuredResult[categoryName]) {
          structuredResult[categoryName].subcategories[label] = {
            score: result.scores[index]
          };
        }
      });
      
      // Calculate category totals
      for (const [categoryName, categoryData] of Object.entries(structuredResult)) {
        categoryData.totalScore = Object.values(categoryData.subcategories)
          .reduce((sum, subcategory) => sum + subcategory.score, 0);
      }

      console.log(`${logPrefix} Classification complete. Category totals:`, 
        Object.entries(structuredResult).map(([cat, data]) => `${cat}: ${data.totalScore.toFixed(2)}`).join(', '));
      
      return structuredResult;
    } catch (error) {
      console.error(`${logPrefix} Classification failed:`, error);
      
      // Fallback classification - return empty structure
      const fallbackResult = {};
      for (const [categoryName, subcategories] of Object.entries(ingredientCategories)) {
        fallbackResult[categoryName] = {
          subcategories: {},
          totalScore: 0
        };
        for (const subcategoryName of subcategories) {
          fallbackResult[categoryName].subcategories[subcategoryName] = { score: 0 };
        }
      }
      return fallbackResult;
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
    console.log(`[Background] Received classification request: ${request.id}`);
    console.log(`[Background:${request.id}] Ingredient categories:`, Object.keys(request.ingredientCategories || {}));
    
    classificationService.classify(request.text, request.ingredientCategories, request.id)
      .then(result => {
        const response = {
          id: request.id,
          result,
          type: 'CLASSIFICATION_RESULT'
        };
        console.log(`[Background:${request.id}] Sending classification result`);
        sendResponse(response);
      })
      .catch(error => {
        console.error(`[Background:${request.id}] Classification error:`, error);
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
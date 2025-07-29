// Background script for image captioning using dynamic ES imports
// Based on background-classification.js pattern - pure JavaScript to avoid Vite preprocessing

class ImageCaptioningPipelineSingleton {
  static task = 'image-to-text';
  static model = 'Xenova/vit-gpt2-image-captioning';
  static instance = null;

  static async getInstance(progress_callback = null) {
    try {
      console.log('[Background] Loading transformers.js from CDN for image captioning...');
      
      // Dynamic import from CDN exactly like the classification example
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/transformers.min.js');
      
      // Configure environment - only allow remote models
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      
      console.log('[Background] Creating image-to-text pipeline...');
      
      // Create pipeline instance
      this.instance ??= await pipeline(this.task, this.model, { progress_callback });
      
      console.log('[Background] Image-to-text pipeline ready');
      return this.instance;
    } catch (error) {
      console.error('[Background] Error loading ImageCaptioningPipelineSingleton:', error);
      throw error;
    }
  }
}

class ImageCaptioningService {
  constructor() {
    this.captioner = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('[Background] Initializing image captioning service...');
      
      this.captioner = await ImageCaptioningPipelineSingleton.getInstance((data) => {
        console.log('[Background] Image pipeline loading progress:', data);
      });
      
      this.isInitialized = true;
      console.log('[Background] Image captioning service initialized successfully');
    } catch (error) {
      console.error('[Background] Failed to initialize image captioning service:', error);
      throw error;
    }
  }

  async analyzeImages(images, requestId) {
    const logPrefix = requestId ? `[Background:${requestId}]` : '[Background]'
    
    if (!this.isInitialized) {
      console.log(`${logPrefix} Initializing image captioner...`)
      await this.initialize();
    }

    if (!images || images.length === 0) {
      console.log(`${logPrefix} No images provided, returning empty result`);
      return '';
    }

    try {
      console.log(`${logPrefix} Analyzing ${images.length} images`);
      
      const descriptions = [];

      // Process each image
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        
        try {
          console.log(`${logPrefix} Processing image ${i + 1}/${images.length}`);
          
          // Run ML inference directly with URL
          const result = await this.captioner(imageData.url);
          
          // Extract description from result
          const description = this.extractDescription(result);
          
          if (description) {
            descriptions.push(`Image ${imageData.index}: ${description}`);
            console.log(`${logPrefix} Image ${imageData.index} description: "${description}"`);
          }
          
        } catch (error) {
          console.error(`${logPrefix} Failed to analyze image ${imageData.index}:`, error);
          // Continue with other images even if one fails
          descriptions.push(`Image ${imageData.index}: [analysis failed]`);
        }
      }

      const combinedDescription = descriptions.join('. ');
      console.log(`${logPrefix} Combined description: "${combinedDescription}"`);
      
      return combinedDescription;

    } catch (error) {
      console.error(`${logPrefix} Image analysis failed:`, error);
      return `[Image analysis unavailable: ${error.message}]`;
    }
  }

  /**
   * Create image element from data URL for ML processing
   */
  async createImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error(`Failed to load image from data URL: ${error}`));
      
      img.src = dataUrl;
    });
  }

  /**
   * Extract description text from ML model result
   */
  extractDescription(result) {
    try {
      // BLIP model returns an array with generated_text property
      if (Array.isArray(result) && result.length > 0) {
        return result[0].generated_text || '';
      }
      
      // Fallback for different result formats
      if (result?.generated_text) {
        return result.generated_text;
      }
      
      if (typeof result === 'string') {
        return result;
      }

      console.warn('[Background] Unexpected image captioning result format:', result);
      return '[Description format error]';

    } catch (error) {
      console.error('[Background] Failed to extract description:', error);
      return '[Description extraction error]';
    }
  }
}

// Create singleton service instance
const imageCaptioningService = new ImageCaptioningService();

// Preload captioner on background script startup
console.log('[Background] Starting image captioning service preload...');
imageCaptioningService.initialize().catch(error => {
  console.error('[Background] Failed to preload image captioning service:', error);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only handle image analysis requests
  if (request.type === 'ANALYZE_IMAGES') {
    console.log(`[Background] Received image analysis request: ${request.id}`);
    console.log(`[Background:${request.id}] Number of images: ${request.images?.length || 0}`);
    
    imageCaptioningService.analyzeImages(request.images, request.id)
      .then(result => {
        const response = {
          id: request.id,
          result,
          type: 'IMAGE_ANALYSIS_RESULT'
        };
        console.log(`[Background:${request.id}] Sending image analysis result`);
        sendResponse(response);
      })
      .catch(error => {
        console.error(`[Background:${request.id}] Image analysis error:`, error);
        const response = {
          id: request.id,
          error: error.message,
          type: 'IMAGE_ANALYSIS_RESULT'
        };
        sendResponse(response);
      });
    
    return true; // Keep message channel open for async response
  }
  
  // For all other message types, don't handle them - let other listeners handle
  return false;
});

console.log('[Background] Image captioning background script loaded');
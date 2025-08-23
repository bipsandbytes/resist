// Service worker for text classification and image captioning - Manifest V3 compatible
import { pipeline } from '@huggingface/transformers';

// ============================================================================
// TEXT CLASSIFICATION PIPELINE
// ============================================================================

class ZeroShotClassificationPipelineSingleton {
    static task = 'zero-shot-classification';
    static model = 'Xenova/mobilebert-uncased-mnli';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        try {
            console.log('[ServiceWorker] Creating zero-shot classification pipeline...');
            this.instance ??= await pipeline(this.task as any, this.model, { progress_callback });
            console.log('[ServiceWorker] Zero-shot classification pipeline ready');
            return this.instance;
        } catch (error) {
            console.error('[ServiceWorker] Error loading classification pipeline:', error);
            throw error;
        }
    }
}

class ClassificationService {
    private classifier: any = null;
    private isInitialized: boolean = false;

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('[ServiceWorker] Initializing classification service...');
            this.classifier = await ZeroShotClassificationPipelineSingleton.getInstance((data) => {
                console.log('[ServiceWorker] Classification pipeline loading progress:', data);
            });
            this.isInitialized = true;
            console.log('[ServiceWorker] Classification service initialized successfully');
        } catch (error) {
            console.error('[ServiceWorker] Failed to initialize classification service:', error);
            throw error;
        }
    }

    async classify(text, ingredientCategories, requestId) {
        const logPrefix = requestId ? `[ServiceWorker:${requestId}]` : '[ServiceWorker]';
        
        if (!this.isInitialized) {
            console.log(`${logPrefix} Initializing classifier...`);
            await this.initialize();
        }

        if (!text?.trim()) {
            console.log(`${logPrefix} Empty text provided, returning empty classification result`);
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

// ============================================================================
// IMAGE CAPTIONING PIPELINE
// ============================================================================

class ImageCaptioningPipelineSingleton {
    static task = 'image-to-text';
    static model = 'Xenova/vit-gpt2-image-captioning';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        try {
            console.log('[ServiceWorker] Creating image-to-text pipeline...');
            this.instance ??= await pipeline(this.task as any, this.model, { progress_callback });
            console.log('[ServiceWorker] Image-to-text pipeline ready');
            return this.instance;
        } catch (error) {
            console.error('[ServiceWorker] Error loading image captioning pipeline:', error);
            throw error;
        }
    }
}

class ImageCaptioningService {
    private captioner: any = null;
    private isInitialized: boolean = false;

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('[ServiceWorker] Initializing image captioning service...');
            this.captioner = await ImageCaptioningPipelineSingleton.getInstance((data: any) => {
                console.log('[ServiceWorker] Image pipeline loading progress:', data);
            });
            this.isInitialized = true;
            console.log('[ServiceWorker] Image captioning service initialized successfully');
        } catch (error) {
            console.error('[ServiceWorker] Failed to initialize image captioning service:', error);
            throw error;
        }
    }

    async analyzeImages(images: any, requestId: any) {
        const logPrefix = requestId ? `[ServiceWorker:${requestId}]` : '[ServiceWorker]';
        
        if (!this.isInitialized) {
            console.log(`${logPrefix} Initializing image captioner...`);
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

            console.warn('[ServiceWorker] Unexpected image captioning result format:', result);
            return '[Description format error]';

        } catch (error) {
            console.error('[ServiceWorker] Failed to extract description:', error);
            return '[Description extraction error]';
        }
    }
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

// Create singleton service instances
const classificationService = new ClassificationService();
const imageCaptioningService = new ImageCaptioningService();

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

// Message listener - handle both classification and image analysis requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[ServiceWorker] Received message: ${request.type} (ID: ${request.id})`);
    
    // Handle text classification requests
    if (request.type === 'CLASSIFY_TEXT') {
        console.log(`[ServiceWorker] Processing classification request: ${request.id}`);
        console.log(`[ServiceWorker:${request.id}] Ingredient categories:`, Object.keys(request.ingredientCategories || {}));
        
        classificationService.classify(request.text, request.ingredientCategories, request.id)
            .then(result => {
                const response = {
                    id: request.id,
                    result,
                    type: 'CLASSIFICATION_RESULT'
                };
                console.log(`[ServiceWorker:${request.id}] Sending classification result`);
                sendResponse(response);
            })
            .catch(error => {
                console.error(`[ServiceWorker:${request.id}] Classification error:`, error);
                const response = {
                    id: request.id,
                    error: error.message,
                    type: 'CLASSIFICATION_RESULT'
                };
                sendResponse(response);
            });
        
        return true; // Keep message channel open for async response
    }
    
    // Handle image analysis requests
    if (request.type === 'ANALYZE_IMAGES') {
        console.log(`[ServiceWorker] Processing image analysis request: ${request.id}`);
        console.log(`[ServiceWorker:${request.id}] Number of images: ${request.images?.length || 0}`);
        
        imageCaptioningService.analyzeImages(request.images, request.id)
            .then(result => {
                const response = {
                    id: request.id,
                    result,
                    type: 'IMAGE_ANALYSIS_RESULT'
                };
                console.log(`[ServiceWorker:${request.id}] Sending image analysis result`);
                sendResponse(response);
            })
            .catch(error => {
                console.error(`[ServiceWorker:${request.id}] Image analysis error:`, error);
                const response = {
                    id: request.id,
                    error: error.message,
                    type: 'IMAGE_ANALYSIS_RESULT'
                };
                sendResponse(response);
            });
        
        return true; // Keep message channel open for async response
    }
    
    // For all other message types, don't handle them
    return false;
});

// ============================================================================
// SERVICE WORKER LIFECYCLE
// ============================================================================

// Service worker lifecycle
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    event.waitUntil(self.clients.claim());
});

// Service worker lifecycle
self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activating...');
    event.waitUntil(self.clients.claim());
});

// OCR Test Page Script
// Global variables to track OCR results
let ocrResults = [];
let processedCount = 0;
let totalImages = 0;

function addStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    const statusElement = document.createElement('div');
    statusElement.className = `status ${type}`;
    statusElement.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    statusDiv.appendChild(statusElement);
    statusDiv.scrollTop = statusDiv.scrollHeight;
}

function updateResults() {
    const resultsDiv = document.getElementById('results');
    if (ocrResults.length === 0) {
        resultsDiv.textContent = 'OCR results will appear here...';
        return;
    }

    let output = `OCR Results (${processedCount}/${totalImages} images processed):\n\n`;
    ocrResults.forEach((result, index) => {
        output += `=== IMAGE ${index + 1} ===\n`;
        output += `Source: ${result.src}\n`;
        output += `Tweet ID: ${result.tweetId}\n`;
        output += `Text: ${result.text || '(no text detected)'}\n`;
        output += `Status: ${result.status}\n\n`;
    });
    resultsDiv.textContent = output;
}

function clearResults() {
    ocrResults = [];
    processedCount = 0;
    totalImages = 0;
    document.getElementById('results').textContent = 'OCR results will appear here...';
    document.getElementById('status').innerHTML = '';
    addStatus('Results cleared', 'info');
}

function checkOCRSetup() {
    addStatus('Checking OCR setup...', 'info');
    
    // Check if OCR functions are available
    if (typeof ocr_image === 'function') {
        addStatus('✅ ocr_image function is available', 'success');
        window.ocr_image = ocr_image; // Make it globally available
    } else {
        addStatus('❌ ocr_image function not found', 'error');
    }

    if (typeof get_all_image_text === 'function') {
        addStatus('✅ get_all_image_text function is available', 'success');
        window.get_all_image_text = get_all_image_text; // Make it globally available
    } else {
        addStatus('❌ get_all_image_text function not found', 'error');
    }

    // Check if chrome.runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        addStatus('✅ Chrome extension runtime is available', 'success');
    } else {
        addStatus('❌ Chrome extension runtime not available', 'error');
    }

    // Test basic message passing
    try {
        chrome.runtime.sendMessage({type: 'test', message: 'OCR setup check'}, (response) => {
            if (chrome.runtime.lastError) {
                addStatus('❌ Message passing error: ' + chrome.runtime.lastError.message, 'error');
            } else {
                addStatus('✅ Message passing works', 'success');
            }
        });
    } catch (e) {
        addStatus('❌ Message passing failed: ' + e.message, 'error');
    }
}

function testOCR() {
    addStatus('Starting OCR test...', 'info');
    
    // Reset results
    ocrResults = [];
    processedCount = 0;
    
    const images = document.querySelectorAll('.test-image');
    totalImages = images.length;
    
    addStatus(`Found ${totalImages} test images`, 'info');

    // Check if OCR is available
    if (typeof window.ocr_image !== 'function') {
        addStatus('❌ OCR functions not available. Make sure the extension is loaded.', 'error');
        return;
    }

    images.forEach((img, index) => {
        // Wait for image to load before processing
        if (img.complete && img.naturalHeight !== 0) {
            processImage(img, index);
        } else {
            img.onload = () => processImage(img, index);
            img.onerror = () => {
                addStatus(`❌ Failed to load image ${index + 1}`, 'error');
                ocrResults.push({
                    src: img.src,
                    tweetId: `test-${index}`,
                    text: '',
                    status: 'failed to load'
                });
                processedCount++;
                updateResults();
            };
        }
    });
}

function processImage(img, index) {
    const tweetId = `test-${index}`;
    addStatus(`Processing image ${index + 1}: ${img.src.substring(0, 50)}...`, 'info');
    
    // Initialize result entry
    ocrResults.push({
        src: img.src,
        tweetId: tweetId,
        text: '',
        status: 'processing...'
    });
    updateResults();

    try {
        // Call the OCR function
        window.ocr_image(img, tweetId);
        addStatus(`✅ OCR started for image ${index + 1}`, 'success');
    } catch (error) {
        addStatus(`❌ Error starting OCR for image ${index + 1}: ${error.message}`, 'error');
        ocrResults[ocrResults.length - 1].status = 'error: ' + error.message;
        processedCount++;
        updateResults();
    }
}

// Global callback function for OCR completion
window.ocrDone = function(imageSrc, text, tweetId) {
    console.log('OCR completed:', { imageSrc, text, tweetId });
    addStatus(`✅ OCR completed for image with tweetId: ${tweetId}`, 'success');
    
    // Find and update the corresponding result
    const result = ocrResults.find(r => r.tweetId === tweetId);
    if (result) {
        result.text = text;
        result.status = 'completed';
        processedCount++;
        updateResults();
        
        if (processedCount >= totalImages) {
            addStatus('🎉 All images processed!', 'success');
        }
    } else {
        addStatus(`⚠️ Received OCR result for unknown tweetId: ${tweetId}`, 'error');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addStatus('OCR Test Page loaded', 'info');
    addStatus('Click "Check OCR Setup" to verify the system is working', 'info');
    
    // Add event listeners to buttons
    document.getElementById('test-ocr-btn')?.addEventListener('click', testOCR);
    document.getElementById('clear-results-btn')?.addEventListener('click', clearResults);
    document.getElementById('check-setup-btn')?.addEventListener('click', checkOCRSetup);
});
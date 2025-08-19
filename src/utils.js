import { handleTweetViewportExit, restartTweetViewportTimer } from './tweet-utils.js';
import { createResistIcon } from './resist-icon.js';

// Store persistent buttons and overlays
const persistentButtons = new Map();
const persistentOverlays = new Map();

// Developer mode and debug data storage
let developerMode = false; // Enabled by default
const debugData = new Map();

// Developer mode toggle function
export function toggleDeveloperMode() {
  developerMode = !developerMode;
  console.log('Developer mode:', developerMode ? 'enabled' : 'disabled');
  
  // Show visual indicator
  showDeveloperModeIndicator();
  
  // Update all existing overlays to show/hide debug info
  updateAllOverlaysWithDebugInfo();
}

// Show visual indicator for developer mode
function showDeveloperModeIndicator() {
  // Remove existing indicator
  const existingIndicator = document.getElementById('dev-mode-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  if (developerMode) {
    const indicator = document.createElement('div');
    indicator.id = 'dev-mode-indicator';
    indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
    indicator.textContent = 'DEV MODE';
    document.body.appendChild(indicator);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 3000);
  }
}

// Get current developer mode status
export function getDeveloperMode() {
  return developerMode;
}

// Store debug data for a tweet
export function storeDebugData(tweetId, data) {
  if (!debugData.has(tweetId)) {
    debugData.set(tweetId, {});
  }
  const existingData = debugData.get(tweetId);
  debugData.set(tweetId, { ...existingData, ...data });
}

// Get debug data for a tweet
export function getDebugData(tweetId) {
  return debugData.get(tweetId) || {};
}

// Update all existing overlays to show/hide debug info
function updateAllOverlaysWithDebugInfo() {
  const overlays = document.querySelectorAll('.classifier-overlay');
  overlays.forEach(overlay => {
    const tweetId = overlay.id.replace('overlay-', '');
    const tweetNode = document.getElementById(tweetId);
    if (tweetNode) {
      // Trigger a re-render of the overlay with debug info
      // This will be handled by the existing updateOverlay function
      // We'll need to modify it to accept debug data
      const event = new CustomEvent('updateOverlayWithDebug', {
        detail: { tweetId, developerMode }
      });
      document.dispatchEvent(event);
    }
  });
}

// Developer mode is now enabled by default
// Keyboard shortcut removed - will implement proper toggle in the future

// Helper to get tweet text
export function getTweetText(tweetNode) {
  const textNode = tweetNode.querySelector('div[data-testid="tweetText"]');
  let text = textNode ? textNode.innerText : '';
  
  // Include author information in the text
  const authorDisplayName = tweetNode.getAttribute('data-author-name');
  
  if (authorDisplayName) {
    const authorInfo = `${authorDisplayName}: `;
    text = authorInfo + text;
  }
  
  return text;
}

// Helper to get tweet image(s)
export function getTweetImages(tweetNode) {
  // Debug: Log the tweetNode structure to understand what we're searching in
  debugTweet(tweetNode, 'Searching for images in tweetNode with id: ' + tweetNode.id);
  debugTweet(tweetNode, 'TweetNode HTML structure: ' + tweetNode.outerHTML.substring(0, 500) + '...');
  
  // Also try searching in the entire document to see if images exist elsewhere
  const allImagesInDocument = document.querySelectorAll('img[src*="twimg"]');
  debugTweet(tweetNode, 'Total images with twimg in document: ' + allImagesInDocument.length);
  if (allImagesInDocument.length > 0) {
    debugTweet(tweetNode, 'Sample images in document: ' + Array.from(allImagesInDocument).slice(0, 3).map(img => img.src).join(', '));
  }
  
  // Try multiple selectors to catch different types of images
  const selectors = [
    'img[alt][src]', // Standard images with alt and src
    'img[src*="media"]', // Any image with media in src (Twitter media)
    'img[src*="twimg"]', // Any image from Twitter's CDN
    'img[data-testid="tweetPhoto"]', // Tweet photos
    'img[data-testid="tweetPhotoInline"]', // Inline tweet photos
    'img[data-testid="videoThumbnail"]', // Video thumbnails
    'img[data-testid="videoPoster"]', // Video posters
    'img[src*="video_thumb"]', // Video thumbnails by URL pattern
    'img[src*="ext_tw_video_thumb"]', // Extended video thumbnails
    // Look for images within tweetPhoto containers
    '[data-testid="tweetPhoto"] img',
    '[data-testid="tweetPhoto"] img[src]',
  ];
  
  let allImageNodes = [];
  selectors.forEach(selector => {
    const nodes = tweetNode.querySelectorAll(selector);
    debugTweet(tweetNode, 'Selector "' + selector + '" found ' + nodes.length + ' nodes');
    allImageNodes = allImageNodes.concat(Array.from(nodes));
  });
  
  // Remove duplicates based on src
  const uniqueImages = [];
  const seenSrcs = new Set();
  allImageNodes.forEach(img => {
    if (!seenSrcs.has(img.src)) {
      seenSrcs.add(img.src);
      uniqueImages.push(img);
    }
  });
  
  // Debug: Log all images found
  debugTweet(tweetNode, 'All images found: ' + JSON.stringify(uniqueImages.map(img => ({
    src: img ? img.src : 'undefined',
    className: img && img.className ? img.className : 'undefined',
    alt: img && img.alt ? img.alt : 'undefined',
    dataTestId: img ? img.getAttribute('data-testid') : 'undefined'
  }))));
  
  // Filter out profile pictures and emojis by checking for likely class names or src
  const images = uniqueImages
  .filter(img => {
    // Add null checks for img properties
    if (!img || !img.src) {
      debugTweet(tweetNode, 'Filtering out image with no src: ' + JSON.stringify(img));
      return false;
    }
    
    const isEmoji = img.className && img.className.includes('emoji');
    const isProfileImage = img.src.includes('profile_images');
    const isSvg = img.src.endsWith('.svg');
    const isIcon = img.src.includes('emoji') || img.src.includes('icon');
    
    // Debug: Log why images are being filtered out
    if (isEmoji || isProfileImage || isSvg || isIcon) {
      debugTweet(tweetNode, 'Filtering out image: ' + img.src + ' because: ' + JSON.stringify({
        isEmoji,
        isProfileImage,
        isSvg,
        isIcon
      }));
    }
    
    return !isEmoji && !isProfileImage && !isSvg && !isIcon;
  });
  
  debugTweet(tweetNode, 'Final images after filtering: ' + images.map(img => img.src).join(', '));
  
  // If no images found with standard selectors, try a broader search
  if (images.length === 0) {
    debugTweet(tweetNode, 'No images found with standard selectors, trying broader search...');
    
    // Try searching for any img tag within the tweetNode's subtree
    const allImgTags = tweetNode.querySelectorAll('img');
    debugTweet(tweetNode, 'All img tags found in tweetNode: ' + allImgTags.length);
    
    if (allImgTags.length > 0) {
      debugTweet(tweetNode, 'All img tags details: ' + JSON.stringify(Array.from(allImgTags).map(img => ({
        src: img ? img.src : 'undefined',
        alt: img && img.alt ? img.alt : 'undefined',
        className: img && img.className ? img.className : 'undefined',
        dataTestId: img ? img.getAttribute('data-testid') : 'undefined'
      }))));
    }
    
    // Also try searching for elements with background-image
    const bgImageElements = tweetNode.querySelectorAll('[style*="background-image"]');
    debugTweet(tweetNode, 'Elements with background-image: ' + bgImageElements.length);
    
    if (bgImageElements.length > 0) {
      debugTweet(tweetNode, 'Background image elements: ' + JSON.stringify(Array.from(bgImageElements).slice(0, 3).map(el => ({
        style: el.getAttribute('style'),
        className: el.className,
        dataTestId: el.getAttribute('data-testid')
      }))));
    }
    
    // Look for lazy loading indicators - elements that will become images
    const lazyImageContainers = tweetNode.querySelectorAll('[data-testid="tweetPhoto"]');
    debugTweet(tweetNode, 'Lazy image containers found: ' + lazyImageContainers.length);
    
    if (lazyImageContainers.length > 0) {
      debugTweet(tweetNode, 'Lazy containers details: ' + JSON.stringify(Array.from(lazyImageContainers).map(container => ({
        className: container.className,
        style: container.getAttribute('style'),
        hasImg: container.querySelector('img') ? 'yes' : 'no',
        hasBackground: container.style.backgroundImage ? 'yes' : 'no'
      }))));
    }
    
    // Check for IntersectionObserver or other lazy loading mechanisms
    const hasIntersectionObserver = tweetNode.querySelector('[data-testid="tweetPhoto"]') !== null;
    debugTweet(tweetNode, 'Has tweetPhoto container (potential lazy loading): ' + hasIntersectionObserver);
  }
  
  return images;
}

// Helper to get tweet video(s)
export function getTweetVideoPosters(tweetNode) {
  // Twitter videos are usually in video tags
  const videoNodes = tweetNode.querySelectorAll('video');
  const posters = Array.from(videoNodes)
  .map(node => node.poster)
  .filter(poster => !!poster);
  return posters;
}

export function quoteTweet(tweetNode) {
  // quote tweet is a div with aria-labelledby but does not have a data-testid of "Image" or "Media"
  return tweetNode.querySelector('div[aria-labelledby]:not([data-testid="Image"]):not([data-testid="Media"])');
}

// Helper function to find the best placement target for the classifier button
function findButtonPlacementTarget(tweetNode) {
  // Strategy 1: Try to find the More button and place next to it
  const moreBtn = tweetNode.querySelector('button[aria-label="More"]');
  if (moreBtn) {
    // Try to find a stable parent container
    let parent = moreBtn.parentElement;
    let depth = 0;
    while (parent && depth < 6) {
      // Look for a container that has multiple action buttons
      const actionButtons = parent.querySelectorAll('button[aria-label]');
      if (actionButtons.length >= 3) {
        return parent;
      }
      parent = parent.parentElement;
      depth++;
    }
    
    // Fallback: use the original deep traversal
    return moreBtn.parentNode.parentNode.parentNode.parentNode;
  }
  
  // Strategy 2: Look for any action button container
  const actionContainer = tweetNode.querySelector('[role="group"]');
  if (actionContainer) {
    return actionContainer;
  }
  
  // Strategy 3: Look for the tweet actions area
  const actionsArea = tweetNode.querySelector('[data-testid="tweet"] [role="group"]');
  if (actionsArea) {
    return actionsArea;
  }
  
  // Strategy 4: Last resort - find any container with buttons
  const buttonContainer = tweetNode.querySelector('div:has(button)');
  if (buttonContainer) {
    return buttonContainer;
  }
  
  return null;
}

export function addClassifierButton(tweetNode, SEEN_TWEETS = null) {
  const tweetId = tweetNode.id;
  
  // If we already have a button for this tweet, just re-attach it
  if (persistentButtons.has(tweetId)) {
    const { button, overlay } = persistentButtons.get(tweetId);
    
    // Re-attach button if needed
    if (!document.contains(button)) {
      // Try multiple placement strategies for better reliability
      const placementTarget = findButtonPlacementTarget(tweetNode);
      if (placementTarget) {
        placementTarget.appendChild(button);
      }
    }
    
    // Re-attach overlay if needed
    if (!document.contains(overlay)) {
      document.body.appendChild(overlay);
    }
    
    return;
  }
  
  // Check if button already exists in DOM (avoid duplicates)
  if (tweetNode.querySelector('.classifier-btn')) return;
  
  const moreBtn = tweetNode.querySelector('button[aria-label="More"]');
  if (!moreBtn) return;
  
  // Use the shared createResistIcon function instead of creating our own button
  const btn = createResistIcon();
  btn.className = 'classifier-btn'; // Override class for utils-specific styling
  btn.style.zIndex = 1000;
  
  const overlay = document.createElement('div');
  overlay.className = 'classifier-overlay'; 
  overlay.style.display = 'none';
  overlay.id = "overlay-" + tweetNode.id;
  overlay.style.zIndex = 1000;
  
  // Set the exact dimensions for the overlay
  overlay.style.width = '407.6px';
  overlay.style.height = '464.837px';
  
  // Add loading screen content with inline styles
  overlay.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: white;
        border-radius: 8px;
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid #e1e5e9;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        "></div>
        <h5 id="loading-title" style="
          font-weight: 600;
          margin: 0 0 10px 0;
          font-size: 18px;
          text-align: center;
          color: #333;
        ">Fetching AI model</h5>
        <p style="
          margin: 0 0 20px 0;
          font-size: 14px;
          opacity: 0.7;
          text-align: center;
          color: #666;
        ">
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .classifier-overlay {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border: 1px solid #e1e5e9;
          overflow: hidden;
        }
      </style>
    `;
  
  // Add message cycling logic
  const loadingTitle = overlay.querySelector('#loading-title');
  if (loadingTitle) {
    setTimeout(() => {
      loadingTitle.textContent = 'Analyzing content';
    }, 8000);
    
    setTimeout(() => {
      loadingTitle.textContent = 'Computing attention scores';
    }, 16000);
  }
  
  let hoverTimeout;
  
  btn.addEventListener('mouseenter', () => {
    const rect = btn.getBoundingClientRect();
    overlay.style.left = `${rect.right + window.scrollX-10}px`;
    overlay.style.top = `${rect.top + window.scrollY + 20}px`;
    overlay.style.display = 'block';
    
    // Trigger viewport exit calculation when hovering over classifier button
    if (SEEN_TWEETS) {
      handleTweetViewportExit(tweetNode, SEEN_TWEETS);
    }
  });
  btn.addEventListener('mouseleave', () => {
    console.log('mouseleave btn');
    hoverTimeout = setTimeout(() => {
      if (!overlay.matches(':hover')) overlay.style.display = 'none';
    }, 100);
    // Restart the viewport timer when overlay is dismissed
    if (SEEN_TWEETS) {
      restartTweetViewportTimer(tweetNode, SEEN_TWEETS);
    }
    
  });
  overlay.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
  });
  overlay.addEventListener('mouseleave', () => {
    console.log('mouseleave overlay');
    overlay.style.display = 'none';
    
    // Restart the viewport timer when overlay is dismissed
    if (SEEN_TWEETS) {
      restartTweetViewportTimer(tweetNode, SEEN_TWEETS);
    }
  });
  
  // Store both button and overlay for persistence
  persistentButtons.set(tweetId, { button: btn, overlay: overlay });
  
  document.body.appendChild(overlay);
  
  // Use the same placement strategy for initial placement
  const placementTarget = findButtonPlacementTarget(tweetNode);
  if (placementTarget) {
    placementTarget.appendChild(btn);
  }
}

// Intersection Observer to re-attach buttons when tweets become visible
let tweetObserver;
let reattachmentInterval;

export function initializeTweetObserver() {
  if (tweetObserver) {
    tweetObserver.disconnect();
  }
  
  tweetObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tweetNode = entry.target;
        addClassifierButton(tweetNode);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '50px' // Start observing slightly before tweets come into view
  });
  
  // Set up periodic re-attachment check
  if (reattachmentInterval) {
    clearInterval(reattachmentInterval);
  }
  
  reattachmentInterval = setInterval(() => {
    reattachMissingButtons();
  }, 2000); // Check every 2 seconds
  
  // Set up scroll-based re-attachment
  let scrollTimeout;
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      reattachMissingButtons();
    }, 100); // Debounce scroll events
  });
}

// Function to re-attach missing buttons to visible tweets
function reattachMissingButtons() {
  const visibleTweets = document.querySelectorAll('article[role="article"]');
  visibleTweets.forEach(tweetNode => {
    const tweetId = tweetNode.id;
    if (persistentButtons.has(tweetId)) {
      const { button } = persistentButtons.get(tweetId);
      if (!document.contains(button)) {
        console.log('Re-attaching missing button for tweet:', tweetId);
        addClassifierButton(tweetNode);
      }
    }
  });
}

export function observeTweet(tweetNode) {
  if (tweetObserver) {
    tweetObserver.observe(tweetNode);
  }
}

export function unobserveTweet(tweetNode) {
  if (tweetObserver) {
    tweetObserver.unobserve(tweetNode);
  }
}

// Cleanup function to remove persistent data for a tweet
export function cleanupTweet(tweetId) {
  if (persistentButtons.has(tweetId)) {
    const { button, overlay } = persistentButtons.get(tweetId);
    
    // Remove from DOM if still present
    if (document.contains(button)) {
      button.remove();
    }
    if (document.contains(overlay)) {
      overlay.remove();
    }
    
    // Remove from persistent storage
    persistentButtons.delete(tweetId);
  }
}

export function debugTweet(tweetNode, info) {
  console.log(`[${new Date().toLocaleTimeString()}] [${tweetNode.id}](${tweetNode.getAttribute('data-src')}) ${info}`);
}
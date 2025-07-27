export function createResistOverlay(postId: string): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'resist-overlay'
  overlay.style.display = 'none'
  overlay.id = `overlay-${postId}`
  overlay.style.zIndex = '1000'
  overlay.style.position = 'absolute'
  
  // Set the exact dimensions for the overlay
  overlay.style.width = '407.6px'
  overlay.style.height = '464.837px'
  
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
      .resist-overlay {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        border: 1px solid #e1e5e9;
        overflow: hidden;
      }
    </style>
  `
  
  return overlay
}

export function setupOverlayMessageCycling(overlay: HTMLElement): void {
  // Add message cycling logic
  const loadingTitle = overlay.querySelector('#loading-title')
  if (loadingTitle) {
    setTimeout(() => {
      loadingTitle.textContent = 'Analyzing content'
    }, 8000)
    
    setTimeout(() => {
      loadingTitle.textContent = 'Computing attention scores'
    }, 16000)
  }
}
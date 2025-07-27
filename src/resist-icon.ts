export function createResistIcon(): HTMLElement {
  const icon = document.createElement('button')
  icon.className = 'resist-icon'
  icon.title = 'Resist - Digital Nutrition'
  icon.setAttribute('aria-label', 'View digital nutrition for this post')
  icon.type = 'button'
  
  // Create a button with magnifying glass icon to match Twitter's style
  icon.innerHTML = `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: transparent;
      color: rgb(83, 100, 113);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      padding: 0;
    ">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
      </svg>
    </div>
  `
  
  // Add hover effect to match Twitter buttons
  const iconDiv = icon.querySelector('div') as HTMLElement
  icon.addEventListener('mouseenter', () => {
    iconDiv.style.backgroundColor = 'rgba(29, 161, 242, 0.1)'
    iconDiv.style.color = 'rgb(29, 161, 242)'
  })
  
  icon.addEventListener('mouseleave', () => {
    iconDiv.style.backgroundColor = 'transparent'
    iconDiv.style.color = 'rgb(83, 100, 113)'
  })
  
  // Style the button to match Twitter's button styling
  icon.style.border = 'none'
  icon.style.background = 'transparent'
  icon.style.padding = '0'
  icon.style.margin = '0'
  icon.style.cursor = 'pointer'
  
  return icon
}

export function createLoadingIcon(): HTMLElement {
  const icon = document.createElement('button')
  icon.className = 'resist-icon resist-loading'
  icon.title = 'Resist - Analyzing content...'
  icon.setAttribute('aria-label', 'Analyzing post content')
  icon.type = 'button'
  icon.disabled = true
  
  icon.innerHTML = `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: transparent;
      color: rgb(83, 100, 113);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      animation: pulse 1.5s ease-in-out infinite;
      border: none;
      padding: 0;
    ">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="opacity: 0.5;">
        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
      </svg>
    </div>
  `
  
  // Add CSS animation for loading state if not already added
  if (!document.querySelector('#resist-loading-styles')) {
    const styles = document.createElement('style')
    styles.id = 'resist-loading-styles'
    styles.textContent = `
      @keyframes pulse {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
    `
    document.head.appendChild(styles)
  }
  
  // Style the button to match Twitter's button styling
  icon.style.border = 'none'
  icon.style.background = 'transparent'
  icon.style.padding = '0'
  icon.style.margin = '0'
  icon.style.cursor = 'default'
  
  return icon
}
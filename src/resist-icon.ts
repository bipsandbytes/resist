export function createResistIcon(): HTMLElement {
  const icon = document.createElement('button')
  icon.className = 'resist-icon'
  icon.title = 'Resist - Digital Nutrition'
  icon.setAttribute('aria-label', 'View digital nutrition for this post')
  icon.type = 'button'
  
  // Create a button with custom Resist icon
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
      <svg viewBox="0 0 100 100" width="24" height="24">
        <path fill-rule="evenodd" fill="#000000" d="m49.5 87c-20.7 0-37.5-16.8-37.5-37.5 0-20.7 16.8-37.5 37.5-37.5 20.7 0 37.5 16.8 37.5 37.5 0 20.7-16.8 37.5-37.5 37.5z"/>
        <path fill="#f8f9fb" d="m66.7 45.8c-1.7 5.3-3.3 10.6-5 15.8-0.6 2-1.6 2.9-3.3 2.9-1.6-0.1-2.6-1-3.2-3-1.5-5.2-2.9-10.4-4.5-15.9-0.7 2.6-1.4 5-2.1 7.3q-1.4 4.5-2.8 9.1c-0.7 2-2.3 2.9-4.4 2.3-1.2-0.4-1.8-1.3-2.1-2.5q-2.4-8.2-4.9-16.4c0-0.1-0.1-0.1-0.2-0.3q-0.9 2.5-1.8 4.8-1.3 3.2-4.7 3.2c-2.1 0-4.2 0-6.3 0-1.6 0-2.6-0.7-3.2-2.1-0.4-1.2-0.1-2.6 0.9-3.3 0.6-0.4 1.4-0.7 2.2-0.8 1.7-0.1 3.4 0 5.1 0 0.8 0 1.3-0.3 1.6-1.1 1-2.8 2.1-5.6 3.2-8.4 0.7-1.9 2-2.8 3.7-2.7 1.8 0 2.6 0.8 3.3 2.9q0.3 1.1 0.6 2.2c1.2 4.4 2.4 8.7 3.8 13.5 0.6-2.1 1.2-3.8 1.7-5.5 0.9-3.2 1.9-6.5 2.9-9.8 0.7-2.5 2.3-3.6 4.5-3.2 1.5 0.2 2.2 1.2 2.6 2.5 1.4 5.1 2.8 10.2 4.3 15.6 0.6-2 1.1-3.8 1.6-5.5 1.1-3.4 2.1-6.7 3.1-10 0.6-1.8 1.7-2.6 3.3-2.7 1.9 0 3 0.7 3.6 2.6 0.9 2.7 1.8 5.3 2.6 7.9 0.4 1.3 1 1.8 2.4 1.7 1.5-0.1 2.9 0 4.4 0 1.8 0 3.1 1.1 3.3 2.8 0.1 1.5-1 3.1-2.7 3.2-2.8 0.2-5.7 0.2-8.5 0.1-1.5-0.1-2.4-1.2-2.9-2.5-0.6-1.8-1.2-3.5-1.8-5.3-0.1 0.2-0.2 0.3-0.3 0.6z"/>
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
document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settings-btn')
  
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })
  
  // Load today's consumption data
  // TODO: Implement consumption data loading
})

export {}
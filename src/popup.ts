document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settings-btn')
  const ocrTestBtn = document.getElementById('ocr-test-btn')
  
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })
  
  ocrTestBtn?.addEventListener('click', () => {
    // Open OCR test page in a new tab
    const testPageUrl = chrome.runtime.getURL('thirdparty/ocr/ocr-test.html')
    chrome.tabs.create({ url: testPageUrl })
  })
  
  // Load today's consumption data
  // TODO: Implement consumption data loading
})

export {}
import { beforeEach } from 'vitest'

// Setup DOM globals
beforeEach(() => {
  // Reset DOM before each test
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})
import { readFileSync } from 'fs'
import { resolve } from 'path'

export function loadSampleTweetHtml(): string {
  const htmlPath = resolve(__dirname, 'sample-tweet.html')
  return readFileSync(htmlPath, 'utf-8')
}

export function createRealTweetElement(): HTMLElement {
  const html = loadSampleTweetHtml()
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.firstElementChild as HTMLElement
}
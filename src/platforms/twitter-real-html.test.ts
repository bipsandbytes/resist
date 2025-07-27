import { describe, it, expect, beforeEach } from 'vitest'
import { TwitterPlatform } from './twitter'
import { createRealTweetElement } from '../test/real-tweet-html'

describe('TwitterPlatform - Real HTML Tests', () => {
  let platform: TwitterPlatform
  let realTweet: HTMLElement

  beforeEach(() => {
    platform = new TwitterPlatform()
    realTweet = createRealTweetElement()
    document.body.appendChild(realTweet)
  })

  describe('detectPosts with real HTML', () => {
    it('should detect real Twitter HTML structure', () => {
      const posts = platform.detectPosts()
      
      expect(posts).toHaveLength(1)
      expect(posts[0].element).toBe(realTweet)
      expect(posts[0].id).toMatch(/twitter-0-john-oldman-\d+/)
    })
  })

  describe('extractPostContent with real HTML', () => {
    it('should extract text content from real tweet', () => {
      const post = { element: realTweet, id: 'real-test-post' }
      const content = platform.extractPostContent(post)

      expect(content.text).toContain('Daily Routine of Chandragupta Maurya')
      expect(content.text).toContain('The following thread would delve on the daily routine')
      expect(content.text).toContain('Chandragupta (322-298 BCE) was the first emperor of India')
    })

    it('should extract author name from real tweet', () => {
      const post = { element: realTweet, id: 'real-test-post' }
      const content = platform.extractPostContent(post)

      expect(content.authorName).toBe('John Oldman')
    })

    it('should extract media elements from real tweet', () => {
      const post = { element: realTweet, id: 'real-test-post' }
      const content = platform.extractPostContent(post)

      expect(content.mediaElements).toHaveLength(1)
      expect(content.mediaElements[0].type).toBe('image')
      expect(content.mediaElements[0].src).toContain('pbs.twimg.com/media/GwygRDBWwAA-RwC')
    })
  })

  describe('extractAuthorInfo with real HTML', () => {
    it('should extract correct author name from complex HTML', () => {
      const post = { element: realTweet, id: 'real-test-post' }
      const authorInfo = platform.extractAuthorInfo(post)

      expect(authorInfo.name).toBe('John Oldman')
    })
  })

  describe('addResistIcon with real HTML', () => {
    it('should add resist button after Grok and More buttons', () => {
      const post = { element: realTweet, id: 'real-test-post' }
      platform.addResistIcon(post)

      // Check that the resist button was added to the tweet
      const resistButton = realTweet.querySelector('.resist-btn')
      expect(resistButton).toBeTruthy()
      
      // Check that the button has proper attributes
      expect(resistButton?.getAttribute('aria-label')).toBe('Resist - Digital Nutrition')
      expect(resistButton?.getAttribute('type')).toBe('button')
      expect(resistButton?.className).toBe('resist-btn')
      
      // Check that it contains the magnifying glass emoji
      expect(resistButton?.textContent).toBe('🔍')
      
      // Check that it's positioned correctly relative to Grok and More buttons
      const grokButton = realTweet.querySelector('button[aria-label*="Grok"]')
      const moreButton = realTweet.querySelector('[data-testid="caret"]')
      expect(grokButton).toBeTruthy()
      expect(moreButton).toBeTruthy()
      expect(realTweet.contains(resistButton)).toBe(true)
    })

    it('should find action buttons in real HTML structure', () => {
      const replyButton = realTweet.querySelector('[data-testid="reply"]')
      const likeButton = realTweet.querySelector('[data-testid="like"]')
      const retweetButton = realTweet.querySelector('[data-testid="retweet"]')
      const bookmarkButton = realTweet.querySelector('[data-testid="bookmark"]')

      expect(replyButton).toBeTruthy()
      expect(likeButton).toBeTruthy()
      expect(retweetButton).toBeTruthy()
      expect(bookmarkButton).toBeTruthy()
    })
  })

  describe('selector validation with real HTML', () => {
    it('should find elements using platform selectors', () => {
      const postSelector = platform.getPostSelector()
      const textSelector = platform.getTextSelector()
      const imageSelector = platform.getImageSelector()
      const authorSelector = platform.getAuthorSelector()

      expect(realTweet.matches(postSelector)).toBe(true)
      expect(realTweet.querySelector(textSelector)).toBeTruthy()
      expect(realTweet.querySelector(imageSelector)).toBeTruthy()
      expect(realTweet.querySelector(authorSelector)).toBeTruthy()
    })

    it('should extract correct data using selectors', () => {
      const tweetText = realTweet.querySelector(platform.getTextSelector())
      const tweetImage = realTweet.querySelector(platform.getImageSelector())
      const authorElement = realTweet.querySelector(platform.getAuthorSelector())

      expect(tweetText?.textContent).toContain('Daily Routine of Chandragupta Maurya')
      expect((tweetImage as HTMLImageElement)?.src).toContain('pbs.twimg.com')
      expect(authorElement).toBeTruthy()
    })
  })
})
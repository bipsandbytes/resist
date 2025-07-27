import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TwitterPlatform } from './twitter'
import { createMockTweet, createMockTimeline, addTweetToDOM, addTimelineToDOM } from '../test/mock-dom'

describe('TwitterPlatform', () => {
  let platform: TwitterPlatform

  beforeEach(() => {
    platform = new TwitterPlatform()
  })

  describe('detectPosts', () => {
    it('should detect tweets in the DOM', () => {
      const tweet1 = createMockTweet({ text: 'First tweet' })
      const tweet2 = createMockTweet({ text: 'Second tweet' })
      
      addTweetToDOM(tweet1)
      addTweetToDOM(tweet2)

      const posts = platform.detectPosts()
      
      expect(posts).toHaveLength(2)
      expect(posts[0].element).toBe(tweet1)
      expect(posts[1].element).toBe(tweet2)
      expect(posts[0].id).toMatch(/^twitter-test-user-(hash-\w+|\d+)$/)
      expect(posts[1].id).toMatch(/^twitter-test-user-(hash-\w+|\d+)$/)
    })

    it('should return empty array when no tweets found', () => {
      const posts = platform.detectPosts()
      expect(posts).toHaveLength(0)
    })
  })

  describe('extractPostContent', () => {
    it('should extract text content from a tweet', () => {
      const tweet = createMockTweet({ 
        text: 'This is a test tweet',
        authorName: 'Test User'
      })
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      const content = platform.extractPostContent(post)

      expect(content.text).toBe('This is a test tweet')
      expect(content.authorName).toBe('Test User')
    })

    it('should extract media elements from tweet with image', () => {
      const tweet = createMockTweet({ 
        text: 'Tweet with image',
        hasImage: true
      })
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      const content = platform.extractPostContent(post)

      expect(content.mediaElements).toHaveLength(1)
      expect(content.mediaElements[0].type).toBe('image')
      expect(content.mediaElements[0].src).toBe('https://pbs.twimg.com/media/test.jpg')
    })

    it('should extract media elements from tweet with video', () => {
      const tweet = createMockTweet({ 
        text: 'Tweet with video',
        hasVideo: true
      })
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      const content = platform.extractPostContent(post)

      expect(content.mediaElements).toHaveLength(1)
      expect(content.mediaElements[0].type).toBe('video')
      expect(content.mediaElements[0].src).toBe('https://video.twimg.com/test.mp4')
    })
  })

  describe('extractAuthorInfo', () => {
    it('should extract author name from tweet', () => {
      const tweet = createMockTweet({ authorName: 'Jane Smith' })
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      const authorInfo = platform.extractAuthorInfo(post)

      expect(authorInfo.name).toBe('Jane Smith')
    })

    it('should return "Unknown" when author name not found', () => {
      const tweet = document.createElement('article')
      tweet.setAttribute('data-testid', 'tweet')
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      const authorInfo = platform.extractAuthorInfo(post)

      expect(authorInfo.name).toBe('Unknown')
    })
  })

  describe('addResistIcon', () => {
    it('should add resist button in header area', () => {
      const tweet = createMockTweet()
      addTweetToDOM(tweet)

      const post = { element: tweet, id: 'test-post' }
      platform.addResistIcon(post)

      // Check that the resist button was added to the tweet
      const resistButton = tweet.querySelector('.resist-btn')
      expect(resistButton).toBeTruthy()
      
      // Check that the button has proper attributes
      expect(resistButton?.getAttribute('aria-label')).toBe('Resist - Digital Nutrition')
      expect(resistButton?.getAttribute('type')).toBe('button')
      
      // Check that it contains the magnifying glass emoji
      expect(resistButton?.textContent).toBe('🔍')
    })

  })

  describe('addOverlay', () => {
    it('should add overlay to tweet', () => {
      const tweet = createMockTweet()
      addTweetToDOM(tweet)

      const overlay = document.createElement('div')
      overlay.className = 'budget-overlay'

      const post = { element: tweet, id: 'test-post' }
      platform.addOverlay(post, overlay)

      expect(tweet.style.position).toBe('relative')
      expect(overlay.style.position).toBe('absolute')
      expect(overlay.style.top).toBe('0px')
      expect(overlay.style.left).toBe('0px')
      expect(overlay.style.width).toBe('100%')
      expect(overlay.style.height).toBe('100%')
      expect(overlay.style.zIndex).toBe('999')
      expect(tweet.contains(overlay)).toBe(true)
    })
  })

  describe('getSelectors', () => {
    it('should return correct selectors', () => {
      expect(platform.getPostSelector()).toBe('article[data-testid="tweet"]')
      expect(platform.getTextSelector()).toBe('[data-testid="tweetText"]')
      expect(platform.getImageSelector()).toBe('[data-testid="tweetPhoto"] img')
      expect(platform.getAuthorSelector()).toBe('[data-testid="User-Name"]')
    })
  })

  describe('observeNewContent', () => {
    it('should call callback when new tweets are added', async () => {
      const timeline = createMockTimeline(0) // Empty timeline
      addTimelineToDOM(timeline)

      const callback = vi.fn()
      platform.observeNewContent(callback)

      // Add a new tweet to the timeline
      const newTweet = createMockTweet({ text: 'New tweet' })
      timeline.appendChild(newTweet)

      // Wait for mutation observer to trigger
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalled()
      const callArgs = callback.mock.calls[0][0]
      expect(callArgs).toHaveLength(1)
      expect(callArgs[0].element).toBe(newTweet)
      expect(callArgs[0].id).toMatch(/^twitter-test-user-(hash-\w+|\d+)$/)
    })

    it('should detect tweets added anywhere in the DOM', async () => {
      const callback = vi.fn()
      platform.observeNewContent(callback)

      // Add tweet directly to body (not in timeline)
      const newTweet = createMockTweet({ text: 'Direct tweet' })
      addTweetToDOM(newTweet)

      // Wait for mutation observer
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalled()
    })
  })
})
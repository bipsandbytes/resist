// Mock DOM utilities for testing Twitter HTML structure

export function createMockTweet(options: {
  text?: string
  authorName?: string
  hasImage?: boolean
  hasVideo?: boolean
} = {}): HTMLElement {
  const {
    text = 'This is a sample tweet text',
    authorName = 'Test User',
    hasImage = false,
    hasVideo = false
  } = options

  const article = document.createElement('article')
  article.setAttribute('data-testid', 'tweet')
  article.setAttribute('role', 'article')

  // Create header section with author and date
  const headerDiv = document.createElement('div')
  
  // Create author section
  const userNameDiv = document.createElement('div')
  userNameDiv.setAttribute('data-testid', 'User-Name')
  
  const authorSpan = document.createElement('span')
  const nameSpan = document.createElement('span')
  nameSpan.textContent = authorName
  authorSpan.appendChild(nameSpan)
  userNameDiv.appendChild(authorSpan)
  
  // Create date section
  const dateDiv = document.createElement('div')
  const timeElement = document.createElement('time')
  timeElement.setAttribute('datetime', '2025-01-01T12:00:00.000Z')
  timeElement.textContent = '1h'
  dateDiv.appendChild(timeElement)
  
  // Create Grok and More buttons section
  const buttonsContainer = document.createElement('div')
  
  const grokButton = document.createElement('button')
  grokButton.setAttribute('aria-label', 'Grok actions')
  grokButton.setAttribute('type', 'button')
  
  const moreButton = document.createElement('button')
  moreButton.setAttribute('data-testid', 'caret')
  moreButton.setAttribute('aria-label', 'More')
  moreButton.setAttribute('type', 'button')
  
  buttonsContainer.appendChild(grokButton)
  buttonsContainer.appendChild(moreButton)
  
  headerDiv.appendChild(userNameDiv)
  headerDiv.appendChild(dateDiv)
  headerDiv.appendChild(buttonsContainer)

  // Create tweet text
  const tweetTextDiv = document.createElement('div')
  tweetTextDiv.setAttribute('data-testid', 'tweetText')
  tweetTextDiv.textContent = text

  // Create actions bar
  const actionsGroup = document.createElement('div')
  actionsGroup.setAttribute('role', 'group')
  
  // Add action buttons
  const replyButton = document.createElement('button')
  replyButton.setAttribute('data-testid', 'reply')
  
  const retweetButton = document.createElement('button')
  retweetButton.setAttribute('data-testid', 'retweet')
  
  const likeButton = document.createElement('button')
  likeButton.setAttribute('data-testid', 'like')

  actionsGroup.appendChild(replyButton)
  actionsGroup.appendChild(retweetButton)
  actionsGroup.appendChild(likeButton)

  // Add media if requested
  if (hasImage) {
    const photoDiv = document.createElement('div')
    photoDiv.setAttribute('data-testid', 'tweetPhoto')
    
    const img = document.createElement('img')
    img.src = 'https://pbs.twimg.com/media/test.jpg'
    img.alt = 'Test image'
    
    photoDiv.appendChild(img)
    article.appendChild(photoDiv)
  }

  if (hasVideo) {
    const video = document.createElement('video')
    video.src = 'https://video.twimg.com/test.mp4'
    article.appendChild(video)
  }

  // Assemble the tweet
  article.appendChild(headerDiv)
  article.appendChild(tweetTextDiv)
  article.appendChild(actionsGroup)

  return article
}

export function createMockTimeline(tweetCount: number = 3): HTMLElement {
  const timeline = document.createElement('div')
  timeline.setAttribute('data-testid', 'primaryColumn')

  for (let i = 0; i < tweetCount; i++) {
    const tweet = createMockTweet({
      text: `Tweet ${i + 1} content`,
      authorName: `Test User`,
      hasImage: i % 2 === 0, // Every other tweet has an image
    })
    timeline.appendChild(tweet)
  }

  return timeline
}

export function addTweetToDOM(tweet: HTMLElement) {
  document.body.appendChild(tweet)
}

export function addTimelineToDOM(timeline: HTMLElement) {
  document.body.appendChild(timeline)
}
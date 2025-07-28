export interface PostElement {
  element: HTMLElement
  id: string
}

export interface PostContent {
  text: string
  authorName: string
  mediaElements: MediaElement[]
}

export interface AuthorInfo {
  name: string
  handle?: string
}

export interface MediaElement {
  type: 'image' | 'video'
  element: HTMLElement
  src?: string
}

export interface SocialMediaPlatform {
  // Content detection and extraction
  detectPosts(): PostElement[]
  extractPostContent(post: PostElement): PostContent
  extractAuthorInfo(post: PostElement): AuthorInfo
  extractMediaElements(post: PostElement): MediaElement[]
  
  // DOM manipulation
  addResistIcon(post: PostElement, icon?: HTMLElement): Promise<void>
  addOverlay(post: PostElement, overlay: HTMLElement): void
  
  // Platform-specific selectors and behavior
  getPostSelector(): string
  getTextSelector(): string
  getImageSelector(): string
  getAuthorSelector(): string
  
  // Dynamic content handling
  observeNewContent(callback: (newPosts: PostElement[]) => void): void
  
  // Platform identification and post ID extraction
  getPlatformName(): string
  extractPostId(element: HTMLElement): string | null
}
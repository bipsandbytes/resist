/**
 * Settings Manager for Resist Extension
 * 
 * Handles user settings stored in Chrome storage, including ingredient categories
 * that define how content is classified and scored.
 */

export interface IngredientCategories {
  [categoryName: string]: string[]
}

export interface ResistSettings {
  ingredientCategories: IngredientCategories
}

export const DEFAULT_SETTINGS: ResistSettings = {
  ingredientCategories: {
    'Education': [
      'News, politics, and social concern',
      'Learning and education'
    ],
    'Entertainment': [
      'Celebrities, sports, and culture',
      'Humor and amusement'
    ],
    'Emotion': [
      'Controversy and clickbait',
      'Anxiety and fear'
    ]
  }
}

export class SettingsManager {
  private static readonly STORAGE_KEY = 'settings'

  /**
   * Get all settings from Chrome storage with defaults
   */
  async getSettings(): Promise<ResistSettings> {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(SettingsManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error('[Settings] Failed to get settings:', chrome.runtime.lastError)
            resolve(DEFAULT_SETTINGS)
            return
          }
          
          const settings = result[SettingsManager.STORAGE_KEY] || {}
          
          // Merge with defaults to ensure all required fields exist
          const mergedSettings: ResistSettings = {
            ingredientCategories: {
              ...DEFAULT_SETTINGS.ingredientCategories,
              ...settings.ingredientCategories
            }
          }
          
          resolve(mergedSettings)
        })
      } catch (error) {
        console.error('[Settings] Failed to get settings:', error)
        resolve(DEFAULT_SETTINGS)
      }
    })
  }

  /**
   * Get ingredient categories specifically
   */
  async getIngredientCategories(): Promise<IngredientCategories> {
    const settings = await this.getSettings()
    return settings.ingredientCategories
  }

  /**
   * Update settings in Chrome storage
   */
  async updateSettings(updates: Partial<ResistSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(SettingsManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error('[Settings] Failed to get settings for update:', chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          
          const currentSettings = result[SettingsManager.STORAGE_KEY] || {}
          const updatedSettings = {
            ...currentSettings,
            ...updates
          }
          
          chrome.storage.local.set({ [SettingsManager.STORAGE_KEY]: updatedSettings }, () => {
            if (chrome.runtime.lastError) {
              console.error('[Settings] Failed to update settings:', chrome.runtime.lastError)
              reject(chrome.runtime.lastError)
            } else {
              console.log('[Settings] Settings updated successfully')
              resolve()
            }
          })
        })
      } catch (error) {
        console.error('[Settings] Failed to update settings:', error)
        reject(error)
      }
    })
  }

  /**
   * Initialize settings with defaults if they don't exist
   */
  async initializeSettings(): Promise<void> {
    const currentSettings = await this.getSettings()
    
    // If settings are exactly the defaults, it means they weren't set yet
    const settingsExist = JSON.stringify(currentSettings) !== JSON.stringify(DEFAULT_SETTINGS)
    
    if (!settingsExist) {
      console.log('[Settings] Initializing settings with defaults')
      await this.updateSettings(DEFAULT_SETTINGS)
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.updateSettings(DEFAULT_SETTINGS)
    console.log('[Settings] Settings reset to defaults')
  }
}

// Singleton instance
export const settingsManager = new SettingsManager()
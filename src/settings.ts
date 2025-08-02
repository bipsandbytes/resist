/**
 * Settings Manager for Resist Extension
 * 
 * Handles user settings stored in Chrome storage, including ingredient categories
 * that define how content is classified and scored.
 */

export interface IngredientCategories {
  [categoryName: string]: string[]
}

export interface CategoryBudget {
  [categoryName: string]: {
    total: number; // Total minutes for category per day
    subcategories: {
      [subcategoryName: string]: number; // Minutes for each subcategory per day
    }
  }
}

export interface Filters {
  filterImagesVideos: boolean;
  enableFilterWords: boolean;
  filterWords: string;
  enableFilterTopics: boolean;
  filterTopics: string;
  filterAction: 'hide' | 'remove';
}

export interface ResistSettings {
  ingredientCategories: IngredientCategories
  budgets: CategoryBudget
  filters?: Filters
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
  },
  budgets: {
    'Education': {
      total: 60, // Highest allocation to encourage learning and staying informed
      subcategories: {
        'News, politics, and social concern': 40, // More time for current events
        'Learning and education': 20 // Dedicated learning time
      }
    },
    'Entertainment': {
      total: 30, // Moderate allocation for balanced lifestyle
      subcategories: {
        'Celebrities, sports, and culture': 15, // Cultural awareness
        'Humor and amusement': 15 // Stress relief and enjoyment
      }
    },
    'Emotion': {
      total: 15, // Lower allocation to protect mental health
      subcategories: {
        'Controversy and clickbait': 5, // Minimal exposure to manipulative content
        'Anxiety and fear': 10 // Some time to process emotions but limited exposure
      }
    }
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
            },
            budgets: {
              ...DEFAULT_SETTINGS.budgets,
              ...settings.budgets
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
   * Get budget settings specifically
   */
  async getBudgets(): Promise<CategoryBudget> {
    const settings = await this.getSettings()
    return settings.budgets
  }

  /**
   * Get filter settings specifically
   */
  async getFilters(): Promise<Filters> {
    const settings = await this.getSettings()
    return settings.filters || {
      filterImagesVideos: false,
      enableFilterWords: false,
      filterWords: '',
      enableFilterTopics: false,
      filterTopics: '',
      filterAction: 'hide'
    }
  }

  /**
   * Update budget settings
   */
  async updateBudgets(budgetUpdates: Partial<CategoryBudget>): Promise<void> {
    const currentSettings = await this.getSettings()
    
    // Deep merge budget updates with existing budgets
    const updatedBudgets = { ...currentSettings.budgets }
    
    for (const [categoryName, categoryBudget] of Object.entries(budgetUpdates)) {
      if (categoryBudget) {
        updatedBudgets[categoryName] = {
          total: categoryBudget.total ?? updatedBudgets[categoryName]?.total ?? 0,
          subcategories: {
            ...updatedBudgets[categoryName]?.subcategories,
            ...categoryBudget.subcategories
          }
        }
      }
    }
    
    await this.updateSettings({ budgets: updatedBudgets })
  }

  /**
   * Update filters in Chrome storage
   */
  async updateFilters(filterUpdates: Partial<Filters>): Promise<void> {
    const currentFilters = await this.getFilters()
    
    const updatedFilters: Filters = {
      ...currentFilters,
      ...filterUpdates
    }
    
    await this.updateSettings({ filters: updatedFilters })
  }

  /**
   * Set budget for a specific category
   */
  async setBudgetForCategory(category: string, minutes: number, subcategoryBudgets?: { [subcategoryName: string]: number }): Promise<void> {
    const currentBudgets = await this.getBudgets()
    
    const categoryUpdate: Partial<CategoryBudget> = {
      [category]: {
        total: minutes,
        subcategories: subcategoryBudgets || currentBudgets[category]?.subcategories || {}
      }
    }
    
    await this.updateBudgets(categoryUpdate)
  }

  /**
   * Set budget for a specific subcategory
   */
  async setBudgetForSubcategory(category: string, subcategory: string, minutes: number): Promise<void> {
    const currentBudgets = await this.getBudgets()
    
    const categoryUpdate: Partial<CategoryBudget> = {
      [category]: {
        total: currentBudgets[category]?.total ?? 0,
        subcategories: {
          ...currentBudgets[category]?.subcategories,
          [subcategory]: minutes
        }
      }
    }
    
    await this.updateBudgets(categoryUpdate)
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
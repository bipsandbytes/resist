/**
 * Settings Manager for Resist Extension
 * 
 * Handles user settings stored in Chrome storage, including ingredient categories
 * that define how content is classified and scored.
 */

import { storageManager } from './storage-manager'
import { logger } from './utils/logger'

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
  },
  filters: {
    filterImagesVideos: false,
    enableFilterWords: false,
    filterWords: '',
    enableFilterTopics: false,
    filterTopics: '',
    filterAction: 'hide'
  }
}

export class SettingsManager {
  private static readonly STORAGE_KEY = 'settings'

  /**
   * Get all settings from Chrome storage with defaults
   */
  async getSettings(): Promise<ResistSettings> {
    try {
      const settings = storageManager.get(SettingsManager.STORAGE_KEY) || {}
      
      // Merge with defaults to ensure all required fields exist
      const mergedSettings: ResistSettings = {
        ingredientCategories: {
          ...DEFAULT_SETTINGS.ingredientCategories,
          ...settings.ingredientCategories
        },
        budgets: {
          ...DEFAULT_SETTINGS.budgets,
          ...settings.budgets
        },
        filters: {
          ...DEFAULT_SETTINGS.filters,
          ...settings.filters
        }
      }
      
      return mergedSettings
    } catch (error) {
      logger.error('[Settings] Failed to get settings:', error)
      return DEFAULT_SETTINGS
    }
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
    const ingredientCategories = await this.getIngredientCategories()
    
    let calculatedSubcategories: { [subcategoryName: string]: number }
    
    if (subcategoryBudgets) {
      // Use provided subcategory budgets (manual override)
      calculatedSubcategories = subcategoryBudgets
    } else {
      // Auto-calculate equal distribution among subcategories
      const subcategoryNames = ingredientCategories[category] || []
      const subcategoryCount = subcategoryNames.length
      
      if (subcategoryCount > 0) {
        const equalBudget = Math.round(minutes / subcategoryCount)
        calculatedSubcategories = {}
        
        subcategoryNames.forEach((subcategoryName, index) => {
          if (index === subcategoryNames.length - 1) {
            // Last subcategory gets remaining minutes to avoid rounding errors
            calculatedSubcategories[subcategoryName] = minutes - (equalBudget * (subcategoryCount - 1))
          } else {
            calculatedSubcategories[subcategoryName] = equalBudget
          }
        })
        
        logger.debug(`[Settings] Auto-distributed ${minutes} minutes for ${category}:`, calculatedSubcategories)
      } else {
        // No subcategories found, use empty object
        calculatedSubcategories = {}
        logger.warn(`[Settings] No subcategories found for category: ${category}`)
      }
    }
    
    const categoryUpdate: Partial<CategoryBudget> = {
      [category]: {
        total: minutes,
        subcategories: calculatedSubcategories
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
    try {
      const currentSettings = storageManager.get(SettingsManager.STORAGE_KEY) || {}
      const updatedSettings = {
        ...currentSettings,
        ...updates
      }
      
      logger.debug('[Settings] Updating settings:', updatedSettings)
      storageManager.set(SettingsManager.STORAGE_KEY, updatedSettings)
      
      logger.debug('[Settings] Settings updated successfully')
    } catch (error) {
      logger.error('[Settings] Failed to update settings:', error)
      throw error
    }
  }

  /**
   * Initialize settings with defaults if they don't exist
   */
  async initializeSettings(): Promise<boolean> {
    try {
      logger.debug('[Settings] initializeSettings() called')
      
      const currentSettings = await this.getSettings()
      logger.debug('[Settings] Current settings:', currentSettings)
      
      const settingsExist = JSON.stringify(currentSettings) !== JSON.stringify(DEFAULT_SETTINGS)
      logger.debug('[Settings] Settings exist check:', settingsExist)
      
      // Log current settings for debugging
      logger.debug('[Settings] Current settings JSON:', JSON.stringify(currentSettings))
      logger.debug('[Settings] Default settings JSON:', JSON.stringify(DEFAULT_SETTINGS))
      
      if (settingsExist) {
        logger.info('[Settings] Settings already exist, skipping initialization')
        return false
      }

      // Store default settings
      await this.updateSettings(DEFAULT_SETTINGS)
      logger.info('[Settings] Default settings initialized')
      return true
      
    } catch (error) {
      logger.error('[Settings] Failed to initialize settings:', error)
      throw error
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.updateSettings(DEFAULT_SETTINGS)
    logger.info('[Settings] Settings reset to defaults')
  }
}

// Singleton instance
export const settingsManager = new SettingsManager()
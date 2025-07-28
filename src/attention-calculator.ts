/**
 * Attention Score Calculator
 * 
 * Computes real-time attention scores from stored classification data
 * and current time spent values.
 */

import { CategoryScore, SubcategoryScore } from './post-persistence'

export interface ComputedAttentionScores {
  categories: { [categoryName: string]: ComputedCategoryScore }
  totalAttentionScore: number
}

export interface ComputedCategoryScore {
  subcategories: { [subcategoryName: string]: ComputedSubcategoryScore }
  totalScore: number
}

export interface ComputedSubcategoryScore {
  attentionScore: number    // score * timeSpent
  classificationScore: number
}

export class AttentionCalculator {
  /**
   * Compute real-time attention scores from stored classification data
   */
  static computeAttentionScores(
    storedCategories: { [categoryName: string]: CategoryScore },
    timeSpent: number
  ): ComputedAttentionScores {
    const categories: { [categoryName: string]: ComputedCategoryScore } = {}
    let totalAttentionScore = 0

    for (const [categoryName, categoryData] of Object.entries(storedCategories)) {
      const computedCategory: ComputedCategoryScore = {
        subcategories: {},
        totalScore: 0
      }

      for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
        const attentionScore = subcategoryData.score * timeSpent

        computedCategory.subcategories[subcategoryName] = {
          attentionScore,
          classificationScore: subcategoryData.score
        }

        computedCategory.totalScore += attentionScore
      }

      categories[categoryName] = computedCategory
      totalAttentionScore += computedCategory.totalScore
    }

    return {
      categories,
      totalAttentionScore
    }
  }

  /**
   * Get a summary of attention scores by category
   */
  static getCategorySummary(
    storedCategories: { [categoryName: string]: CategoryScore },
    timeSpent: number
  ): { [categoryName: string]: number } {
    const computed = this.computeAttentionScores(storedCategories, timeSpent)
    const summary: { [categoryName: string]: number } = {}

    for (const [categoryName, categoryData] of Object.entries(computed.categories)) {
      summary[categoryName] = categoryData.totalScore
    }

    return summary
  }

  /**
   * Get the top attention-grabbing subcategories
   */
  static getTopSubcategories(
    storedCategories: { [categoryName: string]: CategoryScore },
    timeSpent: number,
    limit: number = 3
  ): Array<{ name: string, category: string, attentionScore: number }> {
    const computed = this.computeAttentionScores(storedCategories, timeSpent)
    const allSubcategories: Array<{ name: string, category: string, attentionScore: number }> = []

    for (const [categoryName, categoryData] of Object.entries(computed.categories)) {
      for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
        allSubcategories.push({
          name: subcategoryName,
          category: categoryName,
          attentionScore: subcategoryData.attentionScore
        })
      }
    }

    return allSubcategories
      .sort((a, b) => b.attentionScore - a.attentionScore)
      .slice(0, limit)
  }
}
import { postPersistence } from './post-persistence'
import { settingsManager } from './settings'
import type { DateRangeAnalytics } from './types'

// Button event listeners
document.querySelector('#go-to-options')?.addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html#dashboard'));
  }
});

document.querySelector('#go-to-homepage')?.addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open('https://bipinsuresh.info/');
  }
});

/* Credit: https://codepen.io/chriscoyier/pen/ApavyZ */
function createAnalyticsNutritionLabel(todayAnalytics: DateRangeAnalytics, budgets: any): string {
    const totalTimeSpent = todayAnalytics.totalTimeSpent / 1000; // Convert ms to seconds
    const totalPosts = todayAnalytics.postCount;
    
    var outputHTML = `
        <section class="performance-facts">
        <header class="performance-facts__header">
            <h1 class="performance-facts__title">Information Facts</h1>
        </header>
        <table class="performance-facts__table">
            <tbody>
    `;
    
    // Primary and secondary sections (matching the commented structure)
    const totalAttentionScore = todayAnalytics.totalAttentionScore || 0;
    
    outputHTML += `
        <tr class="no-top-border">
            <th class="primary" colspan="2">
                <b>Total Attention</b>
                ${Math.round(totalAttentionScore)}s
            </th>
            <td class="secondary">
                ${totalPosts} posts
            </td>
        </tr>
        <tr class="thick-row">
            <td colspan="3" class="small-info">
                <b>% Budget consumed</b>
            </td>
        </tr>
    `;

    // Process each category (Components in the commented structure)
    for (const [categoryName, categoryData] of Object.entries(todayAnalytics.categories)) {
        const categoryTotalScore = categoryData.totalScore || 0;
        const categoryTimeSeconds = categoryTotalScore
        
        // Get budget for this category (convert from minutes to seconds)
        const categoryBudget = budgets[categoryName];
        const categoryBudgetSeconds = categoryBudget ? categoryBudget.total * 60 : 0;
        const categoryPercentage = categoryBudgetSeconds > 0 ? (categoryTimeSeconds / categoryBudgetSeconds) * 100 : 0;
        
        // Component row - category name + time in left columns, percentage in right column
        outputHTML += `
            <tr>
                <th colspan="2">
                    <b>${categoryName}</b>
                    ${Math.round(categoryTimeSeconds)}s
                </th>
                <td>
                    <b>${Math.round(categoryPercentage)}%</b>
                </td>
            </tr>
        `;

        // Process subcategories (SubComponents in the commented structure)
        if (categoryData.subcategories) {
            for (const [subcategoryName, subcategoryScore] of Object.entries(categoryData.subcategories)) {
                const subcategoryTimeSeconds = subcategoryScore
                
                // Get budget for this subcategory (convert from minutes to seconds)
                const subcategoryBudget = categoryBudget?.subcategories?.[subcategoryName] || 0;
                const subcategoryBudgetSeconds = subcategoryBudget * 60;
                const subcategoryPercentage = subcategoryBudgetSeconds > 0 ? (subcategoryTimeSeconds / subcategoryBudgetSeconds) * 100 : 0;
                
                // SubComponent row - blank cell, name + time in middle, percentage in right
                outputHTML += `
                    <tr>
                        <td class="blank-cell">
                        </td>
                        <th class="subcomponent">
                            ${subcategoryName}
                            ${Math.round(subcategoryTimeSeconds)}s
                        </th>
                        <td class="subcomponent">
                            ${Math.round(subcategoryPercentage)}%
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    outputHTML += `
            <tr class="thick-row">
                <td colspan="3"></td>
            </tr>
        </tbody>
        </table>
        <p class="small-info">* Percentages based on your daily budget settings. Go to Settings to adjust budgets.</p>
        </section>
    `;

    return outputHTML;
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('[Popup] Loading today\'s analytics...');
        
        // Get today's analytics from post-persistence and budget settings from settings manager
        const [todayAnalytics, budgets] = await Promise.all([
            postPersistence.getTodayAnalytics(),
            settingsManager.getBudgets()
        ]);
        
        console.log('[Popup] Today\'s analytics:', todayAnalytics);
        console.log('[Popup] Budgets:', budgets);
        
        const nutritionFactsDiv = document.getElementById('nutrition-facts');
        
        if (todayAnalytics.postCount === 0) {
            // No data for today
            nutritionFactsDiv!.innerHTML = `
                <section class="performance-facts">
                    <header class="performance-facts__header">
                        <h1 class="performance-facts__title">Daily Information Facts</h1>
                    </header>
                    <div style="text-align: center; padding: 20px;">
                        <p>No content consumed today.</p>
                        <p class="small-info">Start browsing to see your daily analytics!</p>
                    </div>
                </section>
            `;
        } else {
            // Generate analytics nutrition label
            const analyticsHTML = createAnalyticsNutritionLabel(todayAnalytics, budgets);
            nutritionFactsDiv!.innerHTML = analyticsHTML;
        }
        
    } catch (error) {
        console.error('[Popup] Error loading analytics:', error);
        
        document.getElementById('nutrition-facts')!.innerHTML = `
            <section class="performance-facts">
                <header class="performance-facts__header">
                    <h1 class="performance-facts__title">Daily Information Facts</h1>
                </header>
                <div style="text-align: center; padding: 20px;">
                    <p>Error loading analytics.</p>
                    <p class="small-info">Please try again later.</p>
                </div>
            </section>
        `;
    }
});
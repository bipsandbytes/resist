import { postPersistence, type DateRangeAnalytics } from './post-persistence'
import type { CategoryBudget } from './settings'
import { storageManager } from './storage-manager'
import { formatTimeSpent } from './utils'

// Button event listeners
document.querySelector('#go-to-options')?.addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    window.open(chrome.runtime.getURL('thirdparty/ocr/ocr-test.html'));
    // chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('thirdparty/ocr/ocr-test.html'));
  }
});

document.querySelector('#go-to-homepage')?.addEventListener('click', function() {
  // Open bipinsuresh.info in a new tab
  window.open('https://bipinsuresh.info/', '_blank');
});

// Helper function to get budgets directly from Chrome storage
async function getBudgetsFromStorage(): Promise<CategoryBudget> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('[Popup] Failed to get settings from storage:', chrome.runtime.lastError);
        resolve({});
        return;
      }
      
      const settings = result.settings || {};
      const budgets = settings.budgets || {};
      
      console.log('[Popup] Retrieved budgets from storage:', budgets);
      resolve(budgets);
    });
  });
}



/* Credit: https://codepen.io/chriscoyier/pen/ApavyZ */
function createAnalyticsNutritionLabel(todayAnalytics: DateRangeAnalytics, budgets: CategoryBudget): string {
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
                ${formatTimeSpent(totalAttentionScore * 1000)}
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
        const categoryTimeMs = categoryTotalScore * 1000; // Convert to milliseconds
        
        // Get budget for this category (convert from minutes to milliseconds)
        const categoryBudget = budgets[categoryName];
        const categoryBudgetMs = categoryBudget ? categoryBudget.total * 60 * 1000 : 0;
        const categoryPercentage = categoryBudgetMs > 0 ? (categoryTimeMs / categoryBudgetMs) * 100 : 0;
        
        // Component row - category name + time in left columns, percentage in right column
        outputHTML += `
            <tr>
                <th colspan="2">
                    <b>${categoryName}</b>
                    ${formatTimeSpent(categoryTimeMs)}
                </th>
                <td>
                    <b>${Math.round(categoryPercentage)}%</b>
                </td>
            </tr>
        `;

        // Process subcategories (SubComponents in the commented structure)
        if (categoryData.subcategories) {
            for (const [subcategoryName, subcategoryScore] of Object.entries(categoryData.subcategories)) {
                const subcategoryTimeMs = subcategoryScore * 1000; // Convert to milliseconds
                
                // Get budget for this subcategory (convert from minutes to milliseconds)
                const subcategoryBudget = categoryBudget?.subcategories?.[subcategoryName] || 0;
                const subcategoryBudgetMs = subcategoryBudget * 60 * 1000;
                const subcategoryPercentage = subcategoryBudgetMs > 0 ? (subcategoryTimeMs / subcategoryBudgetMs) * 100 : 0;
                
                // SubComponent row - blank cell, name + time in middle, percentage in right
                outputHTML += `
                    <tr>
                        <td class="blank-cell">
                            </td>
                        <th class="subcomponent">
                            ${subcategoryName}
                            ${formatTimeSpent(subcategoryTimeMs)}
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
        console.log('[Popup] Popup loaded, starting to load data...');
        
        // Initialize StorageManager first (same as content script)
        console.log('[Popup] Initializing StorageManager...');
        try {
            await storageManager.initialize();
            console.log('[Popup] StorageManager initialized successfully');
        } catch (error) {
            console.error('[Popup] Failed to initialize StorageManager:', error);
            // Fall back to direct Chrome storage for budgets
            console.log('[Popup] Falling back to direct storage access for budgets');
        }
        
        // Get today's analytics from post-persistence and budget settings
        console.log('[Popup] Fetching analytics and budgets...');
        const [todayAnalytics, budgets] = await Promise.all([
            postPersistence.getTodayAnalytics(),
            getBudgetsFromStorage()
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
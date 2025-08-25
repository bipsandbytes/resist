/* Credit: https://codepen.io/chriscoyier/pen/ApavyZ */

import { formatTimeSpent } from './utils';

export function nutritionFactsOverlay(classificationResult, timeSpentMs, postState = 'complete', postContent = null) { 
    // Check if classification is complete
    const isComplete = postState === 'complete';
    const asterisk = isComplete ? '' : ' *';
    
    // Calculate word count and image count dynamically
    let wordCount = 0;
    let imageCount = 0;
    
    if (postContent) {
        // Count words in text (split by whitespace and filter out empty strings)
        if (postContent.text) {
            wordCount = postContent.text.trim().split(/\s+/).filter(word => word.length > 0).length;
        }
        
        // Count images in media elements
        if (postContent.mediaElements) {
            imageCount = postContent.mediaElements.filter(media => media.type === 'image').length;
        }
    }
        
    var outputHTML = `
        <section class="performance-facts">
        <header class="performance-facts__header">
            <h1 class="performance-facts__title">Information Facts</h1>
        </header>
        <table class="performance-facts__table">
            <tbody>
            <thead>
            <tr>
                <th colspan="2" class="small-info">
                Serving Size 
                </th>
                <td class="small-info">
                ${wordCount} word${wordCount !== 1 ? 's' : ''}, ${imageCount} image${imageCount !== 1 ? 's' : ''}
                </td>
            </tr>
            </thead>    
    `;
    
    // Primary - Always "Attention" with total attention score
    const totalAttentionScore = classificationResult.totalAttentionScore || 0;
    const primaryAttentionTime = totalAttentionScore * timeSpentMs;
    
    outputHTML += `
        <tr>
            <th class="primary" colspan="2">
                <b>Attention</b>
                ${formatTimeSpent(primaryAttentionTime)}${asterisk}
            </th>
            <td class="secondary">
                Total time spent
                ${formatTimeSpent(timeSpentMs)}
            </td>
        </tr>
        <tr class="thick-row">
            <td colspan="3" class="small-info">
                <b>Attention (time)</b>
            </td>
        </tr>
    `;

    // Components - Process each ingredient category in fixed order
    const categoryOrder = ['Education', 'Entertainment', 'Emotion'];
    
    for (const categoryName of categoryOrder) {
        const categoryData = classificationResult[categoryName];
        if (!categoryData) continue;
        
        const categoryScore = categoryData.totalScore || 0;
        const categoryAttentionTime = categoryScore * timeSpentMs;
        
        outputHTML += `
            <tr>
                <th colspan="2">
                    <b>${categoryName}</b>
                    ${categoryScore.toFixed(1)}${asterisk}
                </th>
                <td>
                    <b>${formatTimeSpent(categoryAttentionTime)}${asterisk}</b>
                </td>
            </tr>
        `;

        // SubComponents - Process each subcategory
        if (categoryData.subcategories) {
            for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
                const subcategoryScore = subcategoryData.score || 0;
                const subcategoryAttentionTime = subcategoryScore * timeSpentMs;
                
                outputHTML += `
                    <tr>
                        <td class="blank-cell">
                        </td>
                        <th class="subcomponent">
                            ${subcategoryName}
                            ${subcategoryScore.toFixed(1)}${asterisk}
                        </th>
                        <td class="subcomponent">
                            ${formatTimeSpent(subcategoryAttentionTime)}${asterisk}
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
        ${!isComplete ? '<p class="small-info" id="processing-notice">* Content still being processed and will update automatically</p>' : ''}
        </section>
    `;

    return outputHTML;
}
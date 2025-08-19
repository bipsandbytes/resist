/* Credit: https://codepen.io/chriscoyier/pen/ApavyZ */

export function nutritionFactsOverlay(classificationResult, timeSpentMs, postState = 'complete') {
    // Get the current time spent directly from the tweet node (in milliseconds)
    // Convert to seconds for calculations
    const timeSpent = timeSpentMs / 1000;
    
    // Check if classification is complete
    const isComplete = postState === 'complete';
    const asterisk = isComplete ? '' : ' *';
    
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
                About 25 words, 1 image
                </td>
            </tr>
            </thead>    
    `;
    
    // Primary - Always "Attention" with total attention score
    const totalAttentionScore = classificationResult.totalAttentionScore || 0;
    const primaryAttentionTime = totalAttentionScore * timeSpent;
    
    outputHTML += `
        <tr>
            <th class="primary" colspan="2">
                <b>Attention</b>
                ${primaryAttentionTime.toFixed(0)}s${asterisk}
            </th>
            <td class="secondary">
                Total time spent
                ${timeSpent.toFixed(0)}s
            </td>
        </tr>
        <tr class="thick-row">
            <td colspan="3" class="small-info">
                <b>Attention (time)</b>
            </td>
        </tr>
    `;

    // Components - Process each ingredient category
    for (const [categoryName, categoryData] of Object.entries(classificationResult)) {
        if (categoryName === 'totalAttentionScore') continue;
        
        const categoryScore = categoryData.totalScore || 0;
        const categoryAttentionTime = categoryScore * timeSpent;
        
        outputHTML += `
            <tr>
                <th colspan="2">
                    <b>${categoryName}</b>
                    ${categoryScore.toFixed(1)}${asterisk}
                </th>
                <td>
                    <b>${categoryAttentionTime.toFixed(0)}s${asterisk}</b>
                </td>
            </tr>
        `;

        // SubComponents - Process each subcategory
        if (categoryData.subcategories) {
            for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
                const subcategoryScore = subcategoryData.score || 0;
                const subcategoryAttentionTime = subcategoryScore * timeSpent;
                
                outputHTML += `
                    <tr>
                        <td class="blank-cell">
                        </td>
                        <th class="subcomponent">
                            ${subcategoryName}
                            ${subcategoryScore.toFixed(1)}${asterisk}
                        </th>
                        <td class="subcomponent">
                            ${subcategoryAttentionTime.toFixed(1)}s${asterisk}
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
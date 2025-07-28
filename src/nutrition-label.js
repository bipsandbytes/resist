/* Credit: https://codepen.io/chriscoyier/pen/ApavyZ */

export function nutritionFactsTemplate(json, timeSpentMs) {
    // Get the current time spent directly from the tweet node (in milliseconds)
    // Convert to seconds for calculations
    const timeSpent = timeSpentMs / 1000;
    
    var outputHTML = `
        <section class="performance-facts">
        <header class="performance-facts__header">
            <h1 class="performance-facts__title">Information Facts</h1>
        </header>
    `;
    
    /*
    // Add debug info at the top if it exists
    if (debugInfo) {
        outputHTML += `
            <div style="
                margin-bottom: 10px;
                padding: 8px;
                background: #f8f8f8;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                color: #666;
                max-height: 200px;
                overflow-y: auto;
            ">
                <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Debug Information</div>
        `;
        
        // Last classify text
        if (debugInfo.lastClassifyText) {
            const truncatedText = debugInfo.lastClassifyText.length > 100 
                ? debugInfo.lastClassifyText.substring(0, 100) + '...' 
                : debugInfo.lastClassifyText;
            outputHTML += `
                <div style="margin-bottom: 3px;">
                    <strong>Last Classify Text:</strong> ${truncatedText}
                </div>
            `;
        }
        
        // OCR results
        if (debugInfo.ocrResults && debugInfo.ocrResults.length > 0) {
            outputHTML += `
                <div style="margin-bottom: 3px;">
                    <strong>OCR Results (${debugInfo.ocrResults.length}):</strong>
                </div>
            `;
            debugInfo.ocrResults.forEach((ocr, index) => {
                const truncatedText = ocr.text.length > 50 
                    ? ocr.text.substring(0, 50) + '...' 
                    : ocr.text;
                outputHTML += `
                    <div style="margin-left: 10px; margin-bottom: 2px;">
                        ${index + 1}. ${truncatedText}
                    </div>
                `;
            });
        }
        
        // Analysis timing
        if (debugInfo.analysisDuration) {
            outputHTML += `
                <div style="margin-bottom: 3px;">
                    <strong>Analysis Time:</strong> ${debugInfo.analysisDuration}ms
                </div>
            `;
        }
        
        // Task pipeline status
        if (debugInfo.taskPipeline) {
            const completedTasks = debugInfo.taskPipeline.filter(task => task.state === 'complete').length;
            const totalTasks = debugInfo.taskPipeline.length;
            outputHTML += `
                <div style="margin-bottom: 3px;">
                    <strong>Tasks:</strong> ${completedTasks}/${totalTasks} completed
                </div>
            `;
        }
        
        // Analysis status
        if (debugInfo.analysisStatus) {
            outputHTML += `
                <div style="margin-bottom: 3px;">
                    <strong>Status:</strong> ${debugInfo.analysisStatus}
                </div>
            `;
        }
        
        outputHTML += `</div>`;
    }
    */
    outputHTML += `
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
    
    // Check if analysis is still in progress
    const isPartial = debugInfo && debugInfo.analysisStatus === 'partial';
    const asterisk = isPartial ? '*' : '';
    
    const primaryAttentionTime = json.Primary.Value * timeSpent;
    // Primary and secondary
    outputHTML += `
        <tr>
            <th class="primary" colspan="2">
                <b>${json.Primary.Name}</b>
                ${primaryAttentionTime.toFixed(0)}s
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

    // Components
    for (const component of json.Components) {
        // Calculate attention time: category score * time spent
        const attentionTime = component.Value * timeSpent;
        
        outputHTML += `
            <tr>
                <th colspan="2">
                    <b>${component.Name}</b>
                    ${component.Value.toFixed(1)}${asterisk}
                </th>
                <td>
                    <b>${attentionTime.toFixed(0)}s</b>
                </td>
            </tr>
        `;

        // SubComponents
        for (const subComponent of component.SubComponents) {
            // if (!subComponent.Value || subComponent.Value < 0.5) continue;
            // Calculate attention time for subcomponent: subcomponent score * time spent
            const subAttentionTime = subComponent.Value * timeSpent;
            
            outputHTML += `
                <tr>
                    <td class="blank-cell">
                    </td>
                    <th class="subcomponent">
                        ${subComponent.Name}
                        ${subComponent.Value.toFixed(1)}
                    </th>
                    <td class="subcomponent">
                        ${subAttentionTime.toFixed(1)}s
                    </td>
                </tr>
            `;
        }
    }
    
    outputHTML += `
            <tr class="thick-row">
                <td colspan="3"></td>
            </tr>
        </tbody>
        </table>
        ${isPartial ? '<p class="small-info" id="processing-notice">* Content still being processed and will update automatically</p>' : ''}
        </section>
    `;

    return outputHTML;
}

export function nutritionFactsOverlay(classificationResult, timeSpentMs) {
    // Get the current time spent directly from the tweet node (in milliseconds)
    // Convert to seconds for calculations
    const timeSpent = timeSpentMs / 1000;
    
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
                ${primaryAttentionTime.toFixed(0)}s
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
                    ${categoryScore.toFixed(1)}
                </th>
                <td>
                    <b>${categoryAttentionTime.toFixed(0)}s</b>
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
                            ${subcategoryScore.toFixed(1)}
                        </th>
                        <td class="subcomponent">
                            ${subcategoryAttentionTime.toFixed(1)}s
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
        </section>
    `;

    return outputHTML;
}
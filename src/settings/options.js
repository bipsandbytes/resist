const loadContentFromStorage = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['content'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                // filter out content that hasn't been seen yet by the user i.e. timeSpent is 0
                const content = Object.values(result.content || {}).filter(item => item.timeSpent);
                resolve(content);
            }
        });
    });
};

// Helper function to format time spent in minutes
const formatTimeSpent = (milliseconds) => {
    if (!milliseconds || milliseconds === 0) return '-';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (minutes === 0) {
        return `${seconds}s`;
    } else if (seconds === 0) {
        return `${minutes}m`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
};

// Helper function to format time nicely
const formatTimeAgo = (timeString) => {
    if (!timeString) return 'Unknown';
    
    try {
        const time = new Date(timeString);
        if (isNaN(time.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 300) { // Less than 5 minutes (300 seconds)
            if (diffInSeconds < 60) {
                return 'Just now';
            } else {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            }
        } else {
            // More than 5 minutes ago - return formatted date and time
            const options = {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            return time.toLocaleDateString('en-US', options);
        }
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Unknown';
    }
};


// Function to delete content from storage and refresh table
const deleteContent = (contentId) => {
    console.log('Deleting content with ID:', contentId);
    
    // Remove from chrome.storage.local
    chrome.storage.local.get(['content'], function(result) {
        if (result.content && result.content[contentId]) {
            delete result.content[contentId];
            
            chrome.storage.local.set({ content: result.content }, function() {
                console.log('Content deleted successfully');
                // Refresh the table to show updated data
                paintLatestContentTable();
                // update total attention chart
                paintTotalAttentionChart();
            });
        } else {
            console.error('Content not found with ID:', contentId);
        }
    });
    // createTotalAttentionChart();
};

// Function to aggregate consolidated scores for a given time range
const aggregateConsolidatedScores = async (startTime, endTime) => {
    console.log('Aggregating scores for:', startTime, endTime);
    
    try {
        const content = await loadContentFromStorage();
        console.log('Loaded content for aggregation:', content);
        
        if (!content || Object.keys(content).length === 0) {
            return {
                totalItems: 0,
                totalScores: {},
                timeRange: { start: startTime, end: endTime }
            };
        }
        
        let totalItems = 0;
        let totalScores = {};
        
        // Iterate through all content items
        Object.values(content).forEach(contentItem => {
            if (!contentItem.time) return;
            
            const contentTime = new Date(contentItem.time).getTime();
            
            // Check if content is within the specified time range
            if (contentTime >= startTime.getTime() && contentTime <= endTime.getTime()) {
                totalItems++;
                
                // Aggregate consolidated scores
                if (contentItem.consolidated_scores) {
                    Object.keys(contentItem.consolidated_scores).forEach(scoreType => {
                        const score = contentItem.consolidated_scores[scoreType];
                        
                        // Initialize if not exists
                        if (!totalScores[scoreType]) {
                            totalScores[scoreType] = 0;
                        }
                        
                        // Add to running total
                        totalScores[scoreType] += score;
                    });
                }
            }
        });
        
        const r = {
            totalItems,
            totalScores,
            timeRange: { start: startTime, end: endTime }
        };
        
        console.log('Aggregated scores:', r);
        return r;
        
    } catch (error) {
        console.error('Error aggregating scores:', error);
        return {
            totalItems: 0,
            totalScores: {},
            timeRange: { start: startTime, end: endTime }
        };
    }
};

document.addEventListener('DOMContentLoaded', function () {
    
    paintTotalAttentionChart();
    paintLatestContentTable();
    
    // Add event listener for time range selection
    const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range');
    if (selectTotalAttentionTimeRange) {
        selectTotalAttentionTimeRange.addEventListener('change', function() {
            console.log('Time range changed to:', this.value);
            paintTotalAttentionChart();
        });
    }
    
    const educationInput = document.getElementById('education-budget');
    const entertainmentInput = document.getElementById('entertainment-budget');
    const emotionInput = document.getElementById('emotion-budget');
    const presetLinks = [
      document.getElementById('preset-focussed'),
      document.getElementById('preset-relaxed'),
      document.getElementById('preset-revolutionary'),
      document.getElementById('preset-custom')
    ];
    function setFieldsDisabled(disabled) {
      educationInput.disabled = disabled;
      entertainmentInput.disabled = disabled;
      emotionInput.disabled = disabled;
    }
    function setSelected(link) {
      presetLinks.forEach(l => l.classList.remove('preset-selected'));
      link.classList.add('preset-selected');
      
      // Enable/disable reset button based on selection
      const resetButton = document.getElementById('reset-budgets');
      if (resetButton) {
        resetButton.disabled = !link.id.includes('custom');
      }
    }
    // Load existing budgets and populate Custom option
    loadBudgetsFromStorage().then(() => {
      // Start with Custom selected and fields enabled
      setSelected(document.getElementById('preset-custom'));
      setFieldsDisabled(false);
    });

    document.getElementById('preset-focussed').addEventListener('click', function(e) {
      e.preventDefault();
      educationInput.value = 60;
      entertainmentInput.value = 10;
      emotionInput.value = 20;
      setFieldsDisabled(true);
      setSelected(this);
      educationInput.dispatchEvent(new Event('input'));
      entertainmentInput.dispatchEvent(new Event('input'));
      emotionInput.dispatchEvent(new Event('input'));
    });
    document.getElementById('preset-relaxed').addEventListener('click', function(e) {
      e.preventDefault();
      educationInput.value = 20;
      entertainmentInput.value = 60;
      emotionInput.value = 10;
      setFieldsDisabled(true);
      setSelected(this);
      educationInput.dispatchEvent(new Event('input'));
      entertainmentInput.dispatchEvent(new Event('input'));
      emotionInput.dispatchEvent(new Event('input'));
    });
    document.getElementById('preset-revolutionary').addEventListener('click', function(e) {
      e.preventDefault();
      educationInput.value = 20;
      entertainmentInput.value = 10;
      emotionInput.value = 60;
      setFieldsDisabled(true);
      setSelected(this);
      educationInput.dispatchEvent(new Event('input'));
      entertainmentInput.dispatchEvent(new Event('input'));
      emotionInput.dispatchEvent(new Event('input'));
    });
    document.getElementById('preset-custom').addEventListener('click', function(e) {
      e.preventDefault();
      setFieldsDisabled(false);
      setSelected(this);
      educationInput.focus();
    });
    
    
    
    // Add storage change listener to update chart and table when content changes
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local' && changes.content) {
            console.log('Content storage changed, updating chart and table');
            paintTotalAttentionChart();
            paintLatestContentTable();
            updateBudgetConsumptionStats();
        }
        if (namespace === 'local' && changes.budgets) {
            console.log('Budgets changed, updating consumption stats');
            updateBudgetConsumptionStats();
        }
    });
    
    // midnight to now
    const startTime = new Date(new Date().setHours(0, 0, 0, 0));
    const endTime = new Date();
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    aggregateConsolidatedScores(startTime, endTime);
    
    // Initialize budget form functionality
    initializeBudgetForm();
    
    // Initialize filters form functionality
    initializeFiltersForm();
    
    // Update budget consumption stats
    updateBudgetConsumptionStats();
    
    
});

function paintTotalAttentionChart() {
    // Wait for ECharts to be available
    if (!window.echarts) {
        console.log('ECharts not available yet, retrying...');
        setTimeout(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, 100);
        return;
    }
    
    const chartEl = document.querySelector('.echart-hero');
    console.log('chartEl:', chartEl);
    if (!chartEl) return;
    
    // Get the default options from the existing chart initialization
    const { getColor, toggleColor } = window.phoenix.utils;
    const getDefaultOptions = () => ({
        tooltip: {
            trigger: 'item',
            padding: [7, 10],
            backgroundColor: getColor('body-highlight-bg'),
            borderColor: getColor('border-color'),
            textStyle: { color: getColor('light-text-emphasis') },
            borderWidth: 1,
            position: (...params) => handleTooltipPosition(params),
            transitionDuration: 0,
            formatter: params => {
                return `<strong>${params.seriesName}:</strong> ${params.value}%`;
            },
            extraCssText: 'z-index: 1000'
        },
        legend: { show: false },
        series: [
            {
                type: 'gauge',
                center: ['50%', '60%'],
                name: 'Paying customer',
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 100,
                splitNumber: 12,
                itemStyle: {
                    color: getColor('primary')
                },
                progress: {
                    show: true,
                    roundCap: true,
                    width: 24,
                    itemStyle: {
                        shadowBlur: 0,
                        shadowColor: '#0000'
                    }
                },
                pointer: {
                    show: true,
                    itemStyle: {
                        color: 'auto'
                    },
                },
                axisLine: {
                    roundCap: true,
                    lineStyle: {
                        width: 24,
                        color: [
                            [0, getColor('success')],
                            [0.5, getColor('warning')],
                            [1, getColor('danger')]
                        ]
                    }
                },
                axisTick: {
                    show: true
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                title: {
                    show: false
                },
                detail: {
                    show: true,
                    formatter: '{value}%'
                },
                data: [
                    {
                        value: 60
                    }
                ]
            }
        ]
    });
    
    const options = getDefaultOptions();
    const chart = window.echarts.init(chartEl);
    chart.setOption(options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
        chart.resize();
    });
    
    
    /*
    const getDefaultOptions = () => ({
        legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
    },
    series: [
    {
    name: 'Attention required',
    type: 'pie',
    radius: ['48%', '90%'],
    startAngle: 30,
    avoidLabelOverlap: false,
    label: {
    show: false,
    position: 'center',
    formatter: '{x|{d}%} \n {y|{b}}',
    rich: {
    x: {
    fontSize: 31.25,
    fontWeight: 800,
    color: getColor('tertiary-color'),
    padding: [0, 0, 5, 15]
    },
    y: {
    fontSize: 12.8,
    color: getColor('tertiary-color'),
    fontWeight: 600
    }
    }
    },
    emphasis: {
    label: {
    show: true
    }
    },
    labelLine: {
    show: false
    },
    }
    ]
    });
    
    // determine time range based on select-total-attention-time-range
    const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range');
    const timeRange = selectTotalAttentionTimeRange.value;
    console.log('timeRange:', timeRange);
    let startTime, endTime;
    if (timeRange === 'Today') {
    startTime = new Date(new Date().setHours(0, 0, 0, 0));
    endTime = new Date();
    } else if (timeRange === 'This week') {
    startTime = new Date(new Date().setDate(new Date().getDate() - 7));
    endTime = new Date();
    } else if (timeRange === 'This month') {
    startTime = new Date(new Date().setMonth(new Date().getMonth() - 1));
    endTime = new Date();
    }
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    aggregateConsolidatedScores(startTime, endTime).then(result => {
        console.log('result:', result);
    const chartData = [];
    for (const [key, value] of Object.entries(result.totalScores)) {
    if (key === 'Attention') continue;
    chartData.push({ value: value, name: key });
    }
    const options = getDefaultOptions();
    // chartData = [
    //             { value: 4, name: 'Education' },
    //             { value: 20, name: 'Entertainment' },
    //             { value: 15, name: 'Emotion' },
    //         ];
    options.series[0].data = chartData;
    console.log('options:', options);
    
    const chart = window.echarts.init(chartEl);
    chart.setOption(options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
        chart.resize();
    });
    });
    */
}

async function paintLatestContentTable() {
    const tableEl = document.querySelector('#table-latest-content');
    if (!tableEl) return;
    
    // Clear any existing content
    tableEl.innerHTML = '';
    
    try {
        // Load content using the promise-based function
        const content = await loadContentFromStorage();
        console.log('Loaded content for table:', content);
        
        if (!content || Object.keys(content).length === 0) {
            console.log('no content found');
            return;
        }
        
        const rows = [];
        Object.keys(content).forEach(key => {
            const contentItem = content[key];
            rows.push({
                content: contentItem.src || 'unknown',
                author: contentItem.author || 'unknown',
                source: contentItem.source || 'unknown',
                attention: contentItem.consolidated_scores ? contentItem.consolidated_scores.Attention : 0,
                time: contentItem.time || new Date(),
                timeSpent: contentItem.timeSpent || 0, // Keep raw milliseconds for sorting
                timeSpentFormatted: formatTimeSpent(contentItem.timeSpent || 0), // Formatted for display
                id: key,
            });
        });
        
        rows.forEach(row => {
            const rowEl = document.createElement('tr');
            rowEl.className = 'position-static';
            
            // Store the original timestamp for sorting
            if (row.time) {
                rowEl.setAttribute('data-original-time', row.time);
            }
            
            rowEl.innerHTML = `
            <td class="align-middle white-space-nowrap content" style="width:50%;"><a class="fw-semibold" href="${row.content}" target="_blank">${row.content}</a></td>
            <td class="align-middle white-space-nowrap author" style="width:20%;"><a class="d-flex align-items-center text-body" href="apps/e-commerce/landing/profile.html">
                <h6 class="mb-0 ms-3 text-body">${row.author}</h6>
            </a></td>
                         <td class="align-middle timeSpent" style="width:10%;">
                 <p class="fs-9 fw-semibold text-body-highlight mb-0">
                     <span style="display:none;">${row.timeSpent}</span>
                     ${row.timeSpentFormatted}
                 </p>
             </td>
            <td class="align-middle text-end attention white-space-nowrap" style="width:10%;">
                <div class="hover-hide">
                <h6 class="text-body-highlight mb-0">${row.attention}</h6>
                </div>
            </td>
            <td class="align-middle text-end time white-space-nowrap" style="width:10%;">
                <div class="hover-hide">
                <h6 class="text-body-highlight mb-0">
                    <span style="display:none;">${row.time ? new Date(row.time).getTime() : 0}</span>
                    ${formatTimeAgo(row.time)}
                </h6>
                </div>
            </td>
            <td class="align-middle white-space-nowrap text-end pe-0">
                <button class="btn btn-sm btn-phoenix-secondary fs-10" data-id="${row.id}"><span class="fas fa-trash"></span></button>
            </td>
        `;
            tableEl.appendChild(rowEl);
        });
        
        // Add click event listeners to trash buttons
        const trashButtons = tableEl.querySelectorAll('button[data-id]');
        trashButtons.forEach(button => {
            button.addEventListener('click', function() {
                const contentId = this.getAttribute('data-id');
                deleteContent(contentId);
            });
        });
        
        console.log('Table populated with', rows.length, 'rows');
        
        // Initialize List.js manually after table is populated
        initializeListJS();
    } catch (error) {
        console.error('Error loading content for table:', error);
    }
}

// Helper functions from phoenix.js
const camelize = (str) => {
    const text = str.replace(/[-_\s.]+(.)?/g, (_, c) =>
        c ? c.toUpperCase() : ''
);
return `${text.substr(0, 1).toLowerCase()}${text.substr(1)}`;
};

const getData = (el, data) => {
    try {
        return JSON.parse(el.dataset[camelize(data)]);
    } catch (e) {
        return el.dataset[camelize(data)];
    }
};

const togglePaginationButtonDisable = (button, disabled) => {
    button.disabled = disabled;
    button.classList[disabled ? 'add' : 'remove']('disabled');
};

// List.js initialization function
const initializeListJS = () => {
    if (window.List) {
        const lists = document.querySelectorAll('[data-list]');
        
        if (lists.length) {
            lists.forEach(el => {
                const bulkSelect = el.querySelector('[data-bulk-select]');
                
                let options = getData(el, 'list');
                
                
                
                if (options.pagination) {
                    options = {
                        ...options,
                        pagination: {
                            item: `<li><button class='page' type='button'></button></li>`,
                            ...options.pagination
                        }
                    };
                }
                
                const paginationButtonNext = el.querySelector(
                    '[data-list-pagination="next"]'
                );
                const paginationButtonPrev = el.querySelector(
                    '[data-list-pagination="prev"]'
                );
                const viewAll = el.querySelector('[data-list-view="*"]');
                const viewLess = el.querySelector('[data-list-view="less"]');
                const listInfo = el.querySelector('[data-list-info]');
                const listFilter = el.querySelector('[data-list-filter]');
                const list = new List(el, options);
                
                // ---------------------------------------
                
                let totalItem = list.items.length;
                const itemsPerPage = list.page;
                const btnDropdownClose = list.listContainer.querySelector('.btn-close');
                let pageQuantity = Math.ceil(list.size() / list.page);
                let pageCount = 1;
                let numberOfcurrentItems =
                (pageCount - 1) * Number(list.page) + list.visibleItems.length;
                let isSearching = false;
                
                btnDropdownClose &&
                btnDropdownClose.addEventListener('search.close', () => {
                    list.fuzzySearch('');
                });
                
                const updateListControls = () => {
                    listInfo &&
                    (listInfo.innerHTML = `${list.i} to ${numberOfcurrentItems} <span class='text-body-tertiary'> Items of </span>${totalItem}`);
                    
                    paginationButtonPrev &&
                    togglePaginationButtonDisable(
                        paginationButtonPrev,
                        pageCount === 1 || pageCount === 0
                    );
                    paginationButtonNext &&
                    togglePaginationButtonDisable(
                        paginationButtonNext,
                        pageCount === pageQuantity || pageCount === 0
                    );
                    
                    if (pageCount > 1 && pageCount < pageQuantity) {
                        togglePaginationButtonDisable(paginationButtonNext, false);
                        togglePaginationButtonDisable(paginationButtonPrev, false);
                    }
                };
                
                // List info
                updateListControls();
                
                if (paginationButtonNext) {
                    paginationButtonNext.addEventListener('click', e => {
                        e.preventDefault();
                        pageCount += 1;
                        const nextInitialIndex = list.i + itemsPerPage;
                        nextInitialIndex <= list.size() &&
                        list.show(nextInitialIndex, itemsPerPage);
                    });
                }
                
                if (paginationButtonPrev) {
                    paginationButtonPrev.addEventListener('click', e => {
                        e.preventDefault();
                        pageCount -= 1;
                        const prevItem = list.i - itemsPerPage;
                        prevItem > 0 && list.show(prevItem, itemsPerPage);
                    });
                }
                
                const toggleViewBtn = () => {
                    viewLess.classList.toggle('d-none');
                    viewAll.classList.toggle('d-none');
                };
                
                if (viewAll) {
                    viewAll.addEventListener('click', () => {
                        list.show(1, totalItem);
                        pageCount = 1;
                        toggleViewBtn();
                    });
                }
                if (viewLess) {
                    viewLess.addEventListener('click', () => {
                        list.show(1, itemsPerPage);
                        pageCount = 1;
                        toggleViewBtn();
                    });
                }
                // numbering pagination
                if (options.pagination) {
                    el.querySelector('.pagination').addEventListener('click', e => {
                        if (e.target.classList[0] === 'page') {
                            const pageNum = Number(e.target.getAttribute('data-i'));
                            if (pageNum) {
                                list.show(itemsPerPage * (pageNum - 1) + 1, list.page);
                                pageCount = pageNum;
                            }
                        }
                    });
                }
                // filter
                if (options.filter) {
                    const { key } = options.filter;
                    listFilter.addEventListener('change', e => {
                        list.filter(item => {
                            if (e.target.value === '') {
                                return true;
                            }
                            pageQuantity = Math.ceil(list.matchingItems.length / list.page);
                            pageCount = 1;
                            updateListControls();
                            return item
                            .values()
                            [key].toLowerCase()
                            .includes(e.target.value.toLowerCase());
                        });
                    });
                }
                
                // bulk-select
                if (bulkSelect) {
                    const bulkSelectInstance =
                    window.phoenix.BulkSelect.getInstance(bulkSelect);
                    bulkSelectInstance.attachRowNodes(
                        list.items.map(item =>
                            item.elm.querySelector('[data-bulk-select-row]')
                        )
                    );
                    
                    bulkSelect.addEventListener('change', () => {
                        if (list) {
                            if (bulkSelect.checked) {
                                list.items.forEach(item => {
                                    item.elm.querySelector(
                                        '[data-bulk-select-row]'
                                    ).checked = true;
                                });
                            } else {
                                list.items.forEach(item => {
                                    item.elm.querySelector(
                                        '[data-bulk-select-row]'
                                    ).checked = false;
                                });
                            }
                        }
                    });
                }
                
                list.on('searchStart', () => {
                    isSearching = true;
                });
                list.on('searchComplete', () => {
                    isSearching = false;
                });
                
                list.on('updated', item => {
                    if (!list.matchingItems.length) {
                        pageQuantity = Math.ceil(list.size() / list.page);
                    } else {
                        pageQuantity = Math.ceil(list.matchingItems.length / list.page);
                    }
                    numberOfcurrentItems =
                    (pageCount - 1) * Number(list.page) + list.visibleItems.length;
                    updateListControls();
                    
                    // -------search-----------
                    if (isSearching) {
                        if (list.matchingItems.length === 0) {
                            pageCount = 0;
                        } else {
                            pageCount = 1;
                        }
                        totalItem = list.matchingItems.length;
                        numberOfcurrentItems =
                        (pageCount === 0 ? 1 : pageCount - 1) * Number(list.page) +
                        list.visibleItems.length;
                        
                        updateListControls();
                        listInfo &&
                        (listInfo.innerHTML = `${
                            list.matchingItems.length === 0 ? 0 : list.i
                        } to ${
                            list.matchingItems.length === 0 ? 0 : numberOfcurrentItems
                        } <span class='text-body-tertiary'> Items of </span>${
                            list.matchingItems.length
                        }`);
                    }
                    
                    // -------fallback-----------
                    const fallback =
                    el.querySelector('.fallback') ||
                    document.getElementById(options.fallback);
                    
                    if (fallback) {
                        if (item.matchingItems.length === 0) {
                            fallback.classList.remove('d-none');
                        } else {
                            fallback.classList.add('d-none');
                        }
                    }
                });
            });
        }
    }
};

// Budget form functionality
const initializeBudgetForm = () => {
    const form = document.getElementById('budget-form');
    const educationInput = document.getElementById('education-budget');
    const entertainmentInput = document.getElementById('entertainment-budget');
    const emotionInput = document.getElementById('emotion-budget');
    const totalDisplay = document.getElementById('total-budget-display');
    const resetButton = document.getElementById('reset-budgets');
    
    if (!form) return;
    
    // Load existing budgets from storage
    loadBudgetsFromStorage();
    
    // Update total when any input changes
    [educationInput, entertainmentInput, emotionInput].forEach(input => {
        input.addEventListener('input', updateTotalBudget);
    });
    
    // Handle form submission
    form.addEventListener('submit', handleBudgetSubmit);
    
    // Handle reset button
    resetButton.addEventListener('click', resetBudgets);
    
    // Initial total update
    updateTotalBudget();
};

const loadBudgetsFromStorage = async () => {
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['budgets'], function(result) {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(result);
                }
            });
        });
        
        const budgets = result.budgets || {};
        
        // Set form values
        document.getElementById('education-budget').value = budgets.education || '';
        document.getElementById('entertainment-budget').value = budgets.entertainment || '';
        document.getElementById('emotion-budget').value = budgets.emotion || '';
        
        updateTotalBudget();
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
};

const updateTotalBudget = () => {
    const education = parseInt(document.getElementById('education-budget').value) || 0;
    const entertainment = parseInt(document.getElementById('entertainment-budget').value) || 0;
    const emotion = parseInt(document.getElementById('emotion-budget').value) || 0;
    
    const total = education + entertainment + emotion;
    document.getElementById('total-budget-display').textContent = `${total} minutes`;
    
    // Update total display color based on value
    const totalDisplay = document.getElementById('total-budget-display');
    if (total === 0) {
        totalDisplay.className = 'text-body-tertiary mb-0';
    } else if (total > 480) { // More than 8 hours
        totalDisplay.className = 'text-danger mb-0 fw-semibold';
    } else if (total > 240) { // More than 4 hours
        totalDisplay.className = 'text-warning mb-0 fw-semibold';
    } else {
        totalDisplay.className = 'text-success mb-0 fw-semibold';
    }
};

const handleBudgetSubmit = async (event) => {
    event.preventDefault();
    
    const budgets = {
        education: parseInt(document.getElementById('education-budget').value) || 0,
        entertainment: parseInt(document.getElementById('entertainment-budget').value) || 0,
        emotion: parseInt(document.getElementById('emotion-budget').value) || 0
    };
    
    try {
        await new Promise((resolve, reject) => {
            chrome.storage.local.set({ budgets }, function() {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
        
        // Show success feedback
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="fas fa-check me-2"></span>Saved!';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 2000);
        
        console.log('Budgets saved successfully:', budgets);
    } catch (error) {
        console.error('Error saving budgets:', error);
        
        // Show error feedback
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="fas fa-exclamation-triangle me-2"></span>Error!';
        submitButton.className = 'btn btn-danger';
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.className = 'btn btn-primary';
        }, 2000);
    }
};

const resetBudgets = () => {
    // Only allow reset when Custom is selected
    const customPreset = document.getElementById('preset-custom');
    if (!customPreset.classList.contains('preset-selected')) {
        return;
    }
    
    // Revert to stored budgets
    loadBudgetsFromStorage();
};

// Function to calculate and update budget consumption stats
const updateBudgetConsumptionStats = async () => {
    try {
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        // Load content and budgets
        const [content, budgets] = await Promise.all([
            loadContentFromStorage(),
            loadBudgetsFromStoragePromise()
        ]);
        
        // Calculate consumption for today
        const consumption = calculateDailyConsumption(content, startOfDay, endOfDay);
        
        // Update the dashboard stats
        updateDashboardStats(consumption, budgets);
        
    } catch (error) {
        console.error('Error updating budget consumption stats:', error);
    }
};

// Function to load budgets as a promise
const loadBudgetsFromStoragePromise = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['budgets'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.budgets || {});
            }
        });
    });
};

// Function to calculate daily consumption
const calculateDailyConsumption = (content, startTime, endTime) => {
    const consumption = {
        education: 0,
        entertainment: 0,
        emotion: 0
    };
    
    content.forEach(item => {
        if (!item.time) return;
        
        const contentTime = new Date(item.time).getTime();
        if (contentTime >= startTime.getTime() && contentTime <= endTime.getTime()) {
            if (item.consolidated_scores) {
                // Convert attention scores to minutes (assuming 1 attention point = 1 minute)
                const educationScore = (item.consolidated_scores['Education'] || 0); // Convert to minutes
                const entertainmentScore = (item.consolidated_scores['Entertainment'] || 0);
                const emotionScore = (item.consolidated_scores['Emotion'] || 0);
                
                consumption.education += educationScore;
                consumption.entertainment += entertainmentScore;
                consumption.emotion += emotionScore;
            }
        }
    });
    
    return consumption;
};

// Function to update dashboard stats
const updateDashboardStats = (consumption, budgets) => {
    const statsContainer = document.getElementById('budgets-summary-quick-stats');
    if (!statsContainer) return;
    
    // Calculate percentages
    const educationPercent = budgets.education ? Math.round((consumption.education / budgets.education) * 100) : 0;
    const entertainmentPercent = budgets.entertainment ? Math.round((consumption.entertainment / budgets.entertainment) * 100) : 0;
    const emotionPercent = budgets.emotion ? Math.round((consumption.emotion / budgets.emotion) * 100) : 0;
    
    // Update education stat
    const educationStat = statsContainer.querySelector('.col-12.col-md-auto:nth-child(1) h4');
    const educationText = statsContainer.querySelector('.col-12.col-md-auto:nth-child(1) p');
    const educationIcon = statsContainer.querySelector('.fa-graduation-cap');
    console.log('educationIcon', educationIcon);
    // educationIcon.style.color = 'lightgray';
    if (educationStat) {
        educationStat.textContent = `${educationPercent}%`;
        // Update color based on consumption
        if (educationPercent >= 100) {
            educationStat.className = 'mb-0 text-danger';
            if (educationIcon) educationIcon.className = 'fa-solid fa-stack-2x fa-graduation-cap text-danger';
        } else if (educationPercent >= 80) {
            educationStat.className = 'mb-0 text-warning';
            if (educationIcon) educationIcon.className = 'fa-solid fa-stack-2x fa-graduation-cap text-warning';
        } else {
            educationStat.className = 'mb-0 text-success';
            if (educationIcon) educationIcon.className = 'fa-solid fa-stack-2x fa-graduation-cap text-success';
        }
    }
    
    // Update entertainment stat
    const entertainmentStat = statsContainer.querySelector('.col-12.col-md-auto:nth-child(2) h4');
    const entertainmentText = statsContainer.querySelector('.col-12.col-md-auto:nth-child(2) p');
    const entertainmentIcon = statsContainer.querySelector('.col-12.col-md-auto:nth-child(2) .fa-ticket');
    if (entertainmentStat) {
        entertainmentStat.textContent = `${entertainmentPercent}%`;
        // Update color based on consumption
        if (entertainmentPercent >= 100) {
            entertainmentStat.className = 'mb-0 text-danger';
            if (entertainmentIcon) entertainmentIcon.className = 'fa-solid fa-stack-2x fa-ticket text-danger';
        } else if (entertainmentPercent >= 80) {
            entertainmentStat.className = 'mb-0 text-warning';
            if (entertainmentIcon) entertainmentIcon.className = 'fa-solid fa-stack-2x fa-ticket text-warning';
        } else {
            entertainmentStat.className = 'mb-0 text-success';
            if (entertainmentIcon) entertainmentIcon.className = 'fa-solid fa-stack-2x fa-ticket text-success';
        }
    }
    
    // Update emotion stat
    const emotionStat = statsContainer.querySelector('.col-12.col-md-auto:nth-child(3) h4');
    const emotionText = statsContainer.querySelector('.col-12.col-md-auto:nth-child(3) p');
    const emotionIcon = statsContainer.querySelector('.col-12.col-md-auto:nth-child(3) .fa-heart');
    if (emotionStat) {
        emotionStat.textContent = `${emotionPercent}%`;
        // Update color based on consumption
        if (emotionPercent >= 100) {
            emotionStat.className = 'mb-0 text-danger';
            if (emotionIcon) emotionIcon.className = 'fa-solid fa-stack-2x fa-heart text-danger';
        } else if (emotionPercent >= 80) {
            emotionStat.className = 'mb-0 text-warning';
            if (emotionIcon) emotionIcon.className = 'fa-solid fa-stack-2x fa-heart text-warning';
        } else {
            emotionStat.className = 'mb-0 text-success';
            if (emotionIcon) emotionIcon.className = 'fa-solid fa-stack-2x fa-heart text-success';
        }
    }
    
    console.log('Budget consumption updated:', {
        education: `${consumption.education.toFixed(1)}/${budgets.education} minutes (${educationPercent}%)`,
        entertainment: `${consumption.entertainment.toFixed(1)}/${budgets.entertainment} minutes (${entertainmentPercent}%)`,
        emotion: `${consumption.emotion.toFixed(1)}/${budgets.emotion} minutes (${emotionPercent}%)`
    });
};

// ================================================
// FILTERS FUNCTIONALITY
// ================================================

// Function to load filters from storage
const loadFiltersFromStorage = async () => {
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['filters'], function(result) {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(result);
                }
            });
        });
        
        const filters = result.filters || {
            filterImagesVideos: false,
            enableFilterWords: false,
            filterWords: '',
            enableFilterTopics: false,
            filterTopics: '',
            filterAction: 'hide'
        };
        
        // Populate form fields
        document.getElementById('filter-images-videos').checked = filters.filterImagesVideos;
        document.getElementById('enable-filter-words').checked = filters.enableFilterWords;
        document.getElementById('filter-words').value = filters.filterWords;
        document.getElementById('filter-words').disabled = !filters.enableFilterWords;
        document.getElementById('enable-filter-topics').checked = filters.enableFilterTopics;
        document.getElementById('filter-topics').value = filters.filterTopics;
        document.getElementById('filter-topics').disabled = !filters.enableFilterTopics;
        document.getElementById('action-hide').checked = filters.filterAction === 'hide';
        document.getElementById('action-remove').checked = filters.filterAction === 'remove';
        
        console.log('Filters loaded from storage:', filters);
        return filters;
    } catch (error) {
        console.error('Error loading filters from storage:', error);
        return {
            filterImagesVideos: false,
            enableFilterWords: false,
            filterWords: '',
            enableFilterTopics: false,
            filterTopics: '',
            filterAction: 'hide'
        };
    }
};

// Function to initialize filters form
const initializeFiltersForm = () => {
    const filtersForm = document.getElementById('filters-form');
    // Removed resetFiltersButton and submit event listener
    
    // Load existing filters
    loadFiltersFromStorage();
    
    // Add auto-save functionality for form changes
    const filterInputs = filtersForm.querySelectorAll('input');
    filterInputs.forEach(input => {
        input.addEventListener('change', autoSaveFilters);
    });
    
    // Add specific event listeners for enable checkboxes
    const enableFilterWordsCheckbox = document.getElementById('enable-filter-words');
    const enableFilterTopicsCheckbox = document.getElementById('enable-filter-topics');
    const filterWordsInput = document.getElementById('filter-words');
    const filterTopicsInput = document.getElementById('filter-topics');
    
    enableFilterWordsCheckbox.addEventListener('change', function() {
        filterWordsInput.disabled = !this.checked;
        if (!this.checked) {
            filterWordsInput.value = '';
        }
        autoSaveFilters();
    });
    
    enableFilterTopicsCheckbox.addEventListener('change', function() {
        filterTopicsInput.disabled = !this.checked;
        if (!this.checked) {
            filterTopicsInput.value = '';
        }
        autoSaveFilters();
    });
};

// Function to auto-save filters when form changes
const autoSaveFilters = async () => {
    const filters = {
        filterImagesVideos: document.getElementById('filter-images-videos').checked,
        enableFilterWords: document.getElementById('enable-filter-words').checked,
        filterWords: document.getElementById('filter-words').value.trim(),
        enableFilterTopics: document.getElementById('enable-filter-topics').checked,
        filterTopics: document.getElementById('filter-topics').value.trim(),
        filterAction: document.querySelector('input[name="filterAction"]:checked').value
    };
    
    try {
        await new Promise((resolve, reject) => {
            chrome.storage.local.set({ filters }, function() {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
        
        console.log('Filters auto-saved:', filters);
    } catch (error) {
        console.error('Error auto-saving filters:', error);
    }
};
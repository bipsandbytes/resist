/**
 * Settings Dashboard for Resist Extension
 * 
 * Implements dashboard functionality using new data structures from
 * post-persistence.ts and settings.ts with proper TypeScript interfaces
 */

import { postPersistence, DateRangeAnalytics } from '../post-persistence';
import { settingsManager, CategoryBudget } from '../settings';
import { PostEntry } from '../types';

// Interface for dashboard consumption stats
interface DashboardConsumption {
  education: number;
  entertainment: number;
  emotion: number;
}

// Interface for table row data
interface ContentTableRow {
  id: string;
  content: string;
  author: string;
  source: string;
  attention: number;
  time: number;
  timeSpent: number;
  timeSpentFormatted: string;
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Settings] Initializing dashboard...');
  
  paintTotalAttentionChart();
  paintLatestContentTable();
  paintWeeklyAttentionBudgetChart();
  
  // Add event listener for time range selection
  const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range');
  if (selectTotalAttentionTimeRange) {
    selectTotalAttentionTimeRange.addEventListener('change', function() {
      console.log('[Settings] Time range changed to:', (this as HTMLSelectElement).value);
      paintTotalAttentionChart();
    });
  }
  
  // Initialize budget form functionality
  initializeBudgetForm();
  
  // Initialize filters form functionality
  initializeFiltersForm();
  
  // Update budget consumption stats
  updateBudgetConsumptionStats();
  
  // Add storage change listener to update chart and table when content changes
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.content) {
      console.log('[Settings] Content storage changed, updating chart and table');
      paintTotalAttentionChart();
      paintLatestContentTable();
      paintWeeklyAttentionBudgetChart();
      updateBudgetConsumptionStats();
    }
    if (namespace === 'local' && changes.settings) {
      console.log('[Settings] Settings changed, updating consumption stats');
      paintWeeklyAttentionBudgetChart();
      updateBudgetConsumptionStats();
    }
  });
});

/**
 * Format time spent in minutes and seconds
 */
function formatTimeSpent(milliseconds: number): string {
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
}

/**
 * Format time nicely for "time ago" display
 */
function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  
  try {
    const time = new Date(timestamp);
    if (isNaN(time.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 300) { // Less than 5 minutes
      if (diffInSeconds < 60) {
        return 'Just now';
      } else {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
    } else {
      // More than 5 minutes ago - return formatted date and time
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return time.toLocaleDateString('en-US', options);
    }
  } catch (error) {
    console.error('[Settings] Error formatting time:', error);
    return 'Unknown';
  }
}

/**
 * Delete content from storage and refresh displays
 */
async function deleteContent(contentId: string): Promise<void> {
  console.log('[Settings] Deleting content with ID:', contentId);
  
  try {
    // Get current content
    const allPosts = await postPersistence.getAllPosts();
    const postExists = allPosts.some(post => post.id === contentId);
    
    if (!postExists) {
      console.error('[Settings] Content not found with ID:', contentId);
      return;
    }
    
    // Remove from chrome.storage.local directly (postPersistence doesn't have delete method)
    chrome.storage.local.get(['content'], function(result) {
      if (result.content && result.content[contentId]) {
        delete result.content[contentId];
        
        chrome.storage.local.set({ content: result.content }, function() {
          console.log('[Settings] Content deleted successfully');
          // Refresh the table and chart
          paintLatestContentTable();
          paintTotalAttentionChart();
          updateBudgetConsumptionStats();
        });
      }
    });
  } catch (error) {
    console.error('[Settings] Error deleting content:', error);
  }
}

/**
 * Get analytics data based on selected time range
 */
async function getAnalyticsForTimeRange(timeRange: string): Promise<DateRangeAnalytics> {
  console.log('[Settings] Getting analytics for time range:', timeRange);
  
  switch (timeRange) {
    case 'Today':
      return await postPersistence.getTodayAnalytics();
    case 'This week':
      return await postPersistence.getThisWeekAnalytics();
    case 'This month':
      return await postPersistence.getThisMonthAnalytics();
    default:
      return await postPersistence.getTodayAnalytics();
  }
}

/**
 * Paint the total attention chart using ECharts
 */
async function paintTotalAttentionChart(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying...');
    setTimeout(() => paintTotalAttentionChart(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echart-hero') as HTMLElement;
  if (!chartEl) {
    console.warn('[Settings] Chart element not found');
    return;
  }
  
  try {
    // Get time range selection
    const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range') as HTMLSelectElement;
    const timeRange = selectTotalAttentionTimeRange?.value || 'Today';
    
    // Get analytics data
    const analytics = await getAnalyticsForTimeRange(timeRange);
    const budgets = await settingsManager.getBudgets();
    
    console.log('[Settings] Analytics data:', analytics);
    console.log('[Settings] Budget data:', budgets);
    
    // Calculate total budget in seconds for gauge
    let totalBudgetSeconds = 0;
    let totalConsumedSeconds = analytics.totalAttentionScore;
    
    for (const categoryName of Object.keys(budgets)) {
      const categoryBudget = budgets[categoryName];
      if (categoryBudget) {
        totalBudgetSeconds += categoryBudget.total * 60; // Convert minutes to seconds
      }
    }
    
    // Calculate percentage consumed
    const percentageConsumed = totalBudgetSeconds > 0 ? 
      Math.min((totalConsumedSeconds / totalBudgetSeconds) * 100, 100) : 0;
    
    // Get the default options from phoenix utils
    const { getColor } = (window as any).phoenix.utils;
    
    const options = {
      tooltip: {
        trigger: 'item',
        padding: [7, 10],
        backgroundColor: getColor('body-highlight-bg'),
        borderColor: getColor('border-color'),
        textStyle: { color: getColor('light-text-emphasis') },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params: any) => {
          return `<strong>Budget Consumed:</strong> ${params.value.toFixed(1)}%`;
        },
        extraCssText: 'z-index: 1000'
      },
      legend: { show: false },
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          name: 'Budget Consumption',
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

            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 24,
            //   color: [
            //     [0.5, getColor('success')],  // 0-50% green
            //     [0.8, getColor('warning')],  // 50-80% yellow
            //     [1, getColor('danger')]      // 80-100% red
            //   ]
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
            formatter: '{value}%',
          },
          data: [
            {
              value: Math.round(percentageConsumed)
            }
          ]
        }
      ]
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
  } catch (error) {
    console.error('[Settings] Error painting total attention chart:', error);
  }
}

/**
 * Paint the weekly attention budget gauge chart
 */
async function paintWeeklyAttentionBudgetChart(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying weekly chart...');
    setTimeout(() => paintWeeklyAttentionBudgetChart(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echarts-attention-budget') as HTMLElement;
  if (!chartEl) {
    console.warn('[Settings] Weekly attention budget chart element not found');
    return;
  }
  
  try {
    // Get weekly analytics and budget data
    const [weeklyAnalytics, budgets] = await Promise.all([
      postPersistence.getThisWeekAnalytics(),
      settingsManager.getBudgets()
    ]);
    
    console.log('[Settings] Weekly analytics data:', weeklyAnalytics);
    console.log('[Settings] Budget data for weekly calculation:', budgets);
    
    // Calculate total weekly budget (daily budget × 7 days)
    let weeklyBudgetSeconds = 0;
    for (const categoryName of Object.keys(budgets)) {
      const categoryBudget = budgets[categoryName];
      if (categoryBudget) {
        weeklyBudgetSeconds += categoryBudget.total * 60 * 7; // Convert daily minutes to weekly seconds
      }
    }
    
    // Get weekly consumed seconds
    const weeklyConsumedSeconds = weeklyAnalytics.totalAttentionScore;
    
    // Calculate percentage consumed
    const percentageConsumed = weeklyBudgetSeconds > 0 ? 
      Math.min((weeklyConsumedSeconds / weeklyBudgetSeconds) * 100, 100) : 0;
    
    console.log(`[Settings] Weekly: ${weeklyConsumedSeconds}s consumed / ${weeklyBudgetSeconds}s budget = ${percentageConsumed.toFixed(1)}%`);
    
    // Get the default options from phoenix utils
    const { getColor } = (window as any).phoenix.utils;
    
    const options = {
      tooltip: {
        trigger: 'item',
        padding: [7, 10],
        backgroundColor: getColor('body-highlight-bg'),
        borderColor: getColor('border-color'),
        textStyle: { color: getColor('light-text-emphasis') },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params: any) => {
          return `<strong>Weekly Budget:</strong> ${params.value.toFixed(1)}%`;
        },
        extraCssText: 'z-index: 1000'
      },
      legend: { show: false },
      series: [
        {
          type: 'gauge',
          center: ['50%', '50%'],
          name: 'Weekly Budget',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: {
            color: getColor('primary')
          },
          progress: {
            show: true,
            roundCap: true,
            width: 18,
            itemStyle: {
              shadowBlur: 0,
              shadowColor: '#0000'
            }
          },
          pointer: {
            show: false,
            itemStyle: {
              color: 'auto'
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 18,
            }
          },
          axisTick: {
            show: false
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
            formatter: '{value}%',
            fontSize: 14,
            offsetCenter: [0, '20%']
          },
          data: [
            {
              value: Math.round(percentageConsumed)
            }
          ]
        }
      ]
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
    // Update the legend below the chart
    updateWeeklyBudgetLegend(percentageConsumed);
    
  } catch (error) {
    console.error('[Settings] Error painting weekly attention budget chart:', error);
  }
}

/**
 * Update the legend percentages below the weekly budget chart
 */
function updateWeeklyBudgetLegend(percentageConsumed: number): void {
  // Find the weekly budget chart card
  const chartCard = document.querySelector('.echarts-attention-budget')?.closest('.card');
  if (!chartCard) return;
  
  // Find the legend items in the card
  const legendItems = chartCard.querySelectorAll('.d-flex.align-items-center');
  
  legendItems.forEach((item, index) => {
    const percentageElement = item.querySelector('h6:last-child');
    if (!percentageElement) return;
    
    if (index === 0) {
      // First item is "Consumed"
      percentageElement.textContent = `${Math.round(percentageConsumed)}%`;
    } else if (index === 1) {
      // Second item is "Budget" (remaining)
      const remainingPercentage = Math.max(0, 100 - percentageConsumed);
      percentageElement.textContent = `${Math.round(remainingPercentage)}%`;
    }
  });
}

/**
 * Paint the latest content table
 */
async function paintLatestContentTable(): Promise<void> {
  const tableEl = document.querySelector('#table-latest-content') as HTMLElement;
  if (!tableEl) {
    console.warn('[Settings] Table element not found');
    return;
  }
  
  // Clear any existing content
  tableEl.innerHTML = '';
  
  try {
    // Load content using postPersistence
    const allPosts = await postPersistence.getAllPosts();
    console.log('[Settings] Loaded posts for table:', allPosts.length);
    
    if (!allPosts || allPosts.length === 0) {
      console.log('[Settings] No content found');
      return;
    }
    
    // Filter to only posts that have been seen (have timeSpent > 0)
    const seenPosts = allPosts.filter(post => 
      post.metadata.timeSpent && post.metadata.timeSpent > 0
    );
    
    const rows: ContentTableRow[] = seenPosts.map(post => {
      const totalAttention = post.classification?.totalAttentionScore || 0;
      const postUrl = post.postData.text.slice(0, 100) + (post.postData.text.length > 100 ? '...' : '');
      
      return {
        id: post.id,
        content: postUrl,
        author: post.postData.authorName || 'Unknown',
        source: post.metadata.platform || 'Unknown',
        attention: Math.round(totalAttention),
        time: post.metadata.lastSeen,
        timeSpent: post.metadata.timeSpent,
        timeSpentFormatted: formatTimeSpent(post.metadata.timeSpent)
      };
    });
    
    // Sort by time (most recent first)
    rows.sort((a, b) => b.time - a.time);
    
    rows.forEach(row => {
      const rowEl = document.createElement('tr');
      rowEl.className = 'position-static';
      
      rowEl.innerHTML = `
        <td class="align-middle white-space-nowrap content" style="width:50%;">
          <div class="fw-semibold text-truncate" style="max-width: 300px;" title="${row.content}">
            ${row.content}
          </div>
        </td>
        <td class="align-middle white-space-nowrap author" style="width:20%;">
          <div class="d-flex align-items-center text-body">
            <h6 class="mb-0 text-body">${row.author}</h6>
          </div>
        </td>
        <td class="align-middle timeSpent" style="width:10%;">
          <p class="fs-9 fw-semibold text-body-highlight mb-0">
            <span style="display:none;">${row.timeSpent}</span>
            ${row.timeSpentFormatted}
          </p>
        </td>
        <td class="align-middle text-end attention white-space-nowrap" style="width:10%;">
          <div class="hover-hide">
            <h6 class="text-body-highlight mb-0">${row.attention}s</h6>
          </div>
        </td>
        <td class="align-middle text-end time white-space-nowrap" style="width:10%;">
          <div class="hover-hide">
            <h6 class="text-body-highlight mb-0">
              <span style="display:none;">${row.time}</span>
              ${formatTimeAgo(row.time)}
            </h6>
          </div>
        </td>
        <td class="align-middle white-space-nowrap text-end pe-0">
          <button class="btn btn-sm btn-phoenix-secondary fs-10" data-id="${row.id}">
            <span class="fas fa-trash"></span>
          </button>
        </td>
      `;
      
      tableEl.appendChild(rowEl);
    });
    
    // Add click event listeners to trash buttons
    const trashButtons = tableEl.querySelectorAll('button[data-id]');
    trashButtons.forEach(button => {
      button.addEventListener('click', function() {
        const contentId = this.getAttribute('data-id');
        if (contentId) {
          deleteContent(contentId);
        }
      });
    });
    
    console.log('[Settings] Table populated with', rows.length, 'rows');
    
    // Initialize List.js for sorting and pagination
    initializeListJS();
    
  } catch (error) {
    console.error('[Settings] Error loading content for table:', error);
  }
}

/**
 * Initialize List.js for table functionality
 */
function initializeListJS(): void {
  if (!(window as any).List) {
    console.warn('[Settings] List.js not available');
    return;
  }
  
  const lists = document.querySelectorAll('[data-list]');
  
  if (lists.length) {
    lists.forEach(el => {
      const options = getData(el as HTMLElement, 'list');
      
      if (options.pagination) {
        options.pagination = {
          item: `<li><button class='page' type='button'></button></li>`,
          ...options.pagination
        };
      }
      
      const paginationButtonNext = el.querySelector('[data-list-pagination="next"]') as HTMLButtonElement;
      const paginationButtonPrev = el.querySelector('[data-list-pagination="prev"]') as HTMLButtonElement;
      const viewAll = el.querySelector('[data-list-view="*"]') as HTMLElement;
      const viewLess = el.querySelector('[data-list-view="less"]') as HTMLElement;
      const listInfo = el.querySelector('[data-list-info]') as HTMLElement;
      
      const list = new (window as any).List(el, options);
      
      let totalItem = list.items.length;
      const itemsPerPage = list.page;
      let pageQuantity = Math.ceil(list.size() / list.page);
      let pageCount = 1;
      let numberOfCurrentItems = (pageCount - 1) * Number(list.page) + list.visibleItems.length;
      
      const updateListControls = () => {
        if (listInfo) {
          listInfo.innerHTML = `${list.i} to ${numberOfCurrentItems} <span class='text-body-tertiary'> Items of </span>${totalItem}`;
        }
        
        if (paginationButtonPrev) {
          togglePaginationButtonDisable(paginationButtonPrev, pageCount === 1 || pageCount === 0);
        }
        if (paginationButtonNext) {
          togglePaginationButtonDisable(paginationButtonNext, pageCount === pageQuantity || pageCount === 0);
        }
        
        if (pageCount > 1 && pageCount < pageQuantity) {
          togglePaginationButtonDisable(paginationButtonNext, false);
          togglePaginationButtonDisable(paginationButtonPrev, false);
        }
      };
      
      updateListControls();
      
      if (paginationButtonNext) {
        paginationButtonNext.addEventListener('click', e => {
          e.preventDefault();
          pageCount += 1;
          const nextInitialIndex = list.i + itemsPerPage;
          if (nextInitialIndex <= list.size()) {
            list.show(nextInitialIndex, itemsPerPage);
          }
        });
      }
      
      if (paginationButtonPrev) {
        paginationButtonPrev.addEventListener('click', e => {
          e.preventDefault();
          pageCount -= 1;
          const prevItem = list.i - itemsPerPage;
          if (prevItem > 0) {
            list.show(prevItem, itemsPerPage);
          }
        });
      }
      
      if (viewAll) {
        viewAll.addEventListener('click', () => {
          list.show(1, totalItem);
          pageCount = 1;
          viewLess.classList.toggle('d-none');
          viewAll.classList.toggle('d-none');
        });
      }
      
      if (viewLess) {
        viewLess.addEventListener('click', () => {
          list.show(1, itemsPerPage);
          pageCount = 1;
          viewLess.classList.toggle('d-none');
          viewAll.classList.toggle('d-none');
        });
      }
      
      list.on('updated', () => {
        pageQuantity = Math.ceil(list.matchingItems.length / list.page);
        numberOfCurrentItems = (pageCount - 1) * Number(list.page) + list.visibleItems.length;
        updateListControls();
      });
    });
  }
}

// Helper functions for List.js
function camelize(str: string): string {
  const text = str.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
  return `${text.substr(0, 1).toLowerCase()}${text.substr(1)}`;
}

function getData(el: HTMLElement, data: string): any {
  try {
    return JSON.parse(el.dataset[camelize(data)] || '{}');
  } catch (e) {
    return el.dataset[camelize(data)];
  }
}

function togglePaginationButtonDisable(button: HTMLButtonElement, disabled: boolean): void {
  button.disabled = disabled;
  button.classList[disabled ? 'add' : 'remove']('disabled');
}

/**
 * Initialize budget form functionality
 */
function initializeBudgetForm(): void {
  const form = document.getElementById('budget-form') as HTMLFormElement;
  const educationInput = document.getElementById('education-budget') as HTMLInputElement;
  const entertainmentInput = document.getElementById('entertainment-budget') as HTMLInputElement;
  const emotionInput = document.getElementById('emotion-budget') as HTMLInputElement;
  const totalDisplay = document.getElementById('total-budget-display') as HTMLElement;
  const resetButton = document.getElementById('reset-budgets') as HTMLButtonElement;
  
  if (!form) {
    console.warn('[Settings] Budget form not found');
    return;
  }
  
  // Load existing budgets from storage
  loadBudgetsFromStorage();
  
  // Update total when any input changes
  [educationInput, entertainmentInput, emotionInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updateTotalBudget);
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', handleBudgetSubmit);
  
  // Handle reset button
  if (resetButton) {
    resetButton.addEventListener('click', resetBudgets);
  }
  
  // Initialize preset functionality
  initializePresets();
  
  // Initial total update
  updateTotalBudget();
}

/**
 * Load budgets from storage using settingsManager
 */
async function loadBudgetsFromStorage(): Promise<void> {
  try {
    const budgets = await settingsManager.getBudgets();
    
    // Set form values
    const educationInput = document.getElementById('education-budget') as HTMLInputElement;
    const entertainmentInput = document.getElementById('entertainment-budget') as HTMLInputElement;
    const emotionInput = document.getElementById('emotion-budget') as HTMLInputElement;
    
    if (educationInput) educationInput.value = budgets.Education?.total.toString() || '';
    if (entertainmentInput) entertainmentInput.value = budgets.Entertainment?.total.toString() || '';
    if (emotionInput) emotionInput.value = budgets.Emotion?.total.toString() || '';
    
    updateTotalBudget();
  } catch (error) {
    console.error('[Settings] Error loading budgets:', error);
  }
}

/**
 * Update total budget display
 */
function updateTotalBudget(): void {
  const educationInput = document.getElementById('education-budget') as HTMLInputElement;
  const entertainmentInput = document.getElementById('entertainment-budget') as HTMLInputElement;
  const emotionInput = document.getElementById('emotion-budget') as HTMLInputElement;
  const totalDisplay = document.getElementById('total-budget-display') as HTMLElement;
  
  const education = parseInt(educationInput?.value || '0') || 0;
  const entertainment = parseInt(entertainmentInput?.value || '0') || 0;
  const emotion = parseInt(emotionInput?.value || '0') || 0;
  
  const total = education + entertainment + emotion;
  
  if (totalDisplay) {
    totalDisplay.textContent = `${total} minutes`;
    
    // Update color based on value
    if (total === 0) {
      totalDisplay.className = 'text-body-tertiary mb-0';
    } else if (total > 480) { // More than 8 hours
      totalDisplay.className = 'text-danger mb-0 fw-semibold';
    } else if (total > 240) { // More than 4 hours
      totalDisplay.className = 'text-warning mb-0 fw-semibold';
    } else {
      totalDisplay.className = 'text-success mb-0 fw-semibold';
    }
  }
}

/**
 * Handle budget form submission
 */
async function handleBudgetSubmit(event: Event): Promise<void> {
  event.preventDefault();
  
  const educationInput = document.getElementById('education-budget') as HTMLInputElement;
  const entertainmentInput = document.getElementById('entertainment-budget') as HTMLInputElement;
  const emotionInput = document.getElementById('emotion-budget') as HTMLInputElement;
  
  const educationMinutes = parseInt(educationInput?.value || '0') || 0;
  const entertainmentMinutes = parseInt(entertainmentInput?.value || '0') || 0;
  const emotionMinutes = parseInt(emotionInput?.value || '0') || 0;
  
  try {
    // Update budgets using settingsManager
    await settingsManager.setBudgetForCategory('Education', educationMinutes);
    await settingsManager.setBudgetForCategory('Entertainment', entertainmentMinutes);
    await settingsManager.setBudgetForCategory('Emotion', emotionMinutes);
    
    // Show success feedback
    const submitButton = (event.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="fas fa-check me-2"></span>Saved!';
      submitButton.disabled = true;
      
      setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }, 2000);
    }
    
    console.log('[Settings] Budgets saved successfully');
    
    // Update dashboard stats
    updateBudgetConsumptionStats();
    
  } catch (error) {
    console.error('[Settings] Error saving budgets:', error);
    
    // Show error feedback
    const submitButton = (event.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="fas fa-exclamation-triangle me-2"></span>Error!';
      submitButton.className = 'btn btn-danger';
      
      setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.className = 'btn btn-primary';
      }, 2000);
    }
  }
}

/**
 * Reset budgets to stored values
 */
function resetBudgets(): void {
  // Only allow reset when Custom is selected
  const customPreset = document.getElementById('preset-custom') as HTMLElement;
  if (!customPreset?.classList.contains('preset-selected')) {
    return;
  }
  
  // Revert to stored budgets
  loadBudgetsFromStorage();
}

/**
 * Initialize preset functionality
 */
function initializePresets(): void {
  const educationInput = document.getElementById('education-budget') as HTMLInputElement;
  const entertainmentInput = document.getElementById('entertainment-budget') as HTMLInputElement;
  const emotionInput = document.getElementById('emotion-budget') as HTMLInputElement;
  const presetLinks = [
    document.getElementById('preset-focussed'),
    document.getElementById('preset-relaxed'),
    document.getElementById('preset-revolutionary'),
    document.getElementById('preset-custom')
  ];
  
  function setFieldsDisabled(disabled: boolean) {
    if (educationInput) educationInput.disabled = disabled;
    if (entertainmentInput) entertainmentInput.disabled = disabled;
    if (emotionInput) emotionInput.disabled = disabled;
  }
  
  function setSelected(link: HTMLElement) {
    presetLinks.forEach(l => l?.classList.remove('preset-selected'));
    link.classList.add('preset-selected');
    
    // Enable/disable reset button based on selection
    const resetButton = document.getElementById('reset-budgets') as HTMLButtonElement;
    if (resetButton) {
      resetButton.disabled = !link.id.includes('custom');
    }
  }
  
  // Load existing budgets and set Custom as selected
  loadBudgetsFromStorage().then(() => {
    const customPreset = document.getElementById('preset-custom') as HTMLElement;
    if (customPreset) {
      setSelected(customPreset);
      setFieldsDisabled(false);
    }
  });
  
  // Preset event listeners
  document.getElementById('preset-focussed')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (educationInput) educationInput.value = '60';
    if (entertainmentInput) entertainmentInput.value = '10';
    if (emotionInput) emotionInput.value = '20';
    setFieldsDisabled(true);
    setSelected(this);
    updateTotalBudget();
  });
  
  document.getElementById('preset-relaxed')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (educationInput) educationInput.value = '20';
    if (entertainmentInput) entertainmentInput.value = '60';
    if (emotionInput) emotionInput.value = '10';
    setFieldsDisabled(true);
    setSelected(this);
    updateTotalBudget();
  });
  
  document.getElementById('preset-revolutionary')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (educationInput) educationInput.value = '20';
    if (entertainmentInput) entertainmentInput.value = '10';
    if (emotionInput) emotionInput.value = '60';
    setFieldsDisabled(true);
    setSelected(this);
    updateTotalBudget();
  });
  
  document.getElementById('preset-custom')?.addEventListener('click', function(e) {
    e.preventDefault();
    setFieldsDisabled(false);
    setSelected(this);
    if (educationInput) educationInput.focus();
  });
}

/**
 * Update budget consumption stats on dashboard
 */
async function updateBudgetConsumptionStats(): Promise<void> {
  try {
    // Get today's analytics and budgets
    const [todayAnalytics, budgets] = await Promise.all([
      postPersistence.getTodayAnalytics(),
      settingsManager.getBudgets()
    ]);
    
    // Update the dashboard stats
    updateDashboardStats(todayAnalytics, budgets);
    
  } catch (error) {
    console.error('[Settings] Error updating budget consumption stats:', error);
  }
}

/**
 * Update dashboard stats with consumption percentages
 */
function updateDashboardStats(analytics: DateRangeAnalytics, budgets: CategoryBudget): void {
  const statsContainer = document.getElementById('budgets-summary-quick-stats');
  if (!statsContainer) return;
  
  // Calculate consumption for each category (in seconds)
  const educationConsumed = analytics.categories.Education?.totalScore || 0;
  const entertainmentConsumed = analytics.categories.Entertainment?.totalScore || 0;
  const emotionConsumed = analytics.categories.Emotion?.totalScore || 0;
  
  // Calculate percentages
  const educationBudgetSeconds = (budgets.Education?.total || 0) * 60;
  const entertainmentBudgetSeconds = (budgets.Entertainment?.total || 0) * 60;
  const emotionBudgetSeconds = (budgets.Emotion?.total || 0) * 60;
  
  const educationPercent = educationBudgetSeconds > 0 ? 
    Math.round((educationConsumed / educationBudgetSeconds) * 100) : 0;
  const entertainmentPercent = entertainmentBudgetSeconds > 0 ? 
    Math.round((entertainmentConsumed / entertainmentBudgetSeconds) * 100) : 0;
  const emotionPercent = emotionBudgetSeconds > 0 ? 
    Math.round((emotionConsumed / emotionBudgetSeconds) * 100) : 0;
  
  // Helper function to update a stat
  function updateStat(childIndex: number, percent: number, iconClass: string) {
    const statDiv = statsContainer.querySelector(`.col-12.col-md-auto:nth-child(${childIndex})`);
    if (!statDiv) return;
    
    const statValue = statDiv.querySelector('h4');
    const statIcon = statDiv.querySelector(`.${iconClass}`);
    
    if (statValue) {
      statValue.textContent = `${percent}%`;
      
      // Update color based on consumption
      let colorClass = 'text-success';
      let iconColorClass = 'text-success';
      
      if (percent >= 100) {
        colorClass = 'text-danger';
        iconColorClass = 'text-danger';
      } else if (percent >= 80) {
        colorClass = 'text-warning';
        iconColorClass = 'text-warning';
      }
      
      statValue.className = `mb-0 ${colorClass}`;
      
      if (statIcon) {
        // Remove existing text-* classes and add new color class
        statIcon.className = statIcon.className.toString().replace(/text-\w+/g, '') + ' ' + iconColorClass;
      }
    }
  }
  
  // Update each stat
  updateStat(1, educationPercent, 'fa-graduation-cap');
  updateStat(2, entertainmentPercent, 'fa-ticket');
  updateStat(3, emotionPercent, 'fa-heart');
  
  console.log('[Settings] Budget consumption updated:', {
    education: `${(educationConsumed/60).toFixed(1)}/${budgets.Education?.total || 0} minutes (${educationPercent}%)`,
    entertainment: `${(entertainmentConsumed/60).toFixed(1)}/${budgets.Entertainment?.total || 0} minutes (${entertainmentPercent}%)`,
    emotion: `${(emotionConsumed/60).toFixed(1)}/${budgets.Emotion?.total || 0} minutes (${emotionPercent}%)`
  });
}

/**
 * Initialize filters form functionality
 */
function initializeFiltersForm(): void {
  const filtersForm = document.getElementById('filters-form') as HTMLFormElement;
  if (!filtersForm) {
    console.warn('[Settings] Filters form not found');
    return;
  }
  
  // Load existing filters
  loadFiltersFromStorage();
  
  // Add auto-save functionality for form changes
  const filterInputs = filtersForm.querySelectorAll('input');
  filterInputs.forEach(input => {
    input.addEventListener('change', autoSaveFilters);
  });
  
  // Add specific event listeners for enable checkboxes
  const enableFilterWordsCheckbox = document.getElementById('enable-filter-words') as HTMLInputElement;
  const enableFilterTopicsCheckbox = document.getElementById('enable-filter-topics') as HTMLInputElement;
  const filterWordsInput = document.getElementById('filter-words') as HTMLInputElement;
  const filterTopicsInput = document.getElementById('filter-topics') as HTMLInputElement;
  
  if (enableFilterWordsCheckbox && filterWordsInput) {
    enableFilterWordsCheckbox.addEventListener('change', function() {
      filterWordsInput.disabled = !this.checked;
      if (!this.checked) {
        filterWordsInput.value = '';
      }
      autoSaveFilters();
    });
  }
  
  if (enableFilterTopicsCheckbox && filterTopicsInput) {
    enableFilterTopicsCheckbox.addEventListener('change', function() {
      filterTopicsInput.disabled = !this.checked;
      if (!this.checked) {
        filterTopicsInput.value = '';
      }
      autoSaveFilters();
    });
  }
}

/**
 * Load filters from storage
 */
async function loadFiltersFromStorage(): Promise<void> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
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
    const filterImagesVideos = document.getElementById('filter-images-videos') as HTMLInputElement;
    const enableFilterWords = document.getElementById('enable-filter-words') as HTMLInputElement;
    const filterWords = document.getElementById('filter-words') as HTMLInputElement;
    const enableFilterTopics = document.getElementById('enable-filter-topics') as HTMLInputElement;
    const filterTopics = document.getElementById('filter-topics') as HTMLInputElement;
    const actionHide = document.getElementById('action-hide') as HTMLInputElement;
    const actionRemove = document.getElementById('action-remove') as HTMLInputElement;
    
    if (filterImagesVideos) filterImagesVideos.checked = filters.filterImagesVideos;
    if (enableFilterWords) enableFilterWords.checked = filters.enableFilterWords;
    if (filterWords) {
      filterWords.value = filters.filterWords;
      filterWords.disabled = !filters.enableFilterWords;
    }
    if (enableFilterTopics) enableFilterTopics.checked = filters.enableFilterTopics;
    if (filterTopics) {
      filterTopics.value = filters.filterTopics;
      filterTopics.disabled = !filters.enableFilterTopics;
    }
    if (actionHide) actionHide.checked = filters.filterAction === 'hide';
    if (actionRemove) actionRemove.checked = filters.filterAction === 'remove';
    
    console.log('[Settings] Filters loaded from storage:', filters);
  } catch (error) {
    console.error('[Settings] Error loading filters from storage:', error);
  }
}

/**
 * Auto-save filters when form changes
 */
async function autoSaveFilters(): Promise<void> {
  const filterImagesVideos = document.getElementById('filter-images-videos') as HTMLInputElement;
  const enableFilterWords = document.getElementById('enable-filter-words') as HTMLInputElement;
  const filterWords = document.getElementById('filter-words') as HTMLInputElement;
  const enableFilterTopics = document.getElementById('enable-filter-topics') as HTMLInputElement;
  const filterTopics = document.getElementById('filter-topics') as HTMLInputElement;
  const filterActionChecked = document.querySelector('input[name="filterAction"]:checked') as HTMLInputElement;
  
  const filters = {
    filterImagesVideos: filterImagesVideos?.checked || false,
    enableFilterWords: enableFilterWords?.checked || false,
    filterWords: filterWords?.value.trim() || '',
    enableFilterTopics: enableFilterTopics?.checked || false,
    filterTopics: filterTopics?.value.trim() || '',
    filterAction: filterActionChecked?.value || 'hide'
  };
  
  try {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ filters }, function() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
    
    console.log('[Settings] Filters auto-saved:', filters);
  } catch (error) {
    console.error('[Settings] Error auto-saving filters:', error);
  }
}
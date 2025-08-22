/**
 * Settings Dashboard for Resist Extension
 * 
 * Implements dashboard functionality using new data structures from
 * post-persistence.ts and settings.ts with proper TypeScript interfaces
 */

import { postPersistence, DateRangeAnalytics } from '../post-persistence';
import { settingsManager, CategoryBudget } from '../settings';
import { PostEntry } from '../types';
import { storageManager } from '../storage-manager';


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
document.addEventListener('DOMContentLoaded', async function() {
  console.log('[Settings] Initializing dashboard...');
  
  try {
    // Initialize StorageManager first
    console.log('[Settings] Initializing StorageManager...');
    const { storageManager } = await import('../storage-manager');
    await storageManager.initialize();
    console.log('[Settings] StorageManager initialized successfully');
    
    // Now initialize dashboard components
    paintTotalAttentionChart();
    paintLatestContentTable();
    paintWeeklyAttentionBudgetChart();
    paintContentConsumedChart();
    paintCategoryBreakdownChart();
    paintHourlyHeatmap();
    paintPlatformBreakdownChart();
  } catch (error) {
    console.error('[Settings] Failed to initialize StorageManager:', error);
    console.log('[Settings] Falling back to direct Chrome storage access');
    
    // Fallback to direct Chrome storage access
    paintTotalAttentionChart();
    paintLatestContentTable();
    paintWeeklyAttentionBudgetChart();
    paintContentConsumedChart();
    paintCategoryBreakdownChart();
    paintHourlyHeatmap();
    paintPlatformBreakdownChart();
  }
  
  // Add event listener for time range selection
  const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range');
  if (selectTotalAttentionTimeRange) {
    selectTotalAttentionTimeRange.addEventListener('change', function() {
      console.log('[Settings] Time range changed to:', (this as HTMLSelectElement).value);
      paintTotalAttentionChart();
      updateBudgetConsumptionStats();
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
      paintContentConsumedChart();
      paintCategoryBreakdownChart();
      paintHourlyHeatmap();
      paintPlatformBreakdownChart();
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
    // Remove from storage via StorageManager
    const content = storageManager.get('content') || {};
    if (content[contentId]) {
      delete content[contentId];
      storageManager.set('content', content);
      
      console.log('[Settings] Content deleted successfully');
      // Refresh the table and chart
      paintLatestContentTable();
      paintTotalAttentionChart();
      updateBudgetConsumptionStats();
    } else {
      console.error('[Settings] Content not found with ID:', contentId);
    }
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
    
    // Calculate total budget in seconds for gauge based on time range
    let totalBudgetSeconds = 0;
    let totalConsumedSeconds = analytics.totalAttentionScore;
    
    // Determine multiplier based on time range
    let budgetMultiplier = 1;
    switch (timeRange) {
      case 'Today':
        budgetMultiplier = 1; // Daily budget
        break;
      case 'This week':
        budgetMultiplier = 7; // Weekly budget (7 days)
        break;
      case 'This month':
        budgetMultiplier = 30; // Monthly budget (30 days)
        break;
      default:
        budgetMultiplier = 1; // Default to daily
    }
    
    for (const categoryName of Object.keys(budgets)) {
      const categoryBudget = budgets[categoryName];
      if (categoryBudget) {
        totalBudgetSeconds += categoryBudget.total * 60 * budgetMultiplier; // Convert minutes to seconds and apply multiplier
      }
    }
    
    // Calculate percentage consumed
    const percentageConsumed = totalBudgetSeconds > 0 ? 
      Math.min((totalConsumedSeconds / totalBudgetSeconds) * 100, 100) : 0;
    
    console.log(`[Settings] ${timeRange} budget calculation:`, {
      timeRange,
      budgetMultiplier,
      totalConsumedSeconds: `${(totalConsumedSeconds/60).toFixed(1)} minutes`,
      totalBudgetSeconds: `${(totalBudgetSeconds/60).toFixed(1)} minutes`,
      percentageConsumed: `${percentageConsumed.toFixed(1)}%`
    });
    
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
          const timeRangeText = timeRange === 'Today' ? 'Daily' : 
                               timeRange === 'This week' ? 'Weekly' : 
                               timeRange === 'This month' ? 'Monthly' : 'Daily';
          return `<strong>${timeRangeText} Budget Consumed:</strong> ${params.value.toFixed(1)}%`;
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
 * Paint the content consumed chart showing post count over the last 7 days
 */
async function paintContentConsumedChart(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying content consumed chart...');
    setTimeout(() => paintContentConsumedChart(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echarts-content-consumed') as HTMLElement;
  if (!chartEl) {
    console.warn('[Settings] Content consumed chart element not found');
    return;
  }
  
  try {
    // Get data for the last 7 days
    const last7DaysAnalytics = await postPersistence.getLastNDaysAnalytics(7);
    
    console.log('[Settings] Last 7 days analytics data:', last7DaysAnalytics);
    
    // Generate data points for the last 7 days
    const dataPoints = [];
    const labels = [];
    
    // For demo purposes, create some sample data since we don't have daily breakdowns
    // In a real implementation, you'd get daily data from the analytics
    const sampleData = [5, 8, 12, 6, 9, 15, 11]; // Sample post counts for each day
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // This gives us 6 days ago to today
      
      // Ensure the date is valid before formatting
      if (isNaN(date.getTime())) {
        console.warn('[Settings] Invalid date generated for chart label');
        labels.push('Unknown');
      } else {
        // Format date for label using a more standard format
        const dayLabel = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        labels.push(dayLabel);
      }
      
      // Use sample data for now
      dataPoints.push(sampleData[i]);
    }
    
    console.log('[Settings] Chart data points:', dataPoints);
    console.log('[Settings] Chart labels:', labels);
    
    // Update the total posts count in the header
    const totalPostsElement = document.getElementById('number-of-posts-viewed');
    if (totalPostsElement) {
      const totalPosts = dataPoints.reduce((sum, count) => sum + count, 0);
      totalPostsElement.textContent = totalPosts.toString();
      console.log('[Settings] Updated total posts count:', totalPosts);
    }
    
    const options = {
      tooltip: {
        trigger: 'axis',
        padding: [7, 10],
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
        textStyle: { color: '#495057' },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params: any) => {
          const data = params[0];
          return `<strong>${data.name}:</strong> ${data.value} posts`;
        },
        extraCssText: 'z-index: 1000'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#dee2e6'
          }
        },
        axisLabel: {
          color: '#6c757d',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: {
          lineStyle: {
            color: '#dee2e6'
          }
        },
        axisLabel: {
          color: '#6c757d',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#dee2e6',
            opacity: 0.3
          }
        }
      },
      series: [
        {
          name: 'Posts',
          type: 'line',
          data: dataPoints,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#0d6efd',
            width: 3
          },
          itemStyle: {
            color: '#0d6efd'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#0d6efd' },
                { offset: 1, color: '#e7f1ff' }
              ]
            }
          }
        }
      ]
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    console.log('[Settings] Content consumed chart initialized with options:', options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
  } catch (error) {
    console.error('[Settings] Error painting content consumed chart:', error);
  }
}

/**
 * Paint the category breakdown pie chart showing time spent on top-level categories
 */
async function paintCategoryBreakdownChart(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying category breakdown chart...');
    setTimeout(() => paintCategoryBreakdownChart(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echart-category-breakdown') as HTMLElement;
  console.log('[Settings] Looking for .echart-category-breakdown element:', chartEl);
  if (!chartEl) {
    console.warn('[Settings] Category breakdown chart element not found');
    console.log('[Settings] Available elements with "chart" in class:', document.querySelectorAll('[class*="chart"]'));
    return;
  }
  
  try {
    // Get data for the last 7 days
    const last7DaysAnalytics = await postPersistence.getLastNDaysAnalytics(7);
    
    console.log('[Settings] Category breakdown analytics data:', last7DaysAnalytics);
    
    // Extract category data
    const categories = ['Education', 'Entertainment', 'Emotion'];
    const categoryData = categories.map(category => {
      const categoryInfo = last7DaysAnalytics.categories[category];
      return {
        name: category,
        value: categoryInfo ? categoryInfo.totalScore : 0
      };
    }).filter(item => item.value > 0); // Only show categories with data
    
    console.log('[Settings] Category breakdown data:', categoryData);
    
    const options = {
      tooltip: {
        trigger: 'item',
        padding: [7, 10],
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
        textStyle: { color: '#495057' },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params: any) => {
          const percentage = ((params.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
          return `<strong>${params.name}:</strong> ${params.value.toFixed(1)}s (${percentage}%)`;
        },
        extraCssText: 'z-index: 1000'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        textStyle: {
          color: '#6c757d',
          fontSize: 11
        },
        itemGap: 20,
        itemWidth: 12,
        itemHeight: 12
      },
      series: [
        {
          name: 'Categories',
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '35%'],
          data: categoryData,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ],
      color: ['#0d6efd', '#fd7e14', '#dc3545'] // Blue, Orange, Red for the three categories
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    console.log('[Settings] Category breakdown chart initialized with options:', options);
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
  } catch (error) {
    console.error('[Settings] Error painting category breakdown chart:', error);
  }
}

/**
 * Paint the hourly activity heatmap
 */
async function paintHourlyHeatmap(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying hourly heatmap...');
    setTimeout(() => paintHourlyHeatmap(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echart-daily-heat-map') as HTMLElement;
  if (!chartEl) {
    console.warn('[Settings] Hourly heatmap chart element not found');
    return;
  }
  
  try {
    // Get all posts from the last 7 days
    const allPosts = await postPersistence.getAllPosts();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Filter posts from last 7 days and group by day × hour
    const dayHourAttention = Array(7).fill(null).map(() => Array(24).fill(0));
    
    allPosts.forEach(post => {
      if (post.metadata.lastSeen && post.metadata.lastSeen >= sevenDaysAgo.getTime()) {
        const date = new Date(post.metadata.lastSeen);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const hour = date.getHours();
        dayHourAttention[dayOfWeek][hour] += post.classification?.totalAttentionScore || 0;
      }
    });
    
    console.log('[Settings] Day × Hour attention data:', dayHourAttention);
    
    // Prepare data for heatmap - day × hour attention scores
    const data = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        data.push([hour, day, dayHourAttention[day][hour]]);
      }
    }
    
    // Find max value for color scale
    const maxValue = Math.max(...dayHourAttention.flat());
    
    const options = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const hour = params.data[0];
          const day = params.data[1];
          const value = params.data[2];
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const hourLabel = hour === 0 ? '12am' : hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour-12}pm`;
          return `${dayNames[day]} ${hourLabel} - Attention Score: ${value.toFixed(1)}`;
        }
      },
      grid: {
        height: '65%',
        top: '5%',
        left: '15%',
        right: '5%',
        bottom: '30%'
      },
      xAxis: {
        type: 'category',
        data: Array.from({length: 24}, (_, i) => {
          if (i === 0) return '12am';
          if (i === 12) return '12pm';
          if (i < 12) return `${i}am`;
          return `${i-12}pm`;
        }),
        splitArea: {
          show: true
        },
        axisLabel: {
          fontSize: 9,
          interval: 3,
          rotate: 45
        }
      },
      yAxis: {
        type: 'category',
        data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        splitArea: {
          show: true
        },
        axisLabel: {
          fontSize: 10
        }
      },
      series: [{
        name: 'Activity',
        type: 'heatmap',
        data: data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      visualMap: {
        min: 0,
        max: maxValue,
        show: false,
        orient: 'horizontal',
        left: 'center',
        bottom: '-15%',
        inRange: {
          color: ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336']
        }
      }
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    console.log('[Settings] Day × Hour heatmap initialized');
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
  } catch (error) {
    console.error('[Settings] Error painting hourly heatmap:', error);
  }
}

/**
 * Paint the platform breakdown chart (Nightingale/rose chart)
 */
async function paintPlatformBreakdownChart(): Promise<void> {
  // Wait for ECharts to be available
  if (!(window as any).echarts) {
    console.log('[Settings] ECharts not available yet, retrying platform breakdown chart...');
    setTimeout(() => paintPlatformBreakdownChart(), 100);
    return;
  }
  
  const chartEl = document.querySelector('.echarts-platform-breakdown') as HTMLElement;
  if (!chartEl) {
    console.warn('[Settings] Platform breakdown chart element not found');
    return;
  }
  
  try {
    // Get all posts from the last 7 days
    const allPosts = await postPersistence.getAllPosts();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Filter posts from last 7 days and count by platform
    const platformCounts: { [key: string]: number } = {};
    
    allPosts.forEach(post => {
      if (post.metadata.lastSeen && post.metadata.lastSeen >= sevenDaysAgo.getTime()) {
        const platform = post.metadata.platform || 'Unknown';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      }
    });
    
    console.log('[Settings] Platform counts:', platformCounts);
    
    // Prepare data for Nightingale chart
    const data = Object.entries(platformCounts).map(([platform, count]) => ({
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      value: count
    }));
    
    // Define colors for each platform
    const platformColors = {
      'Twitter': '#1DA1F2',
      'Reddit': '#FF4500', 
      'Instagram': '#E4405F',
      'Unknown': '#6c757d'
    };
    
        const options = {
      tooltip: {
        trigger: 'item',
        padding: [7, 10],
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
        textStyle: { color: '#495057' },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: (params: any) => {
          const percentage = ((params.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
          return `<strong>${params.name}:</strong> ${params.value} posts (${percentage}%)`;
        },
        extraCssText: 'z-index: 1000'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        textStyle: {
          color: '#6c757d',
          fontSize: 11
        },
        itemGap: 20,
        itemWidth: 12,
        itemHeight: 12
      },
      series: [
        {
          name: 'Platforms',
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '35%'],
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2,
            color: (params: any) => {
              return platformColors[params.name as keyof typeof platformColors] || '#6c757d';
            }
          }
        }
      ]
    };
    
    const chart = (window as any).echarts.init(chartEl);
    chart.setOption(options);
    
    console.log('[Settings] Platform breakdown chart initialized');
    
    // Handle resize events
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
  } catch (error) {
    console.error('[Settings] Error painting platform breakdown chart:', error);
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
      
      // Debug timestamp
      if (post.metadata.lastSeen) {
        console.log(`[Settings] Post ${post.id} timestamp:`, post.metadata.lastSeen, 'Date:', new Date(post.metadata.lastSeen));
      }
      
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
              ${row.time && row.time > 0 ? formatTimeAgo(row.time) : 'Unknown'}
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
    // Update budgets using settingsManager (this will auto-distribute to subcategories)
    await settingsManager.setBudgetForCategory('Education', educationMinutes);
    await settingsManager.setBudgetForCategory('Entertainment', entertainmentMinutes);
    await settingsManager.setBudgetForCategory('Emotion', emotionMinutes);
    
    // Get the updated budgets to show subcategory distribution
    const updatedBudgets = await settingsManager.getBudgets();
    
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
    
    console.log('[Settings] Budgets saved successfully with auto-distribution:');
    Object.entries(updatedBudgets).forEach(([category, budget]) => {
      console.log(`  ${category}: ${budget.total} minutes total`);
      Object.entries(budget.subcategories).forEach(([subcategory, minutes]) => {
        console.log(`    - ${subcategory}: ${minutes} minutes`);
      });
    });
    
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
    // Get selected time range
    const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range') as HTMLSelectElement;
    const timeRange = selectTotalAttentionTimeRange?.value || 'Today';
    
    // Get analytics for the selected time range and budgets
    const [analytics, budgets] = await Promise.all([
      getAnalyticsForTimeRange(timeRange),
      settingsManager.getBudgets()
    ]);
    
    // Update the dashboard stats
    updateDashboardStats(analytics, budgets);
    
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
  
  // Get selected time range
  const selectTotalAttentionTimeRange = document.getElementById('select-total-attention-time-range') as HTMLSelectElement;
  const timeRange = selectTotalAttentionTimeRange?.value || 'Today';
  
  // Calculate consumption for each category (in seconds)
  const educationConsumed = analytics.categories.Education?.totalScore || 0;
  const entertainmentConsumed = analytics.categories.Entertainment?.totalScore || 0;
  const emotionConsumed = analytics.categories.Emotion?.totalScore || 0;
  
  // Determine budget multiplier based on time range
  let budgetMultiplier = 1;
  switch (timeRange) {
    case 'Today':
      budgetMultiplier = 1; // Daily budget
      break;
    case 'This week':
      budgetMultiplier = 7; // Weekly budget (7 days)
      break;
    case 'This month':
      budgetMultiplier = 30; // Monthly budget (30 days)
      break;
    default:
      budgetMultiplier = 1; // Default to daily
  }
  
  // Calculate percentages with budget multiplier
  const educationBudgetSeconds = (budgets.Education?.total || 0) * 60 * budgetMultiplier;
  const entertainmentBudgetSeconds = (budgets.Entertainment?.total || 0) * 60 * budgetMultiplier;
  const emotionBudgetSeconds = (budgets.Emotion?.total || 0) * 60 * budgetMultiplier;
  
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
        // Use setAttribute for SVG elements since className is read-only
        const currentClasses = statIcon.getAttribute('class') || '';
        const newClasses = currentClasses.replace(/text-\w+/g, '') + ' ' + iconColorClass;
        statIcon.setAttribute('class', newClasses);
      }
    }
  }
  
  // Update each stat
  updateStat(1, educationPercent, 'fa-graduation-cap');
  updateStat(2, entertainmentPercent, 'fa-ticket');
  updateStat(3, emotionPercent, 'fa-heart');
  
  console.log(`[Settings] Budget consumption updated for ${timeRange}:`, {
    education: `${(educationConsumed/60).toFixed(1)}/${(budgets.Education?.total || 0) * budgetMultiplier} minutes (${educationPercent}%)`,
    entertainment: `${(entertainmentConsumed/60).toFixed(1)}/${(budgets.Entertainment?.total || 0) * budgetMultiplier} minutes (${entertainmentPercent}%)`,
    emotion: `${(emotionConsumed/60).toFixed(1)}/${(budgets.Emotion?.total || 0) * budgetMultiplier} minutes (${emotionPercent}%)`
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
    const filters = await settingsManager.getFilters();
    
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
    // Note: Filter actions are currently disabled (coming soon feature)
    // if (actionHide) actionHide.checked = filters.filterAction === 'hide';
    // if (actionRemove) actionRemove.checked = filters.filterAction === 'remove';
    
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
  // Note: Filter actions are currently disabled (coming soon feature)
  // const filterActionChecked = document.querySelector('input[name="filterAction"]:checked') as HTMLInputElement;
  
  const filters = {
    filterImagesVideos: filterImagesVideos?.checked || false,
    enableFilterWords: enableFilterWords?.checked || false,
    filterWords: filterWords?.value.trim() || '',
    enableFilterTopics: enableFilterTopics?.checked || false,
    filterTopics: filterTopics?.value.trim() || '',
    filterAction: 'hide' as 'hide' | 'remove' // Default to 'hide' since actions are disabled
  };
  
  try {
    await settingsManager.updateFilters(filters);
    console.log('[Settings] Filters auto-saved:', filters);
  } catch (error) {
    console.error('[Settings] Error auto-saving filters:', error);
  }
}
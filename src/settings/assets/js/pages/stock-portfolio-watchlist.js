(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  // import * as echarts from 'echarts';
  const { merge } = window._;

  // form config.js
  const echartSetOption = (
    chart,
    userOptions,
    getDefaultOptions,
    responsiveOptions
  ) => {
    const { breakpoints, resize } = window.phoenix.utils;
    const handleResize = options => {
      Object.keys(options).forEach(item => {
        if (window.innerWidth > breakpoints[item]) {
          chart.setOption(options[item]);
        }
      });
    };

    const themeController = document.body;
    // Merge user options with lodash
    chart.setOption(merge(getDefaultOptions(), userOptions));

    const navbarVerticalToggle = document.querySelector(
      '.navbar-vertical-toggle'
    );
    if (navbarVerticalToggle) {
      navbarVerticalToggle.addEventListener('navbar.vertical.toggle', () => {
        chart.resize();
        if (responsiveOptions) {
          handleResize(responsiveOptions);
        }
      });
    }

    resize(() => {
      chart.resize();
      if (responsiveOptions) {
        handleResize(responsiveOptions);
      }
    });
    if (responsiveOptions) {
      handleResize(responsiveOptions);
    }

    themeController.addEventListener(
      'clickControl',
      ({ detail: { control } }) => {
        if (control === 'phoenixTheme') {
          chart.setOption(window._.merge(getDefaultOptions(), userOptions));
        }
        if (responsiveOptions) {
          handleResize(responsiveOptions);
        }
      }
    );
  };
  // -------------------end config.js--------------------

  const echartTabs = document.querySelectorAll('[data-tab-has-echarts]');
  if (echartTabs) {
    echartTabs.forEach(tab => {
      tab.addEventListener('shown.bs.tab', e => {
        const el = e.target;
        const { hash } = el;
        const id = hash || el.dataset.bsTarget;
        const content = document.getElementById(id.substring(1));
        const chart = content?.querySelector('[data-echart-tab]');
        if (chart) {
          window.echarts.init(chart).resize();
        }
      });
    });
  }

  const tooltipFormatter = (params, dateFormatter = 'MMM DD') => {
    let tooltipItem = ``;
    params.forEach(el => {
      tooltipItem += `<div class='ms-1'>
        <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
          el.borderColor ? el.borderColor : el.color
        }"></span>
          ${el.seriesName} : ${
      typeof el.value === 'object' ? el.value[1] : el.value
    }
        </h6>
      </div>`;
    });
    return `<div>
            <p class='mb-2 text-body-tertiary'>
              ${
                window.dayjs(params[0].axisValue).isValid()
                  ? window.dayjs(params[0].axisValue).format(dateFormatter)
                  : params[0].axisValue
              }
            </p>
            ${tooltipItem}
          </div>`;
  };

  const portfolioLineChartData = {
    '1d': [
      ['9 AM', 90],
      ['9:30 AM', 82],
      ['10 AM', 57],
      ['10:30 AM', 85],
      ['11 AM', 86],
      ['11:30 AM', 78],
      ['12 PM', 93],
      ['12:30 PM', 71],
      ['1 PM', 69],
      ['1:30 PM', 81],
      ['2 PM', 57],
      ['2:30 PM', 40],
      ['3 PM', 68],
      ['3:30 PM', 72],
      ['4 PM', 61]
    ],
    '5d': [
      ['2025-03-05', 45],
      ['2025-03-06', 38],
      ['2024-03-07', 54],
      ['2025-03-08', 48],
      ['2025-03-09', 55]
    ],
    '1m': [
      ['2025-02-08', 47],
      ['2025-02-09', 62],
      ['2025-02-10', 68],
      ['2025-02-11', 82],
      ['2025-02-12', 82],
      ['2025-02-13', 93],
      ['2025-02-14', 88],
      ['2025-02-15', 73],
      ['2025-02-16', 90],
      ['2025-02-17', 72],
      ['2025-02-18', 76],
      ['2025-02-19', 43],
      ['2025-02-20', 76],
      ['2025-02-21', 43],
      ['2025-02-22', 56],
      ['2025-02-23', 83],
      ['2025-02-24', 92],
      ['2025-02-25', 43],
      ['2025-02-26', 52],
      ['2025-02-27', 62],
      ['2025-02-28', 59],
      ['2025-03-01', 52],
      ['2025-03-02', 76],
      ['2025-03-03', 69],
      ['2025-03-04', 55],
      ['2025-03-05', 54],
      ['2025-03-06', 90],
      ['2025-03-07', 59],
      ['2025-03-08', 41],
      ['2025-03-09', 75]
    ],
    '3m': [
      ['2024-12-02', 45],
      ['2024-12-07', 38],
      ['2024-12-12', 54],
      ['2024-12-17', 48],
      ['2024-12-22', 55],
      ['2024-12-27', 56],

      ['2025-01-03', 59],
      ['2025-01-08', 54],
      ['2025-01-13', 54],
      ['2025-01-18', 58],
      ['2025-01-23', 60],
      ['2025-01-28', 58],

      ['2025-02-04', 58],
      ['2025-02-09', 64],
      ['2025-02-14', 65],
      ['2025-02-22', 58],
      ['2025-03-03', 67],
      ['2025-03-10', 72]
    ],
    '6m': [
      ['2024-10-01', 57],
      ['2024-11-01', 48],
      ['2024-12-01', 61],
      ['2025-01-01', 54],
      ['2025-02-01', 82],
      ['2025-03-01', 78]
    ],
    '1y': [
      ['2024-03-10', 45],
      ['2024-03-15', 38],
      ['2024-03-20', 54],
      ['2024-03-25', 48],
      ['2024-03-30', 55],
      ['2024-04-04', 56],

      ['2024-04-10', 59],
      ['2024-04-15', 54],
      ['2024-04-20', 54],
      ['2024-04-25', 58],
      ['2024-04-30', 60],
      ['2024-05-05', 58],

      ['2024-05-10', 58],
      ['2024-05-15', 64],
      ['2024-05-20', 65],
      ['2024-05-25', 58],
      ['2024-05-30', 67],
      ['2024-06-04', 72],

      ['2024-06-09', 68],
      ['2024-06-14', 65],
      ['2024-06-19', 72],
      ['2024-06-24', 66],
      ['2024-06-29', 71],
      ['2024-07-04', 72],

      ['2024-07-09', 80],
      ['2024-07-14', 69],
      ['2024-07-19', 67],
      ['2024-07-24', 73],
      ['2024-07-29', 92],
      ['2024-08-03', 89],

      ['2024-08-08', 82],
      ['2024-08-13', 95],
      ['2024-08-18', 91],
      ['2024-08-23', 89],
      ['2024-08-28', 73],
      ['2024-09-02', 80],

      ['2024-09-07', 86],
      ['2024-09-12', 65],
      ['2024-09-17', 74],
      ['2024-09-22', 83],
      ['2024-09-27', 91],
      ['2024-10-02', 74],

      ['2024-10-07', 72],
      ['2024-10-12', 85],
      ['2024-10-17', 71],
      ['2024-10-22', 78],
      ['2024-10-27', 70],
      ['2024-11-01', 88],

      ['2024-11-06', 85],
      ['2024-11-11', 70],
      ['2024-11-16', 86],
      ['2024-11-21', 94],
      ['2024-11-26', 90],
      ['2024-12-01', 74],

      ['2024-12-06', 76],
      ['2024-12-11', 90],
      ['2024-12-16', 82],
      ['2024-12-21', 83],
      ['2024-12-26', 85],
      ['2024-12-31', 80],

      ['2025-01-05', 81],
      ['2025-01-10', 91],
      ['2025-01-15', 90],
      ['2025-01-20', 93],
      ['2025-01-25', 94],
      ['2025-01-30', 95],

      ['2025-02-04', 90],
      ['2025-02-09', 90],
      ['2025-02-14', 86],
      ['2025-02-19', 95],
      ['2025-02-24', 91],
      ['2025-02-28', 90],

      ['2025-03-05', 94],
      ['2025-03-10', 90]
    ],
    all: [
      ['2015-01-01', 46],
      ['2015-02-01', 55],
      ['2015-03-01', 64],
      ['2015-04-01', 70],
      ['2015-05-01', 58],
      ['2015-06-01', 75],
      ['2015-07-01', 85],
      ['2015-08-01', 74],
      ['2015-09-01', 66],
      ['2015-10-01', 80],
      ['2015-11-01', 90],
      ['2015-12-01', 65],

      ['2016-01-01', 48],
      ['2016-02-01', 57],
      ['2016-03-01', 67],
      ['2016-04-01', 72],
      ['2016-05-01', 60],
      ['2016-06-01', 77],
      ['2016-07-01', 88],
      ['2016-08-01', 75],
      ['2016-09-01', 68],
      ['2016-10-01', 82],
      ['2016-11-01', 92],
      ['2016-12-01', 67],

      ['2017-01-01', 50],
      ['2017-02-01', 60],
      ['2017-03-01', 69],
      ['2017-04-01', 75],
      ['2017-05-01', 63],
      ['2017-06-01', 79],
      ['2017-07-01', 90],
      ['2017-08-01', 77],
      ['2017-09-01', 70],
      ['2017-10-01', 84],
      ['2017-11-01', 93],
      ['2017-12-01', 70],

      ['2018-01-01', 53],
      ['2018-02-01', 63],
      ['2018-03-01', 71],
      ['2018-04-01', 77],
      ['2018-05-01', 66],
      ['2018-06-01', 81],
      ['2018-07-01', 92],
      ['2018-08-01', 79],
      ['2018-09-01', 72],
      ['2018-10-01', 86],
      ['2018-11-01', 94],
      ['2018-12-01', 73],

      ['2019-01-01', 55],
      ['2019-02-01', 66],
      ['2019-03-01', 74],
      ['2019-04-01', 80],
      ['2019-05-01', 69],
      ['2019-06-01', 84],
      ['2019-07-01', 93],
      ['2019-08-01', 81],
      ['2019-09-01', 74],
      ['2019-10-01', 88],
      ['2019-11-01', 95],
      ['2019-12-01', 75],

      ['2020-01-01', 58],
      ['2020-02-01', 68],
      ['2020-03-01', 76],
      ['2020-04-01', 82],
      ['2020-05-01', 72],
      ['2020-06-01', 86],
      ['2020-07-01', 95],
      ['2020-08-01', 83],
      ['2020-09-01', 76],
      ['2020-10-01', 90],
      ['2020-11-01', 96],
      ['2020-12-01', 78],

      ['2021-01-01', 60],
      ['2021-02-01', 70],
      ['2021-03-01', 79],
      ['2021-04-01', 85],
      ['2021-05-01', 75],
      ['2021-06-01', 88],
      ['2021-07-01', 96],
      ['2021-08-01', 85],
      ['2021-09-01', 78],
      ['2021-10-01', 92],
      ['2021-11-01', 97],
      ['2021-12-01', 80],

      ['2022-01-01', 63],
      ['2022-02-01', 74],
      ['2022-03-01', 82],
      ['2022-04-01', 88],
      ['2022-05-01', 78],
      ['2022-06-01', 90],
      ['2022-07-01', 97],
      ['2022-08-01', 87],
      ['2022-09-01', 80],
      ['2022-10-01', 94],
      ['2022-11-01', 98],
      ['2022-12-01', 82],

      ['2023-01-01', 65],
      ['2023-02-01', 76],
      ['2023-03-01', 84],
      ['2023-04-01', 90],
      ['2023-05-01', 81],
      ['2023-06-01', 92],

      ['2024-01-01', 67],
      ['2024-02-01', 78],
      ['2024-03-01', 86],
      ['2024-04-01', 92],

      ['2025-01-01', 70],
      ['2025-02-01', 81],
      ['2025-03-01', 88],
      ['2025-04-01', 98]
    ]
  };

  const watchlistReportChartData = {
    '1d': [
      ['9 AM', 250],
      ['9:30 AM', 372],
      ['10 AM', 360],
      ['10:30 AM', 106],
      ['11 AM', 354],
      ['11:30 AM', 170],
      ['12 PM', 104],
      ['12:30 PM', 333],
      ['1 PM', 225],
      ['1:30 PM', 160],
      ['2 PM', 152],
      ['2:30 PM', 353],
      ['3 PM', 112],
      ['3:30 PM', 238],
      ['4 PM', 109]
    ],
    '5d': [
      ['2025-03-05', 150],
      ['2025-03-06', 99],
      ['2024-03-07', 143],
      ['2025-03-08', 245],
      ['2025-03-09', 116]
    ],
    '1m': [
      ['2025-02-08', 175],
      ['2025-02-09', 17],
      ['2025-02-10', 263],
      ['2025-02-11', 184],
      ['2025-02-12', 271],
      ['2025-02-13', 209],
      ['2025-02-14', 77],
      ['2025-02-15', 98],
      ['2025-02-16', 223],
      ['2025-02-17', 354],
      ['2025-02-18', 139],
      ['2025-02-19', 226],
      ['2025-02-20', 237],
      ['2025-02-21', 31],
      ['2025-02-22', 218],
      ['2025-02-23', 389],
      ['2025-02-24', 72],
      ['2025-02-25', 77],
      ['2025-02-26', 23],
      ['2025-02-27', 39],
      ['2025-02-28', 328],
      ['2025-03-01', 269],
      ['2025-03-02', 333],
      ['2025-03-03', 135],
      ['2025-03-04', 386],
      ['2025-03-05', 226],
      ['2025-03-06', 356],
      ['2025-03-07', 222],
      ['2025-03-08', 67],
      ['2025-03-09', 23]
    ],
    '3m': [
      ['2024-12-02', 187],
      ['2024-12-07', 325],
      ['2024-12-12', 92],
      ['2024-12-17', 268],
      ['2024-12-22', 154],
      ['2024-12-27', 379],

      ['2025-01-03', 205],
      ['2025-01-08', 98],
      ['2025-01-13', 134],
      ['2025-01-18', 245],
      ['2025-01-23', 287],
      ['2025-01-28', 160],

      ['2025-02-04', 312],
      ['2025-02-09', 64],
      ['2025-02-14', 291],
      ['2025-02-22', 179],
      ['2025-03-03', 250],
      ['2025-03-10', 370]
    ],
    '6m': [
      ['2024-10-01', 125],
      ['2024-11-01', 298],
      ['2024-12-01', 212],
      ['2025-01-01', 173],
      ['2025-02-01', 356],
      ['2025-03-01', 290]
    ],
    '1y': [
      ['2024-03-01', 170],
      ['2024-04-30', 220],
      ['2024-05-05', 220],
      ['2024-06-29', 235],
      ['2024-07-04', 80],
      ['2024-08-28', 35],
      ['2024-09-02', 160],
      ['2024-10-27', 160],
      ['2024-11-01', 80],
      ['2024-12-31', 270],
      ['2025-01-05', 190],
      ['2025-02-28', 110]
    ],
    all: [
      ['2001-01-01', 40],
      ['2002-01-01', 110],
      ['2003-01-01', 190],
      ['2004-01-01', 70],
      ['2005-01-01', 220],
      ['2006-01-01', 220],
      ['2007-01-01', 304],
      ['2008-01-01', 235],
      ['2009-01-01', 80],
      ['2010-01-01', 35],
      ['2011-01-01', 160],
      ['2012-01-01', 80],
      ['2013-01-01', 160],
      ['2014-01-01', 270],
      ['2015-01-01', 158],
      ['2016-01-01', 282],
      ['2017-01-01', 304],
      ['2018-01-01', 387],
      ['2019-01-01', 94],
      ['2020-01-01', 34],
      ['2021-01-01', 301],
      ['2022-01-01', 324],
      ['2023-01-01', 321],
      ['2024-01-01', 179],
      ['2025-01-01', 55]
    ]
  };

  const portfolioLineChartInit = () => {
    const { getColor, rgbaColor, getData, breakpoints } = window.phoenix.utils;

    const formatXAxisLabel = (range, value) => {
      switch (range) {
        case '1d':
          return value;
        case '6m':
        case '1y':
          return window.dayjs(value).format('MMM');
        case 'all':
          return window.dayjs(value).format('YYYY');
        default:
          return window.dayjs(value).format('MMM DD');
      }
    };

    const formatInterval = (range, width) => {
      switch (range) {
        case '1y':
          return width <= breakpoints.sm ? 'auto' : 5;
        case 'all':
          return width <= breakpoints.sm ? 'auto' : 10;
        default:
          return 'auto';
      }
    };

    const getDefaultOptions = (data, range, screenWidth) => () => ({
      tooltip: {
        trigger: 'axis',
        padding: [7, 10],
        backgroundColor: getColor('body-highlight-bg'),
        borderColor: getColor('border-color'),
        textStyle: { color: getColor('light-text-emphasis') },
        borderWidth: 1,
        transitionDuration: 0,
        axisPointer: {
          type: 'none'
        }
      },
      dataZoom: {
        type: 'inside',
        start: 0,
        end: 100,
        minValueSpan: 17,
        disabled: data.length < 25
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item[0]),
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: getColor('border-color-translucent')
          }
        },
        axisTick: { show: false },
        axisLabel: {
          hideOverlap: data.length > 31,
          showMinLabel: true,
          color: getColor('tertiary-color'),
          formatter: value => formatXAxisLabel(range, value),
          margin: 15,
          interval: formatInterval(range, screenWidth)
        },
        splitLine: {
          show: false
        },
        animationDuration: 200,
        animationEasing: 'cubicOut'
      },
      yAxis: {
        type: 'value',
        position: 'right',
        splitLine: {
          lineStyle: {
            type: 'line',
            color: getColor('border-color-translucent')
          }
        },
        boundaryGap: false,
        axisLabel: {
          show: true,
          color: getColor('body-color'),
          margin: 15,
          formatter: value => `${value}K`,
          interval: 20
        },
        axisTick: { show: false },
        axisLine: { show: false },
        max: 100
      },
      series: [
        {
          type: 'line',
          name: 'Growth',
          data: data.map(item => item[1]),
          itemStyle: {
            color: getColor('body-highlight-bg'),
            borderColor: getColor('primary'),
            borderWidth: 1
          },
          lineStyle: {
            color: getColor('primary'),
            width: 1
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: rgbaColor(getColor('primary'), 0.5)
                },
                {
                  offset: 1,
                  color: rgbaColor(getColor('primary'), 0)
                }
              ]
            }
          },
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 10,
          hoverAnimation: true
        }
      ],
      grid: {
        right: 3,
        left: 20,
        bottom: 10,
        top: 5,
        containLabel: true
      },
      animationDurationUpdate: 200,
      animationEasingUpdate: 'cubicOut'
    });

    const initChart = (el, range) => {
      if (!el) return;

      const $chart = window.echarts.init(el);

      const updateChart = () => {
        const screenWidth = window.innerWidth;
        const userOptions = getData(el, 'options');
        const chartData = portfolioLineChartData[range];
        const chartOptions = getDefaultOptions(chartData, range, screenWidth);
        echartSetOption($chart, userOptions, chartOptions);
      };

      updateChart();

      window.addEventListener('resize', () => {
        updateChart();
      });
    };
    const $chartEl = document.querySelector('.echart-portfolio-line-chart');

    initChart($chartEl, '1y');
    const buttons = document.querySelectorAll('[data-line-filter]');
    if (buttons.length) {
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          const range = getData(button, 'value');
          initChart($chartEl, range);
        });
      });
    }
  };

  const watchlistReportChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;

    const formatXAxisLabel = (range, value) => {
      switch (range) {
        case '1d':
          return value;
        case '5d':
        case '1m':
        case '3m':
          return window.dayjs(value).format('MMM DD');
        case 'all':
          return window.dayjs(value).format('YYYY');
        default:
          return window.dayjs(value).format('MMM');
      }
    };

    const getDefaultOptions = (data, range) => () => ({
      dataZoom: {
        type: 'inside',
        start: 30,
        end: 100,
        minValueSpan: 10,
        disabled: data.length < 25
      },
      tooltip: {
        trigger: 'axis',
        padding: [7, 10],
        backgroundColor: getColor('body-highlight-bg'),
        borderColor: getColor('border-color'),
        textStyle: { color: getColor('light-text-emphasis') },
        borderWidth: 1,
        formatter: params => tooltipFormatter(params),
        transitionDuration: 0,
        axisPointer: {
          type: 'none'
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item[0]),
        axisLine: {
          lineStyle: {
            color: getColor('border-color-translucent'),
            type: 'solid'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: getColor('tertiary-color'),
          formatter: value => formatXAxisLabel(range, value),
          margin: 15
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: true,
        position: 'right',
        axisLabel: {
          show: true,
          color: getColor('body-color'),
          margin: 15,
          formatter: value => `$${value}`
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: getColor('secondary-bg')
          }
        },
        axisTick: { show: false },
        axisLine: { show: false },
        min: 0,
        interval: 80,
        max: 400
      },
      series: [
        {
          type: 'bar',
          name: 'Total',
          data: data.map(item => item[1]),
          lineStyle: { color: getColor('primary-light') },
          itemStyle: {
            color: getColor('primary-light'),
            barBorderRadius: [3, 3, 0, 0]
          },
          showSymbol: false,
          symbol: 'circle',
          smooth: false,
          hoverAnimation: true,
          barWidth: 16
        }
      ],
      grid: {
        right: 5,
        left: 8,
        bottom: 5,
        top: 10,
        containLabel: true
      }
    });

    const initChart = (el, options) => {
      const userOptions = getData(el, 'options');
      const chart = window.echarts.init(el);

      echartSetOption(chart, userOptions, options);
    };

    initChart(
      document.querySelector('.echart-watchlist-report-chart'),
      getDefaultOptions(watchlistReportChartData['1y'], '1y')
    );
    const buttons = document.querySelectorAll('[data-bar-filter]');

    if (buttons.length) {
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const $chartEl = document.querySelector(
            '.echart-watchlist-report-chart'
          );

          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          const range = getData(button, 'value');
          const chartData = watchlistReportChartData[range];

          initChart($chartEl, getDefaultOptions(chartData, range));
        });
      });
    }
  };

  const stockOverviewChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $stockOverviewChart = document.querySelectorAll(
      '.echart-stock-overview-chart'
    );
    const generateXAxisLabels = (startDate, count) => {
      const labels = [];
      const start = new Date(startDate);
      Array.from({ length: count }).map((_, i) => {
        return labels.push(
          window
            .dayjs(start)
            .add(i + 1, 'day')
            .format('DD MMM')
        );
      });
      return labels;
    };

    const tooltipFormatter = params => {
      return `
    <div>
        <h6 class="fs-9 text-body-tertiary mb-0">
          <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
          ${params[0].name} : ${params[0].value}
        </h6>
    </div>
    `;
    };

    if ($stockOverviewChart.length) {
      $stockOverviewChart.forEach($chart => {
        const userOptions = getData($chart, 'echarts');
        const { data } = userOptions;
        const chart = window.echarts.init($chart);

        const getDefaultOptions = () => ({
          tooltip: {
            trigger: 'axis',
            padding: [7, 10],
            backgroundColor: getColor('body-highlight-bg'),
            borderColor: getColor('border-color'),
            textStyle: { color: getColor('light-text-emphasis') },
            borderWidth: 1,
            formatter: params => tooltipFormatter(params),
            transitionDuration: 0,
            axisPointer: {
              type: 'none'
            }
          },
          xAxis: [
            {
              type: 'category',
              data: generateXAxisLabels('11/1/2023', userOptions.length),
              show: true,
              boundaryGap: false,
              axisLine: {
                show: true,
                lineStyle: {
                  type: 'dashed',
                  width: 1.5,
                  color: getColor('body-highlight-bg')
                }
              },
              axisTick: { show: false },
              axisLabel: {
                formatter: value => window.dayjs(value).format('DD MMM'),
                showMinLabel: true,
                showMaxLabel: false,
                color: getColor('secondary-color'),
                align: 'left',
                interval: 5,
                fontFamily: 'Nunito Sans',
                fontWeight: 600,
                fontSize: 12.8
              }
            }
          ],
          yAxis: {
            show: false,
            type: 'value',
            boundaryGap: false
          },
          series: [
            {
              type: 'line',
              data,
              itemStyle: {
                color: getColor('body-highlight-bg'),
                borderColor: getColor('success')
              },
              lineStyle: {
                color: getColor('success'),
                width: 1
              },
              showSymbol: false,
              symbolSize: 10,
              symbol: 'circle',
              smooth: false,
              hoverAnimation: true,
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: rgbaColor(getColor('success'), 0.5)
                    },
                    {
                      offset: 1,
                      color: rgbaColor(getColor('success'), 0.05)
                    }
                  ]
                }
              }
            }
          ],
          grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
        });

        echartSetOption(chart, userOptions, getDefaultOptions);
      });
    }
  };

  const stockOverviewInvertedChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $stockOverviewChart = document.querySelectorAll(
      '.echart-stock-overview-inverted-chart'
    );
    const generateXAxisLabels = (startDate, count) => {
      const labels = [];
      const start = new Date(startDate);
      Array.from({ length: count }).map((_, i) => {
        return labels.push(
          window
            .dayjs(start)
            .add(i + 1, 'day')
            .format('DD MMM')
        );
      });
      return labels;
    };

    const tooltipFormatter = params => {
      return `
    <div>
        <h6 class="fs-9 text-body-tertiary mb-0">
          <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
          ${params[0].name} : ${params[0].value}
        </h6>
    </div>
    `;
    };

    if ($stockOverviewChart.length) {
      $stockOverviewChart.forEach($chart => {
        const userOptions = getData($chart, 'echarts');
        const { data } = userOptions;
        const chart = window.echarts.init($chart);

        const getDefaultOptions = () => ({
          tooltip: {
            trigger: 'axis',
            padding: [7, 10],
            backgroundColor: getColor('body-highlight-bg'),
            borderColor: getColor('border-color'),
            textStyle: { color: getColor('light-text-emphasis') },
            borderWidth: 1,
            formatter: params => tooltipFormatter(params),
            transitionDuration: 0,
            axisPointer: {
              type: 'none'
            }
          },
          xAxis: [
            {
              type: 'category',
              data: generateXAxisLabels('11/1/2023', userOptions.length),
              show: true,
              boundaryGap: false,
              axisLine: {
                show: true,
                lineStyle: {
                  type: 'dashed',
                  width: 1.5,
                  color: getColor('body-highlight-bg')
                }
              },
              axisTick: { show: false },
              axisLabel: {
                formatter: value => window.dayjs(value).format('DD MMM'),
                showMinLabel: true,
                showMaxLabel: false,
                color: getColor('secondary-color'),
                align: 'left',
                interval: 5,
                fontFamily: 'Nunito Sans',
                fontWeight: 600,
                fontSize: 12.8
              }
            }
          ],
          yAxis: {
            show: false,
            type: 'value',
            boundaryGap: false
          },
          series: [
            {
              type: 'line',
              data,
              itemStyle: {
                color: getColor('body-highlight-bg'),
                borderColor: getColor('danger'),
                borderWidth: 2
              },
              lineStyle: {
                color: getColor('danger'),
                width: 1
              },
              showSymbol: false,
              symbolSize: 10,
              symbol: 'circle',
              smooth: false,
              hoverAnimation: true,
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: rgbaColor(getColor('danger'), 0.05)
                    },
                    {
                      offset: 1,
                      color: rgbaColor(getColor('danger'), 0.5)
                    }
                  ]
                }
              }
            }
          ],
          grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
        });

        echartSetOption(chart, userOptions, getDefaultOptions);
      });
    }
  };

  const stockOverviewMixedChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $stockOverviewChart = document.querySelectorAll(
      '.echart-stock-overview-mixed-chart'
    );
    const generateXAxisLabels = (startDate, count) => {
      const labels = [];
      const start = new Date(startDate);
      Array.from({ length: count }).map((_, i) => {
        return labels.push(
          window
            .dayjs(start)
            .add(i + 1, 'day')
            .format('DD MMM')
        );
      });
      return labels;
    };

    const tooltipFormatter = params => {
      return `
    <div>
        <h6 class="fs-9 text-body-tertiary mb-0">
          <span class="fas fa-circle me-1" style='color:${params[0].color}'></span>
          ${params[0].name} : ${params[0].value}
        </h6>
    </div>
    `;
    };

    if ($stockOverviewChart.length) {
      $stockOverviewChart.forEach($chart => {
        const userOptions = getData($chart, 'echarts');
        const { data } = userOptions;
        const chart = window.echarts.init($chart);

        const getDefaultOptions = () => ({
          tooltip: {
            trigger: 'axis',
            padding: [7, 10],
            backgroundColor: getColor('body-highlight-bg'),
            borderColor: getColor('border-color'),
            textStyle: { color: getColor('light-text-emphasis') },
            borderWidth: 1,
            formatter: params => tooltipFormatter(params),
            transitionDuration: 0,
            axisPointer: {
              type: 'none'
            }
          },
          xAxis: [
            {
              type: 'category',
              data: generateXAxisLabels('11/1/2023', userOptions.length),
              show: true,
              boundaryGap: false,
              axisLine: {
                show: true,
                lineStyle: {
                  type: 'dashed',
                  width: 1.5,
                  color: getColor('body-highlight-bg')
                }
              },
              axisTick: { show: false },
              axisLabel: {
                formatter: value => window.dayjs(value).format('DD MMM'),
                showMinLabel: true,
                showMaxLabel: false,
                color: getColor('secondary-color'),
                align: 'left',
                interval: 5,
                fontFamily: 'Nunito Sans',
                fontWeight: 600,
                fontSize: 12.8
              }
            }
          ],
          yAxis: {
            show: false,
            type: 'value',
            boundaryGap: false
          },
          series: [
            {
              type: 'line',
              data,
              showSymbol: false,
              symbolSize: 10,
              symbol: 'circle',
              smooth: false,
              hoverAnimation: true,
              itemStyle: {
                borderWidth: 2
              },
              lineStyle: {
                width: 1
              },
              areaStyle: {}
            }
          ],
          visualMap: {
            show: false,
            left: 'right',
            inRange: {
              color: [
                rgbaColor(getColor('danger'), 0.5),
                rgbaColor(getColor('success'), 0.4)
              ]
            },
            min: 0,
            max: 1,
            calculable: true
          },
          grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
        });

        echartSetOption(chart, userOptions, getDefaultOptions);
      });
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(portfolioLineChartInit);
  docReady(watchlistReportChartInit);

  docReady(stockOverviewChartInit);
  docReady(stockOverviewInvertedChartInit);
  docReady(stockOverviewMixedChartInit);

}));
//# sourceMappingURL=stock-portfolio-watchlist.js.map

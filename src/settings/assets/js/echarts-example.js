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

  const handleTooltipPosition = ([pos, , dom, , size]) => {
    // only for mobile device
    if (window.innerWidth <= 540) {
      const tooltipHeight = dom.offsetHeight;
      const obj = { top: pos[1] - tooltipHeight - 20 };
      obj[pos[0] < size.viewSize[0] / 2 ? 'left' : 'right'] = 5;
      return obj;
    }
    return null; // else default behaviour
  };

  const basicLineChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-line-chart-example');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const data = [
      1000, 1500, 1250, 1010, 1045, 2000, 1200, 1330, 1000, 1200, 1410, 1200
    ];

    const tooltipFormatter = params => {
      return `
    <div>
        <h6 class="fs-9 text-body-tertiary mb-0">
          <span class="fas fa-circle me-1" style='color:${params[0].borderColor}'></span>
          ${params[0].name} : ${params[0].value}
        </h6>
    </div>
    `;
    };

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: tooltipFormatter,
          axisPointer: {
            type: 'none'
          }
        },
        xAxis: {
          type: 'category',
          data: months,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => value.substring(0, 3),
            margin: 15
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false },
          min: 600
        },
        series: [
          {
            type: 'line',
            data,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 10,
            smooth: false,
            hoverAnimation: true
          }
        ],
        grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const basicAreaLineChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-area-line-chart-example');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const data = [
      1020, 1160, 1300, 958, 1240, 1020, 1409, 1200, 1051, 1120, 1240, 1054
    ];

    const tooltipFormatter = params => {
      return `
    <div>
        <h6 class="fs-9 text-body-tertiary mb-0">
          <span class="fas fa-circle me-1" style='color:${params[0].borderColor}'></span>
          ${params[0].name} : ${params[0].value}
        </h6>
    </div>
    `;
    };

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        xAxis: {
          type: 'category',
          data: months,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => value.substring(0, 3),
            margin: 15
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false },
          min: 600
        },
        series: [
          {
            type: 'line',
            data,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
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
                    color: rgbaColor(getColor('primary'), 0.5)
                  },
                  {
                    offset: 1,
                    color: rgbaColor(getColor('primary'), 0)
                  }
                ]
              }
            }
          }
        ],
        grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const stackedLineChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-stacked-line-chart-example');
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
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
          },
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          data: days,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            margin: 15,
            formatter: value => value.substring(0, 3)
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg'),
              type: 'dashed'
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Matcha Latte',
            type: 'line',
            symbolSize: 6,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('info'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('info')
            },
            symbol: 'circle',
            stack: 'product',
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Milk Tea',
            type: 'line',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('success'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('success')
            },
            symbol: 'circle',
            stack: 'product',
            data: [220, 182, 191, 234, 290, 330, 310]
          },
          {
            name: 'Cheese Cocoa',
            type: 'line',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle',
            stack: 'product',
            data: [150, 232, 201, 154, 190, 330, 410]
          },
          {
            name: 'Cheese Brownie',
            type: 'line',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('warning')
            },
            symbol: 'circle',
            stack: 'product',
            data: [320, 332, 301, 334, 390, 330, 320]
          },
          {
            name: 'Matcha Cocoa',
            type: 'line',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle',
            stack: 'product',
            data: [820, 932, 901, 934, 1290, 1330, 1320]
          }
        ],
        grid: { right: 10, left: 5, bottom: 5, top: 8, containLabel: true }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const stackedAreaChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-stacked-area-chart-example');
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
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
          },
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          data: days,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            margin: 15,
            formatter: value => value.substring(0, 3)
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Matcha Latte',
            type: 'line',
            symbolSize: 10,
            stack: 'product',
            data: [120, 132, 101, 134, 90, 230, 210],
            areaStyle: {
              color: rgbaColor(getColor('info'), 0.3)
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('info'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('info')
            },
            symbol: 'circle'
          },
          {
            name: 'Milk Tea',
            type: 'line',
            symbolSize: 10,
            stack: 'product',
            data: [220, 182, 191, 234, 290, 330, 310],
            areaStyle: {
              color: rgbaColor(getColor('success'), 0.3)
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('success'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('success')
            },
            symbol: 'circle'
          },
          {
            name: 'Cheese Cocoa',
            type: 'line',
            symbolSize: 10,
            stack: 'product',
            data: [150, 232, 201, 154, 190, 330, 410],
            areaStyle: {
              color: rgbaColor(getColor('danger'), 0.3)
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle'
          },
          {
            name: 'Cheese Brownie',
            type: 'line',
            symbolSize: 10,
            stack: 'product',
            data: [320, 332, 301, 334, 390, 330, 320],
            areaStyle: {
              color: rgbaColor(getColor('warning'), 0.3)
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('warning')
            },
            symbol: 'circle'
          },
          {
            name: 'Matcha Cocoa',
            type: 'line',
            symbolSize: 10,
            stack: 'product',
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            areaStyle: {
              color: rgbaColor(getColor('primary'), 0.3)
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle'
          }
        ],
        grid: { right: 10, left: 5, bottom: 5, top: 8, containLabel: true }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const lineMarkerChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-line-marker-chart-example');
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [
          getColor('primary'),
          getColor('warning')
          // getColor('danger')
        ],
        legend: {
          data: [
            {
              name: 'Max',
              textStyle: {
                color: getColor('quaternary-color')
              }
            },
            {
              name: 'Min',
              textStyle: {
                color: getColor('quaternary-color')
              }
            }
          ]
        },
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
          },
          formatter: tooltipFormatter
        },
        xAxis: {
          type: 'category',
          data: days,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            formatter: value => value.substring(0, 3),
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Max',
            type: 'line',
            data: [10, 11, 13, 11, 12, 9, 12],
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle',
            markPoint: {
              itemStyle: {
                color: getColor('primary')
              },
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
              ]
            },
            markLine: {
              lineStyle: {
                color: getColor('primary')
              },
              label: {
                color: getColor('quaternary-color')
              },
              data: [{ type: 'average', name: 'average' }]
            }
          },
          {
            name: 'Min',
            type: 'line',
            data: [1, -2, 2, 5, 3, 2, 0],
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle',
            markPoint: {
              itemStyle: {
                color: getColor('danger')
              },
              label: {
                color: '#fff'
              },
              data: [{ name: 'Weekly lowest', value: -2, xAxis: 1, yAxis: -1.5 }]
            },
            markLine: {
              lineStyle: {
                color: getColor('danger')
              },
              label: {
                color: getColor('quaternary-color')
              },
              data: [
                { type: 'average', name: 'average' },
                [
                  {
                    symbol: 'none',
                    x: '90%',
                    yAxis: 'max'
                  },
                  {
                    symbol: 'circle',
                    label: {
                      position: 'start',
                      formatter: 'Max'
                    },
                    type: 'max',
                    name: 'Highest point'
                  }
                ]
              ]
            }
          }
        ],
        grid: { right: '5%', left: '5%', bottom: '10%', top: '15%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const areaPiecesChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-area-pieces-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
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
          },
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            margin: 15,
            formatter: value => window.dayjs(value).format('MMM DD')
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        visualMap: {
          type: 'piecewise',
          show: false,
          dimension: 0,
          seriesIndex: 0,
          pieces: [
            {
              gt: 1,
              lt: 3,
              color: rgbaColor(getColor('primary'), 0.4)
            },
            {
              gt: 5,
              lt: 7,
              color: rgbaColor(getColor('primary'), 0.4)
            }
          ]
        },
        series: [
          {
            type: 'line',
            name: 'Total',
            smooth: 0.6,
            symbol: 'none',
            lineStyle: {
              color: getColor('primary'),
              width: 5
            },
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
            },
            areaStyle: {},
            data: [
              ['2019-10-10', 100],
              ['2019-10-11', 300],
              ['2019-10-12', 450],
              ['2019-10-13', 300],
              ['2019-10-14', 250],
              ['2019-10-15', 750],
              ['2019-10-16', 650],
              ['2019-10-17', 550],
              ['2019-10-18', 200]
            ]
          }
        ],
        grid: { right: 20, left: 5, bottom: 5, top: 8, containLabel: true }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const stepLineChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-step-line-chart-example');

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [getColor('danger'), getColor('warning'), getColor('primary')],

        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          data: days,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            formatter: value => value.substring(0, 3),
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            show: false
          },
          axisPointer: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            name: 'Step Start',
            type: 'line',
            step: 'start',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle',
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Step Middle',
            type: 'line',
            step: 'middle',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('warning')
            },
            symbol: 'circle',
            data: [220, 282, 201, 234, 290, 430, 410]
          },
          {
            name: 'Step End',
            type: 'line',
            step: 'end',
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle',
            data: [450, 432, 401, 454, 590, 530, 510]
          }
        ],
        grid: { right: '3%', left: '8%', bottom: '10%', top: '5%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const lineGradientChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-line-gradient-chart-example'
    );

    const data = [
      ['2021-06-05', 116],
      ['2021-06-06', 129],
      ['2021-06-07', 135],
      ['2021-06-08', 86],
      ['2021-06-09', 73],
      ['2021-06-10', 85],
      ['2021-06-11', 73],
      ['2021-06-12', 68],
      ['2021-06-13', 92],
      ['2021-06-14', 130],
      ['2021-06-15', 245],
      ['2021-06-16', 139],
      ['2021-06-17', 115],
      ['2021-06-18', 111],
      ['2021-06-19', 309],
      ['2021-06-20', 206],
      ['2021-06-21', 137],
      ['2021-06-22', 128],
      ['2021-06-23', 85],
      ['2021-06-24', 94],
      ['2021-06-25', 71],
      ['2021-06-26', 106],
      ['2021-06-27', 84],
      ['2021-06-28', 93],
      ['2021-06-29', 85],
      ['2021-06-30', 73],
      ['2021-07-01', 83],
      ['2021-07-02', 125],
      ['2021-07-03', 107],
      ['2021-07-04', 82],
      ['2021-07-05', 44],
      ['2021-07-06', 72],
      ['2021-07-07', 106],
      ['2021-07-08', 107],
      ['2021-07-09', 66],
      ['2021-07-10', 91],
      ['2021-07-11', 92],
      ['2021-07-12', 113],
      ['2021-07-13', 107],
      ['2021-07-14', 250],
      ['2021-07-15', 111],
      ['2021-07-16', 350],
      ['2021-07-17', 150],
      ['2021-07-18', 420],
      ['2021-07-19', 77],
      ['2021-07-20', 83],
      ['2021-07-21', 111],
      ['2021-07-22', 57],
      ['2021-07-23', 55],
      ['2021-07-24', 60]
    ];

    const dateList = data.map(item => {
      return item[0];
    });
    const valueList = data.map(item => {
      return item[1];
    });

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        visualMap: {
          show: false,
          type: 'continuous',
          dimension: 0,
          min: 0,
          max: dateList.length - 1,
          color: [getColor('danger'), getColor('warning')]
        },
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
          },
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          data: dateList,
          axisLabel: {
            formatter: value => window.dayjs(value).format('MMM DD'),
            color: getColor('quaternary-color'),
            margin: 15
          },
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisPointer: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg'),
              type: 'dashed'
            }
          }
        },
        grid: { right: '3%', left: '8%', bottom: '10%', top: '5%' },
        series: {
          name: 'Total',
          type: 'line',
          showSymbol: false,
          symbolSize: 10,
          symbol: 'circle',
          data: valueList,
          itemStyle: {
            borderWidth: 2
          }
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const dynamicLineChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-dynamic-line-chart-example');

    const data = [];
    let now = +new Date(1997, 9, 3);
    const oneDay = 24 * 3600 * 1000;
    let value = Math.random() * 1000;

    const randomData = () => {
      now = new Date(+now + oneDay);
      value = value + Math.random() * 21 - 10;
      return {
        name: now.toString(),
        value: [
          [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
          Math.round(value)
        ]
      };
    };

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 1000; i++) {
      data.push(randomData());
    }

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },

          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisPointer: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          },
          axisLabel: {
            color: getColor('quaternary-color')
          }
        },
        series: [
          {
            name: 'Total',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data,
            lineStyle: {
              color: getColor('primary')
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            symbol: 'circle',
            symbolSize: 10
          }
        ],
        grid: { right: 5, left: '7%', bottom: '10%', top: '5%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      setInterval(() => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 5; i++) {
          data.shift();
          data.push(randomData());
        }

        chart.setOption({
          series: [
            {
              data
            }
          ]
        });
      }, 1000);
    }
  };

  const lineLogChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-line-log-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: { show: false },
          data: Array.from(Array(10).keys()).map(item => item + 1)
        },
        yAxis: {
          type: 'log',
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          }
        },
        series: [
          {
            name: 'Index Of 3',
            type: 'line',
            data: [1, 3, 9, 27, 81, 247, 741, 2223, 6669],
            symbolSize: 7,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle'
          },
          {
            name: 'Index of 2',
            type: 'line',
            data: [1, 2, 4, 8, 16, 32, 64, 128, 256],
            symbolSize: 7,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('success'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('success')
            },
            symbol: 'circle'
          },
          {
            name: 'Index of 1/2',
            type: 'line',
            data: [
              1 / 2,
              1 / 4,
              1 / 8,
              1 / 16,
              1 / 32,
              1 / 64,
              1 / 128,
              1 / 256,
              1 / 512
            ],
            symbolSize: 7,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('info'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('info')
            },
            symbol: 'circle'
          }
        ],
        grid: {
          right: 10,
          left: 5,
          bottom: 5,
          top: 10,
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const shareDatasetChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-share-dataset-chart-example'
    );

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [
          getColor('danger'),
          getColor('warning'),
          getColor('info'),
          getColor('primary')
        ],
        legend: {
          top: 0,
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        dataset: {
          source: [
            ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
            ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
            ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
            ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
            ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
          ]
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisPointer: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        yAxis: {
          gridIndex: 0,
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          }
        },
        series: [
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' },
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('danger'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('danger')
            },
            symbol: 'circle'
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' },
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('info'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('info')
            },
            symbol: 'circle'
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' },
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('warning')
            },
            symbol: 'circle'
          },
          {
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' },
            symbolSize: 10,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle'
          },
          {
            type: 'pie',
            id: 'pie',
            radius: '30%',
            center: ['50%', '28%'],
            emphasis: { focus: 'data' },
            label: {
              formatter: '{b}: {@2012} ({d}%)',
              color: getColor('tertiary-color')
            },
            encode: {
              itemName: 'product',
              value: '2012',
              tooltip: '2012'
            }
          }
        ],
        grid: {
          right: 10,
          left: 5,
          bottom: 5,
          top: '55%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const basicBarChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-basic-bar-chart-example');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const data = [
      1020, 1160, 1300, 958, 1240, 1020, 1409, 1200, 1051, 1120, 1240, 1054
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        xAxis: {
          type: 'category',
          data: months,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => value.substring(0, 3),
            margin: 15
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: true,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisTick: { show: false },
          axisLine: { show: false },
          min: 600
        },
        series: [
          {
            type: 'bar',
            name: 'Total',
            data,
            lineStyle: { color: getColor('primary') },
            itemStyle: {
              color: getColor('primary'),
              barBorderRadius: [3, 3, 0, 0]
            },
            showSymbol: false,
            symbol: 'circle',
            smooth: false,
            hoverAnimation: true
          }
        ],
        grid: { right: '3%', left: '10%', bottom: '10%', top: '5%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const horizontalBarChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-horizontal-bar-chart-example'
    );
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const data = [
      1020, 1160, 1300, 958, 1240, 1020, 1409, 1200, 1051, 1120, 1240, 1054
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          formatter: tooltipFormatter,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          }
        },
        xAxis: {
          type: 'value',
          boundaryGap: false,
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: { show: true },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            show: false
          },
          min: 600
        },
        yAxis: {
          type: 'category',
          data: months,
          boundaryGap: true,
          axisLabel: {
            formatter: value => value.substring(0, 3),
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        series: [
          {
            type: 'bar',
            name: 'Total',
            data,
            lineStyle: { color: getColor('primary') },
            itemStyle: {
              color: getColor('primary'),
              barBorderRadius: [0, 3, 3, 0]
            },
            showSymbol: false,
            symbol: 'circle',
            smooth: false,
            hoverAnimation: true
          }
        ],
        grid: { right: '3%', left: '10%', bottom: '10%', top: '0%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const barNegativeChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-bar-negative-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params => tooltipFormatter(params)
        },
        grid: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        },
        xAxis: {
          type: 'value',
          position: 'top',
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: getColor('secondary-bg')
            }
          }
        },
        yAxis: {
          type: 'category',
          axisLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          data: [
            'Ten',
            'Nine',
            'Eight',
            'Seven',
            'Six',
            'Five',
            'Four',
            'Three',
            'Two',
            'One'
          ]
        },
        series: [
          {
            name: 'Cost',
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              formatter: '{b}',
              color: '#fff'
            },
            itemStyle: {
              color: getColor('primary')
            },
            data: [-0.15, -0.45, 0.3, 0.55, -0.23, 0.09, -0.56, 0.47, -0.36, 0.32]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const seriesBarChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-series-bar-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [getColor('primary'), getColor('info')],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params => tooltipFormatter(params)
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: value => `${value / 1000}k`,
            color: getColor('quaternary-color')
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: getColor('secondary-bg')
            }
          }
        },
        yAxis: {
          type: 'category',
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisTick: { show: false },
          splitLine: { show: false },
          data: ['Brazil', 'Indonesia', 'USA', 'India', 'China']
        },
        series: [
          {
            name: '2011',
            type: 'bar',
            data: [131744, 104970, 29034, 235481, 132541],
            itemStyle: {
              barBorderRadius: [0, 3, 3, 0]
            }
          },
          {
            name: '2012',
            type: 'bar',
            data: [134141, 121594, 31000, 141201, 124115],
            itemStyle: {
              barBorderRadius: [0, 3, 3, 0]
            }
          }
        ],
        grid: { right: 15, left: '12%', bottom: '10%', top: 5 }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const stackedBarChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-stacked-bar-chart-example');

    const xAxisData = [];
    const data1 = [];
    const data2 = [];
    const data3 = [];
    const data4 = [];

    for (let i = 0; i < 10; i += 1) {
      xAxisData.push('Class'.concat(i + 1));
      data1.push((Math.random() * 2).toFixed(2));
      data2.push((Math.random() * 5).toFixed(2));
      data3.push((Math.random() + 0.3).toFixed(2));
      data4.push(-Math.random().toFixed(2));
    }

    const emphasisStyle = {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: rgbaColor(getColor('light-text-emphasis'), 0.3)
      }
    };

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [
          getColor('primary'),
          getColor('info'),
          getColor('warning'),
          getColor('danger')
        ],
        legend: {
          data: ['Bar1', 'Bar2', 'Bar3', 'Bar4'],
          textStyle: {
            color: getColor('tertiary-color')
          },
          left: 0
        },
        toolbox: {
          feature: {
            magicType: {
              type: ['stack', 'tiled']
            }
          },
          iconStyle: {
            borderColor: getColor('tertiary-color'),
            borderWidth: 1
          }
        },
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          }
        },
        xAxis: {
          data: xAxisData,
          splitLine: { show: false },
          splitArea: { show: false },

          axisLabel: {
            color: getColor('quaternary-color')
          },

          axisLine: {
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLabel: {
            color: getColor('quaternary-color')
          }
        },
        series: [
          {
            name: 'Bar1',
            type: 'bar',
            stack: 'one',
            emphasis: emphasisStyle,
            data: data1
          },
          {
            name: 'Bar2',
            type: 'bar',
            stack: 'one',
            emphasis: emphasisStyle,
            data: data2
          },
          {
            name: 'Bar3',
            type: 'bar',
            stack: 'two',
            emphasis: emphasisStyle,
            data: data3
          },
          {
            name: 'Bar4',
            type: 'bar',
            stack: 'two',
            emphasis: emphasisStyle,
            data: data4
          }
        ],
        grid: {
          top: '10%',
          bottom: 10,
          left: 5,
          right: 7,
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const stackedHorizontalBarChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-stacked-horizontal-bar-chart-example'
    );

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [
          getColor('info'),
          getColor('danger'),
          getColor('warning'),
          getColor('success'),
          getColor('primary')
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: (...params) => handleTooltipPosition(params),
          formatter: tooltipFormatter
        },
        toolbox: {
          feature: {
            magicType: {
              type: ['stack', 'tiled']
            }
          },
          right: 0
        },
        legend: {
          data: [
            'Direct',
            'Mail Ad',
            'Affiliate Ad',
            'Video Ad',
            'Search Engine'
          ],
          textStyle: {
            color: getColor('tertiary-color')
          },
          left: 0
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            lineStyle: {
              show: true,
              color: getColor('secondary-bg')
            }
          }
        },
        yAxis: {
          type: 'category',
          data: days,
          axisLine: {
            lineStyle: {
              show: true,
              color: getColor('tertiary-bg')
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => value.substring(0, 3)
          }
        },
        series: [
          {
            name: 'Direct',
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              textStyle: {
                color: '#fff'
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: [400, 241, 451, 150, 321, 330, 142]
          },
          {
            name: 'Mail Ad',
            type: 'bar',
            stack: 'total',
            label: {
              show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: [250, 200, 222, 240, 230, 230, 211]
          },
          {
            name: 'Affiliate Ad',
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              textStyle: {
                color: '#fff'
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: [190, 182, 170, 195, 260, 333, 124]
          },
          {
            name: 'Video Ad',
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              textStyle: {
                color: '#fff'
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: [150, 212, 201, 154, 190, 330, 410]
          },
          {
            name: 'Search Engine',
            type: 'bar',
            stack: 'total',
            label: {
              show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: [1000, 900, 700, 1100, 1200, 1300, 1350]
          }
        ],
        grid: {
          right: 15,
          left: 5,
          bottom: 5,
          top: '15%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const barRaceChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-bar-race-chart-example');

    let data = Array.from(Array(7).keys()).map(() =>
      Math.round(Math.random() * 200)
    );

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        xAxis: {
          max: 'dataMax',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLabel: {
            color: getColor('quaternary-color')
          }
        },
        yAxis: {
          type: 'category',
          data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          inverse: true,
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: {
            show: false
          },
          animationDuration: 300,
          animationDurationUpdate: 300,
          max: 4 // only the largest 5 bars will be displayed
        },
        series: [
          {
            realtimeSort: true,
            name: 'X',
            type: 'bar',
            data,
            label: {
              show: true,
              position: 'right',
              color: getColor('tertiary-color'),
              fontWeight: 500,
              valueAnimation: true
            },
            itemStyle: {
              color: getColor('primary'),
              barBorderRadius: [0, 3, 3, 0]
            }
          }
        ],
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
        grid: {
          right: '10%',
          left: 5,
          bottom: 5,
          top: 5,
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      const run = () => {
        data = data.map(item =>
          Math.random() > 0.9
            ? item + Math.round(Math.random() * 2000)
            : item + Math.round(Math.random() * 200)
        );

        chart.setOption({
          series: [
            {
              data
            }
          ]
        });
      };

      setTimeout(() => {
        run();
      }, 0);
      setInterval(() => {
        run();
      }, 3000);
    }
  };

  const barGradientChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-bar-gradient-chart-example');

    const tooltipFormatter = params => {
      return `<div> 
        <h6 class="fs-9 text-body-tertiary mb-0">
        <span class="fas fa-circle me-1 text-primary"></span> ${params[0].name} : ${params[0].value} 
         </h6>
      </div> `;
    };

    const dataAxis = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T'
    ];
    const data = [
      320, 190, 200, 210, 256, 451, 111, 150, 442, 321, 100, 451, 201, 232, 140,
      124, 444, 333, 222, 111
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
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
          },
          formatter: params => tooltipFormatter(params)
        },
        title: {
          text: 'Gradient and Clickable bar chart',
          textStyle: {
            color: getColor('tertiary-color')
          },
          left: 'center'
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            inside: true,
            textStyle: {
              color: '#fff'
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          z: 10
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: getColor('quaternary-color')
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        series: [
          {
            type: 'bar',
            name: 'Total',
            showBackground: true,
            itemStyle: {
              color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: getColor('info') },
                { offset: 0.5, color: getColor('primary') },
                { offset: 1, color: getColor('primary') }
              ]),
              barBorderRadius: [3, 3, 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: getColor('primary') },
                  { offset: 0.7, color: getColor('primary') },
                  { offset: 1, color: getColor('info') }
                ])
              }
            },
            data
          }
        ],
        grid: {
          right: 5,
          left: 5,
          bottom: 5,
          top: '10%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      const zoomSize = 6;
      chart.on('click', params => {
        chart.dispatchAction({
          type: 'dataZoom',
          startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue:
            dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        });
      });
    }
  };

  const barLineMixedChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-bar-line-mixed-chart-example'
    );
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: getColor('quaternary-color')
            },
            label: {
              show: true,
              backgroundColor: getColor('tertiary-color'),
              color: getColor('body-highlight-bg')
            }
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params)
        },
        toolbox: {
          top: 0,
          feature: {
            dataView: { show: false },
            magicType: {
              show: true,
              type: ['line', 'bar']
            },
            restore: { show: true },
            saveAsImage: { show: true }
          },
          iconStyle: {
            borderColor: getColor('tertiary-color'),
            borderWidth: 1
          },

          emphasis: {
            iconStyle: {
              textFill: getColor('tertiary-color')
            }
          }
        },
        legend: {
          top: 40,
          data: ['Evaporation', 'Precipitation', 'Average temperature'],
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        xAxis: [
          {
            type: 'category',
            data: months,
            axisLabel: {
              color: getColor('quaternary-color'),
              formatter: value => value.slice(0, 3)
            },
            axisPointer: {
              type: 'shadow'
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: getColor('tertiary-bg')
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              color: getColor('quaternary-color'),
              formatter: '{value} ml'
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: getColor('secondary-bg')
              }
            }
          },
          {
            type: 'value',
            min: 0,
            max: 25,
            interval: 5,
            axisLabel: {
              color: getColor('quaternary-color'),
              formatter: '{value} °C'
            },

            splitLine: {
              show: true,
              lineStyle: {
                color: getColor('secondary-bg')
              }
            }
          }
        ],
        series: [
          {
            name: 'Evaporation',
            type: 'bar',
            data: [
              2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
            ],
            itemStyle: {
              color: getColor('primary'),
              barBorderRadius: [3, 3, 0, 0]
            }
          },
          {
            name: 'Precipitation',
            type: 'bar',
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ],
            itemStyle: {
              color: getColor('info'),
              barBorderRadius: [3, 3, 0, 0]
            }
          },
          {
            name: 'Average temperature',
            type: 'line',
            yAxisIndex: 1,
            data: [
              2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2
            ],
            lineStyle: {
              color: getColor('warning')
            },
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            symbol: 'circle',
            symbolSize: 10
          }
        ],
        grid: {
          right: 5,
          left: 5,
          bottom: 5,
          top: '23%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const barWaterFallChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-bar-waterfall-chart-example'
    );
    const days = [
      '2021-06-05',
      '2021-06-06',
      '2021-06-07',
      '2021-06-08',
      '2021-06-09',
      '2021-06-10',
      '2021-06-11',
      '2021-06-12',
      '2021-06-13',
      '2021-06-14',
      '2021-06-15'
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          data: ['Expenditure', 'Income'],
          textStyle: {
            color: getColor('quaternary-color')
          }
        },
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          /* eslint-disable prefer-destructuring */
          formatter: params => {
            let tar;
            if (params[1].value !== '-') {
              tar = params[1];
            } else {
              tar = params[2];
            }
            return `${window.dayjs(tar.name).format('MMM DD')}<br/>${
            tar.seriesName
          } : ${tar.value}`;
          },
          transitionDuration: 0,
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => window.dayjs(value).format('MMM DD'),
            margin: 15
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: true,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisTick: { show: false },
          axisLine: { show: false },
          min: 600
        },
        series: [
          {
            name: 'Assist',
            type: 'bar',
            stack: 'Total',
            itemStyle: {
              barBorderColor: 'transparent',
              color: 'transparent'
            },
            emphasis: {
              itemStyle: {
                barBorderColor: 'transparent',
                color: 'transparent'
              }
            },
            data: [0, 900, 1245, 1530, 1376, 1376, 1511, 1689, 1856, 1495, 1292]
          },
          {
            name: 'Income',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'top',
              color: getColor('quaternary-color')
            },
            data: [1000, 400, 350, '-', '-', 320, 180, 190, '-', '-', '-'],
            itemStyle: {
              color: getColor('primary'),
              barBorderRadius: [3, 3, 0, 0]
            }
          },
          {
            name: 'Expenditure',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'bottom',
              color: getColor('quaternary-color')
            },
            data: ['-', '-', '-', 100, 140, '-', '-', '-', 120, 345, 190],
            itemStyle: {
              color: getColor('success'),
              barBorderRadius: [3, 3, 0, 0]
            }
          }
        ],
        grid: { right: '3%', left: '10%', bottom: '10%', top: '10%' }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const barTimelineChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-bar-timeline-chart-example');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const dataMap = {};

    const dataFormatter = obj => {
      return Object.keys(obj).reduce((acc, val) => {
        return {
          ...acc,
          [val]: obj[val].map((value, index) => ({
            name: months[index],
            value
          }))
        };
      }, {});
    };

    dataMap.dataTI = dataFormatter({
      2016: [
        88.68, 112.38, 1400, 262.42, 589.56, 882.41, 625.61, 684.6, 90.26,
        1461.51, 892.83, 966.5
      ],
      2017: [
        88.8, 103.35, 1461.81, 276.77, 634.94, 939.43, 672.76, 750.14, 93.81,
        1545.05, 925.1, 1011.03
      ],
      2018: [
        101.26, 110.19, 1804.72, 311.97, 762.1, 1133.42, 783.8, 915.38, 101.84,
        1816.31, 986.02, 1200.18
      ],
      2019: [
        112.83, 122.58, 2034.59, 313.58, 907.95, 1302.02, 916.72, 1088.94, 111.8,
        2100.11, 1095.96, 1418.09
      ],
      2020: [
        118.29, 128.85, 2207.34, 477.59, 929.6, 1414.9, 980.57, 1154.33, 113.82,
        2261.86, 1163.08, 1495.45
      ],
      2021: [
        124.36, 145.58, 2562.81, 554.48, 1095.28, 1631.08, 1050.15, 1302.9,
        114.15, 2540.1, 1360.56, 1729.02
      ],
      2022: [
        136.27, 159.72, 2905.73, 641.42, 1306.3, 1915.57, 1277.44, 1701.5, 124.94,
        3064.78, 1583.04, 2015.31
      ]
    });

    dataMap.dataSI = dataFormatter({
      2016: [
        2026.51, 2135.07, 5271.57, 2357.04, 1773.21, 3869.4, 1580.83, 2971.68,
        4381.2, 10524.96, 7164.75, 2245.9
      ],
      2017: [
        2191.43, 2457.08, 6110.43, 2755.66, 2374.96, 4566.83, 1915.29, 3365.31,
        4969.95, 12282.89, 8511.51, 2711.18
      ],
      2018: [
        2509.4, 2892.53, 7201.88, 3454.49, 3193.67, 5544.14, 2475.45, 3695.58,
        5571.06, 14471.26, 10154.25, 3370.96
      ],
      2019: [
        2626.41, 3709.78, 8701.34, 4242.36, 4376.19, 7158.84, 3097.12, 4319.75,
        6085.84, 16993.34, 11567.42, 4198.93
      ],
      2020: [
        2855.55, 3987.84, 8959.83, 3993.8, 5114, 7906.34, 3541.92, 4060.72,
        6001.78, 18566.37, 11908.49, 4905.22
      ],
      2021: [
        3388.38, 4840.23, 10707.68, 5234, 6367.69, 9976.82, 4506.31, 5025.15,
        7218.32, 21753.93, 14297.93, 6436.62
      ],
      2022: [
        3752.48, 5928.32, 13126.86, 6635.26, 8037.69, 12152.15, 5611.48, 5962.41,
        7927.89, 25203.28, 16555.58, 8309.38
      ]
    });

    dataMap.dataPI = dataFormatter({
      2016: [
        4854.33, 1658.19, 3340.54, 1611.07, 1542.26, 3295.45, 1413.83, 1857.42,
        4776.2, 6612.22, 5360.1, 2137.77
      ],
      2017: [
        5837.55, 1902.31, 3895.36, 1846.18, 1934.35, 3798.26, 1687.07, 2096.35,
        5508.48, 7914.11, 6281.86, 2390.29
      ],
      2018: [
        7236.15, 2250.04, 4600.72, 2257.99, 2467.41, 4486.74, 2025.44, 2493.04,
        6821.11, 9730.91, 7613.46, 2789.78
      ],
      2019: [
        8375.76, 2886.65, 5276.04, 2759.46, 3212.06, 5207.72, 2412.26, 2905.68,
        7872.23, 11888.53, 8799.31, 3234.64
      ],
      2020: [
        9179.19, 3405.16, 6068.31, 2886.92, 3696.65, 5891.25, 2756.26, 3371.95,
        8930.85, 13629.07, 9918.78, 3662.15
      ],
      2021: [
        10600.84, 4238.65, 7123.77, 3412.38, 4209.03, 6849.37, 3111.12, 4040.55,
        9833.51, 17131.45, 12063.82, 4193.69
      ],
      2022: [
        12363.18, 5219.24, 8483.17, 3960.87, 5015.89, 8158.98, 3679.91, 4918.09,
        11142.86, 20842.21, 14180.23, 4975.96
      ]
    });

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        baseOption: {
          timeline: {
            axisType: 'category',
            autoPlay: false,
            playInterval: 1000,
            data: [
              '2016-01-01',
              '2017-01-01',
              '2018-01-01',
              '2019-01-01',
              '2020-01-01',
              '2021-01-01',
              '2022-01-01'
            ],
            label: {
              formatter: s => {
                return new Date(s).getFullYear();
              }
            },
            lineStyle: {
              color: getColor('info')
            },
            itemStyle: {
              color: getColor('secondary')
            },
            checkpointStyle: {
              color: getColor('primary'),
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0
            },
            controlStyle: {
              color: getColor('info')
            }
          },
          title: {
            textStyle: {
              color: getColor('tertiary-color')
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            padding: [7, 10],
            backgroundColor: getColor('body-highlight-bg'),
            borderColor: getColor('border-color'),
            textStyle: { color: getColor('light-text-emphasis') },
            borderWidth: 1,
            transitionDuration: 0,
            formatter: tooltipFormatter
          },
          legend: {
            left: 'right',
            data: ['Primary industry', 'Secondary industry', 'Tertiary Industry'],
            textStyle: {
              color: getColor('tertiary-color')
            }
          },
          calculable: true,
          xAxis: [
            {
              type: 'category',
              data: months,
              splitLine: { show: false },
              axisLabel: {
                color: getColor('quaternary-color')
              },
              axisLine: {
                lineStyle: {
                  color: getColor('quaternary-color')
                }
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                formatter: value => `${value / 1000}k`,
                color: getColor('quaternary-color')
              },
              splitLine: {
                lineStyle: {
                  color: getColor('secondary-bg')
                }
              }
            }
          ],
          series: [
            {
              name: 'Primary industry',
              type: 'bar',
              itemStyle: {
                color: getColor('primary'),
                barBorderRadius: [3, 3, 0, 0]
              }
            },
            {
              name: 'Secondary industry',
              type: 'bar',
              itemStyle: {
                color: getColor('info'),
                barBorderRadius: [3, 3, 0, 0]
              }
            },
            {
              name: 'Tertiary Industry',
              type: 'bar',
              itemStyle: {
                color: getColor('warning'),
                barBorderRadius: [3, 3, 0, 0]
              }
            }
          ],
          grid: {
            top: '10%',
            bottom: '15%',
            left: 5,
            right: 10,
            containLabel: true
          }
        },
        options: [
          {
            title: { text: '2016' },
            series: [
              { data: dataMap.dataPI['2016'] },
              { data: dataMap.dataSI['2016'] },
              { data: dataMap.dataTI['2016'] }
            ]
          },
          {
            title: { text: '2017' },
            series: [
              { data: dataMap.dataPI['2017'] },
              { data: dataMap.dataSI['2017'] },
              { data: dataMap.dataTI['2017'] }
            ]
          },
          {
            title: { text: '2018' },
            series: [
              { data: dataMap.dataPI['2018'] },
              { data: dataMap.dataSI['2018'] },
              { data: dataMap.dataTI['2018'] }
            ]
          },
          {
            title: { text: '2019' },
            series: [
              { data: dataMap.dataPI['2019'] },
              { data: dataMap.dataSI['2019'] },
              { data: dataMap.dataTI['2019'] }
            ]
          },
          {
            title: { text: '2020' },
            series: [
              { data: dataMap.dataPI['2020'] },
              { data: dataMap.dataSI['2020'] },
              { data: dataMap.dataTI['2020'] }
            ]
          },
          {
            title: { text: '2021' },
            series: [
              { data: dataMap.dataPI['2021'] },
              { data: dataMap.dataSI['2021'] },
              { data: dataMap.dataTI['2021'] }
            ]
          },
          {
            title: { text: '2022' },
            series: [
              { data: dataMap.dataPI['2022'] },
              { data: dataMap.dataSI['2022'] },
              { data: dataMap.dataTI['2022'] }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const basicCandlestickChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-basic-candlestick-chart-example'
    );

    const data = [
      ['2013/1/24', 2320.26, 2320.26, 2287.3, 2362.94],
      ['2013/1/25', 2300, 2291.3, 2288.26, 2308.38],
      ['2013/1/28', 2295.35, 2346.5, 2295.35, 2346.92],
      ['2013/1/29', 2347.22, 2358.98, 2337.35, 2363.8],
      ['2013/1/30', 2360.75, 2382.48, 2347.89, 2383.76],
      ['2013/1/31', 2383.43, 2385.42, 2371.23, 2391.82],
      ['2013/2/1', 2377.41, 2419.02, 2369.57, 2421.15],
      ['2013/2/4', 2425.92, 2428.15, 2417.58, 2440.38],
      ['2013/2/5', 2411, 2433.13, 2403.3, 2437.42],
      ['2013/2/6', 2432.68, 2434.48, 2427.7, 2441.73],
      ['2013/2/7', 2430.69, 2418.53, 2394.22, 2433.89],
      ['2013/2/8', 2416.62, 2432.4, 2414.4, 2443.03],
      ['2013/2/18', 2441.91, 2421.56, 2415.43, 2444.8],
      ['2013/2/19', 2420.26, 2382.91, 2373.53, 2427.07],
      ['2013/2/20', 2383.49, 2397.18, 2370.61, 2397.94],
      ['2013/2/21', 2378.82, 2325.95, 2309.17, 2378.82],
      ['2013/2/22', 2322.94, 2314.16, 2308.76, 2330.88],
      ['2013/2/25', 2320.62, 2325.82, 2315.01, 2338.78],
      ['2013/2/26', 2313.74, 2293.34, 2289.89, 2340.71],
      ['2013/2/27', 2297.77, 2313.22, 2292.03, 2324.63],
      ['2013/2/28', 2322.32, 2365.59, 2308.92, 2366.16],
      ['2013/3/1', 2364.54, 2359.51, 2330.86, 2369.65],
      ['2013/3/4', 2332.08, 2273.4, 2259.25, 2333.54],
      ['2013/3/5', 2274.81, 2326.31, 2270.1, 2328.14],
      ['2013/3/6', 2333.61, 2347.18, 2321.6, 2351.44],
      ['2013/3/7', 2340.44, 2324.29, 2304.27, 2352.02],
      ['2013/3/8', 2326.42, 2318.61, 2314.59, 2333.67],
      ['2013/3/11', 2314.68, 2310.59, 2296.58, 2320.96],
      ['2013/3/12', 2309.16, 2286.6, 2264.83, 2333.29],
      ['2013/3/13', 2282.17, 2263.97, 2253.25, 2286.33],
      ['2013/3/14', 2255.77, 2270.28, 2253.31, 2276.22],
      ['2013/3/15', 2269.31, 2278.4, 2250, 2312.08],
      ['2013/3/18', 2267.29, 2240.02, 2239.21, 2276.05],
      ['2013/3/19', 2244.26, 2257.43, 2232.02, 2261.31],
      ['2013/3/20', 2257.74, 2317.37, 2257.42, 2317.86],
      ['2013/3/21', 2318.21, 2324.24, 2311.6, 2330.81],
      ['2013/3/22', 2321.4, 2328.28, 2314.97, 2332],
      ['2013/3/25', 2334.74, 2326.72, 2319.91, 2344.89],
      ['2013/3/26', 2318.58, 2297.67, 2281.12, 2319.99],
      ['2013/3/27', 2299.38, 2301.26, 2289, 2323.48],
      ['2013/3/28', 2273.55, 2236.3, 2232.91, 2273.55],
      ['2013/3/29', 2238.49, 2236.62, 2228.81, 2246.87],
      ['2013/4/1', 2229.46, 2234.4, 2227.31, 2243.95],
      ['2013/4/2', 2234.9, 2227.74, 2220.44, 2253.42],
      ['2013/4/3', 2232.69, 2225.29, 2217.25, 2241.34],
      ['2013/4/8', 2196.24, 2211.59, 2180.67, 2212.59],
      ['2013/4/9', 2215.47, 2225.77, 2215.47, 2234.73],
      ['2013/4/10', 2224.93, 2226.13, 2212.56, 2233.04],
      ['2013/4/11', 2236.98, 2219.55, 2217.26, 2242.48],
      ['2013/4/12', 2218.09, 2206.78, 2204.44, 2226.26]
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
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
          },
          position: (...params) => handleTooltipPosition(params)
        },
        toolbox: {
          top: 0,
          feature: {
            dataZoom: {
              yAxisIndex: false
            },
            restore: { show: true }
          },
          iconStyle: {
            borderColor: getColor('tertiary-color'),
            borderWidth: 1
          },

          emphasis: {
            iconStyle: {
              textFill: getColor('tertiary-color')
            }
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
            minValueSpan: 10
          }
        ],
        xAxis: {
          type: 'category',
          data: data.map(item => item[0]),
          scale: true,
          splitLine: { show: false },
          splitNumber: 10,
          min: 'dataMin',
          max: 'dataMax',
          boundaryGap: true,
          axisPointer: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg'),
              type: 'solid'
            }
          },
          axisTick: { show: false },
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value =>
              window.dayjs(value, 'YYYY-MM-DD').format('MMM DD'),
            margin: 15,
            fontWeight: 500
          }
        },
        yAxis: {
          scale: true,
          axisPointer: { show: false },
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg'),
              type: 'dashed'
            }
          },
          boundaryGap: false,
          axisLabel: {
            show: true,
            color: getColor('quaternary-color'),
            margin: 15,
            fontWeight: 500
          },
          axisTick: { show: false },
          axisLine: { show: false }
        },
        series: [
          {
            type: 'candlestick',
            name: 'Volume',
            data: data.map(item => item.slice(1)),
            itemStyle: {
              color: getColor('warning'),
              color0: getColor('primary'),
              borderColor: getColor('warning'),
              borderColor0: getColor('primary')
            }
          }
        ],
        grid: {
          right: 5,
          left: 5,
          bottom: 5,
          top: '15%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const candlestickMixedChartInit = () => {
    const { getColor, getData, getPastDates } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-candlestick-mixed-chart-example'
    );
    const colorList = [
      getColor('primary'),
      getColor('info'),
      getColor('light-text-emphasis'),
      getColor('warning')
    ];

    /* eslint-disable no-continue */
    const calculateMA = (dayCount, data) => {
      const result = [];
      for (let i = 0, len = data.length; i < len; i += 1) {
        if (i < dayCount) {
          result.push('-');
          continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j += 1) {
          sum += data[i - j][1];
        }
        result.push((sum / dayCount).toFixed(2));
      }
      return result;
    };

    const dates = getPastDates(61).map(date =>
      window.dayjs(date).format('MMM DD, YYYY')
    );

    const data = [
      [17512.58, 17633.11, 17434.27, 17642.81, 86160000],
      [17652.36, 17716.66, 17652.36, 17790.11, 79330000],
      [17716.05, 17685.09, 17669.72, 17755.7, 102600000],
      [17661.74, 17792.75, 17568.02, 17811.48, 104890000],
      [17799.39, 17737, 17710.67, 17806.38, 85230000],
      [17718.03, 17603.32, 17579.56, 17718.03, 115230000],
      [17605.45, 17716.05, 17542.54, 17723.55, 99410000],
      [17687.28, 17541.96, 17484.23, 17687.28, 90120000],
      [17555.39, 17576.96, 17528.16, 17694.51, 79990000],
      [17586.48, 17556.41, 17555.9, 17731.63, 107100000],
      [17571.34, 17721.25, 17553.57, 17744.43, 81020000],
      [17741.66, 17908.28, 17741.66, 17918.35, 91710000],
      [17912.25, 17926.43, 17885.44, 17962.14, 84510000],
      [17925.95, 17897.46, 17867.41, 17937.65, 118160000],
      [17890.2, 18004.16, 17848.22, 18009.53, 89390000],
      [18012.1, 18053.6, 17984.43, 18103.46, 89820000],
      [18059.49, 18096.27, 18031.21, 18167.63, 100210000],
      [18092.84, 17982.52, 17963.89, 18107.29, 102720000],
      [17985.05, 18003.75, 17909.89, 18026.85, 134120000],
      [17990.94, 17977.24, 17855.55, 17990.94, 83770000],
      [17987.38, 17990.32, 17934.17, 18043.77, 92570000],
      [17996.14, 18041.55, 17920.26, 18084.66, 109090000],
      [18023.88, 17830.76, 17796.55, 18035.73, 100920000],
      [17813.09, 17773.64, 17651.98, 17814.83, 136670000],
      [17783.78, 17891.16, 17773.71, 17912.35, 80100000],
      [17870.75, 17750.91, 17670.88, 17870.75, 97060000],
      [17735.02, 17651.26, 17609.01, 17738.06, 95020000],
      [17664.48, 17660.71, 17615.82, 17736.11, 81530000],
      [17650.3, 17740.63, 17580.38, 17744.54, 80020000],
      [17743.85, 17705.91, 17668.38, 17783.16, 85590000],
      [17726.66, 17928.35, 17726.66, 17934.61, 75790000],
      [17919.03, 17711.12, 17711.05, 17919.03, 87390000],
      [17711.12, 17720.5, 17625.38, 17798.19, 88560000],
      [17711.12, 17535.32, 17512.48, 17734.74, 86640000],
      [17531.76, 17710.71, 17531.76, 17755.8, 88440000],
      [17701.46, 17529.98, 17469.92, 17701.46, 103260000],
      [17501.28, 17526.62, 17418.21, 17636.22, 79120000],
      [17514.16, 17435.4, 17331.07, 17514.16, 95530000],
      [17437.32, 17500.94, 17437.32, 17571.75, 111990000],
      [17507.04, 17492.93, 17480.05, 17550.7, 87790000],
      [17525.19, 17706.05, 17525.19, 17742.59, 86480000],
      [17735.09, 17851.51, 17735.09, 17891.71, 79180000],
      [17859.52, 17828.29, 17803.82, 17888.66, 68940000],
      [17826.85, 17873.22, 17824.73, 17873.22, 73190000],
      [17891.5, 17787.2, 17724.03, 17899.24, 147390000],
      [17754.55, 17789.67, 17664.79, 17809.18, 78530000],
      [17789.05, 17838.56, 17703.55, 17838.56, 75560000],
      [17799.8, 17807.06, 17689.68, 17833.17, 82270000],
      [17825.69, 17920.33, 17822.81, 17949.68, 71870000],
      [17936.22, 17938.28, 17936.22, 18003.23, 78750000],
      [17931.91, 18005.05, 17931.91, 18016, 71260000],
      [17969.98, 17985.19, 17915.88, 18005.22, 69690000],
      [17938.82, 17865.34, 17812.34, 17938.82, 90540000],
      [17830.5, 17732.48, 17731.35, 17893.28, 101690000],
      [17710.77, 17674.82, 17595.79, 17733.92, 93740000],
      [17703.65, 17640.17, 17629.01, 17762.96, 94130000],
      [17602.23, 17733.1, 17471.29, 17754.91, 91950000],
      [17733.44, 17675.16, 17602.78, 17733.44, 248680000],
      [17736.87, 17804.87, 17736.87, 17946.36, 99380000],
      [17827.33, 17829.73, 17799.8, 17877.84, 85130000],
      [17832.67, 17780.83, 17770.36, 17920.16, 89440000]
    ];

    const dataMA5 = calculateMA(5, data);

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        animation: false,
        color: colorList,
        legend: {
          top: 0,
          data: ['MA1', 'MA5', 'Volume'],
          textStyle: {
            color: getColor('quaternary-color')
          }
        },
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: (...params) => handleTooltipPosition(params)
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: [0, 1]
            }
          ]
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: [0, 1],
            realtime: false,
            start: 20,
            end: 70,
            top: 35,
            height: 15,
            handleIcon:
              'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '120%'
          },
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 40,
            end: 70,
            top: 30,
            height: 20
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
              lineStyle: { color: getColor('tertiary-bg') }
            },
            axisLabel: {
              color: getColor('quaternary-color'),
              formatter: value => window.dayjs(value).format('MMM DD')
            },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              show: true
            }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,
            boundaryGap: false,
            splitLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { lineStyle: { color: 'blue' } },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              type: 'shadow',
              label: { show: false },
              triggerTooltip: true
            }
          }
        ],
        yAxis: [
          {
            scale: true,
            splitNumber: 2,
            axisLine: { show: false },
            splitLine: {
              lineStyle: {
                color: getColor('secondary-bg')
              }
            },
            axisTick: { show: false },
            axisLabel: {
              color: getColor('quaternary-color')
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        grid: [
          {
            left: 5,
            right: 12,
            // top: 110,
            bottom: 60,
            height: 160,
            containLabel: true
          },
          {
            left: 50,
            right: 12,
            height: 40,
            top: 260,
            containLabel: true
          }
        ],
        series: [
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              color: getColor('primary')
            },
            emphasis: {
              itemStyle: {
                color: getColor('primary')
              }
            },
            data: data.map(item => item[4])
          },
          {
            type: 'candlestick',
            name: 'MA1',
            data,
            itemStyle: {
              color: getColor('success'),
              color0: getColor('info'),
              borderColor: getColor('success'),
              borderColor0: getColor('info')
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: dataMA5,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
              color: getColor('primary')
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const sessionByCountryMapInit = () => {
    const { getColor, rgbaColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-session-by-country-map');
    const data = [
      { name: 'Afghanistan', value: 28397.812 },
      { name: 'Angola', value: 19549.124 },
      { name: 'Albania', value: 3150.143 },
      { name: 'United Arab Emirates', value: 8441.537 },
      { name: 'Argentina', value: 40374.224 },
      { name: 'Armenia', value: 2963.496 },
      { name: 'French Southern and Antarctic Lands', value: 268.065 },
      { name: 'Australia', value: 22404.488 },
      { name: 'Austria', value: 8401.924 },
      { name: 'Azerbaijan', value: 9094.718 },
      { name: 'Burundi', value: 9232.753 },
      { name: 'Belgium', value: 10941.288 },
      { name: 'Benin', value: 9509.798 },
      { name: 'Burkina Faso', value: 15540.284 },
      { name: 'Bangladesh', value: 151125.475 },
      { name: 'Bulgaria', value: 7389.175 },
      { name: 'The Bahamas', value: 66402.316 },
      { name: 'Bosnia and Herzegovina', value: 3845.929 },
      { name: 'Belarus', value: 9491.07 },
      { name: 'Belize', value: 308.595 },
      { name: 'Bermuda', value: 64.951 },
      { name: 'Bolivia', value: 716.939 },
      { name: 'Brazil', value: 195210.154 },
      { name: 'Brunei', value: 27.223 },
      { name: 'Bhutan', value: 716.939 },
      { name: 'Botswana', value: 1969.341 },
      { name: 'Central African Rep.', value: 4349.921 },
      { name: 'Canada', value: 34126.24 },
      { name: 'Switzerland', value: 7830.534 },
      { name: 'Chile', value: 17150.76 },
      { name: 'China', value: 1359821.465 },
      { name: "Côte d'Ivoire", value: 60508.978 },
      { name: 'Cameroon', value: 20624.343 },
      { name: 'Dem. Rep. Congo', value: 62191.161 },
      { name: 'Congo', value: 3573.024 },
      { name: 'Colombia', value: 46444.798 },
      { name: 'Costa Rica', value: 4669.685 },
      { name: 'Cuba', value: 11281.768 },
      { name: 'Northern Cyprus', value: 1.468 },
      { name: 'Cyprus', value: 1103.685 },
      { name: 'Czech Republic', value: 10553.701 },
      { name: 'Germany', value: 83017.404 },
      { name: 'Djibouti', value: 834.036 },
      { name: 'Denmark', value: 5550.959 },
      { name: 'Dominican Republic', value: 10016.797 },
      { name: 'Algeria', value: 37062.82 },
      { name: 'Ecuador', value: 15001.072 },
      { name: 'Egypt', value: 78075.705 },
      { name: 'Eritrea', value: 5741.159 },
      { name: 'Spain', value: 46182.038 },
      { name: 'Estonia', value: 1298.533 },
      { name: 'Ethiopia', value: 87095.281 },
      { name: 'Finland', value: 5367.693 },
      { name: 'Fiji', value: 860.559 },
      { name: 'Falkland Islands', value: 49.581 },
      { name: 'France', value: 63230.866 },
      { name: 'Gabon', value: 1556.222 },
      { name: 'United Kingdom', value: 62066.35 },
      { name: 'Georgia', value: 4388.674 },
      { name: 'Ghana', value: 24262.901 },
      { name: 'Eq. Guinea', value: 10876.033 },
      { name: 'Guinea', value: 10876.033 },
      { name: 'Gambia', value: 1680.64 },
      { name: 'Guinea Bissau', value: 10876.033 },
      { name: 'Equatorial Guinea', value: 696.167 },
      { name: 'Greece', value: 11109.999 },
      { name: 'Greenland', value: 56.546 },
      { name: 'Guatemala', value: 14341.576 },
      { name: 'French Guiana', value: 231.169 },
      { name: 'Guyana', value: 786.126 },
      { name: 'Honduras', value: 7621.204 },
      { name: 'Croatia', value: 4338.027 },
      { name: 'Haiti', value: 9896.4 },
      { name: 'Hungary', value: 10014.633 },
      { name: 'Indonesia', value: 240676.485 },
      { name: 'India', value: 1205624.648 },
      { name: 'Ireland', value: 4467.561 },
      { name: 'Iran', value: 240676.485 },
      { name: 'Iraq', value: 30962.38 },
      { name: 'Iceland', value: 318.042 },
      { name: 'Israel', value: 7420.368 },
      { name: 'Italy', value: 60508.978 },
      { name: 'Jamaica', value: 2741.485 },
      { name: 'Jordan', value: 6454.554 },
      { name: 'Japan', value: 127352.833 },
      { name: 'Kazakhstan', value: 15921.127 },
      { name: 'Kenya', value: 40909.194 },
      { name: 'Kyrgyzstan', value: 5334.223 },
      { name: 'Cambodia', value: 14364.931 },
      { name: 'South Korea', value: 51452.352 },
      { name: 'Kosovo', value: 97.743 },
      { name: 'Kuwait', value: 2991.58 },
      { name: 'Laos', value: 6395.713 },
      { name: 'Lebanon', value: 4341.092 },
      { name: 'Liberia', value: 3957.99 },
      { name: 'Libya', value: 6040.612 },
      { name: 'Sri Lanka', value: 20758.779 },
      { name: 'Lesotho', value: 2008.921 },
      { name: 'Lithuania', value: 3068.457 },
      { name: 'Luxembourg', value: 507.885 },
      { name: 'Latvia', value: 2090.519 },
      { name: 'Morocco', value: 31642.36 },
      { name: 'Moldova', value: 103.619 },
      { name: 'Madagascar', value: 21079.532 },
      { name: 'Mexico', value: 117886.404 },
      { name: 'Macedonia', value: 507.885 },
      { name: 'Mali', value: 13985.961 },
      { name: 'Myanmar', value: 51931.231 },
      { name: 'Montenegro', value: 620.078 },
      { name: 'Mongolia', value: 2712.738 },
      { name: 'Mozambique', value: 23967.265 },
      { name: 'Mauritania', value: 3609.42 },
      { name: 'Malawi', value: 15013.694 },
      { name: 'Malaysia', value: 28275.835 },
      { name: 'Namibia', value: 2178.967 },
      { name: 'New Caledonia', value: 246.379 },
      { name: 'Niger', value: 15893.746 },
      { name: 'Nigeria', value: 159707.78 },
      { name: 'Nicaragua', value: 5822.209 },
      { name: 'Netherlands', value: 16615.243 },
      { name: 'Norway', value: 4891.251 },
      { name: 'Nepal', value: 26846.016 },
      { name: 'New Zealand', value: 4368.136 },
      { name: 'Oman', value: 2802.768 },
      { name: 'Pakistan', value: 173149.306 },
      { name: 'Panama', value: 3678.128 },
      { name: 'Peru', value: 29262.83 },
      { name: 'Philippines', value: 93444.322 },
      { name: 'Papua New Guinea', value: 6858.945 },
      { name: 'Poland', value: 38198.754 },
      { name: 'Puerto Rico', value: 3709.671 },
      { name: 'North Korea', value: 1.468 },
      { name: 'Portugal', value: 10589.792 },
      { name: 'Paraguay', value: 6459.721 },
      { name: 'Qatar', value: 1749.713 },
      { name: 'Romania', value: 21861.476 },
      { name: 'Russia', value: 21861.476 },
      { name: 'Rwanda', value: 10836.732 },
      { name: 'Western Sahara', value: 514.648 },
      { name: 'Saudi Arabia', value: 27258.387 },
      { name: 'Sudan', value: 35652.002 },
      { name: 'S. Sudan', value: 9940.929 },
      { name: 'Senegal', value: 12950.564 },
      { name: 'Solomon Islands', value: 526.447 },
      { name: 'Sierra Leone', value: 5751.976 },
      { name: 'El Salvador', value: 6218.195 },
      { name: 'Somaliland', value: 9636.173 },
      { name: 'Somalia', value: 9636.173 },
      { name: 'Republic of Serbia', value: 3573.024 },
      { name: 'Suriname', value: 524.96 },
      { name: 'Slovakia', value: 5433.437 },
      { name: 'Slovenia', value: 2054.232 },
      { name: 'Sweden', value: 9382.297 },
      { name: 'Swaziland', value: 1193.148 },
      { name: 'Syria', value: 7830.534 },
      { name: 'Chad', value: 11720.781 },
      { name: 'Togo', value: 6306.014 },
      { name: 'Thailand', value: 66402.316 },
      { name: 'Tajikistan', value: 7627.326 },
      { name: 'Turkmenistan', value: 5041.995 },
      { name: 'East Timor', value: 10016.797 },
      { name: 'Trinidad and Tobago', value: 1328.095 },
      { name: 'Tunisia', value: 10631.83 },
      { name: 'Turkey', value: 72137.546 },
      { name: 'Tanzania', value: 44973.33 },
      { name: 'Uganda', value: 33987.213 },
      { name: 'Ukraine', value: 46050.22 },
      { name: 'Uruguay', value: 3371.982 },
      { name: 'United States', value: 312247.116 },
      { name: 'Uzbekistan', value: 27769.27 },
      { name: 'Venezuela', value: 236.299 },
      { name: 'Vietnam', value: 89047.397 },
      { name: 'Vanuatu', value: 236.299 },
      { name: 'West Bank', value: 13.565 },
      { name: 'Yemen', value: 22763.008 },
      { name: 'South Africa', value: 51452.352 },
      { name: 'Zambia', value: 13216.985 },
      { name: 'Zimbabwe', value: 13076.978 }
    ];

    const total = 6961500;

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params =>
            `<strong>${params.data?.name} :</strong> ${(
            (params.data?.value / total) *
            100
          ).toFixed(2)}%`
        },
        toolbox: {
          show: false,
          feature: {
            restore: {}
          }
        },
        visualMap: {
          show: false,
          min: 800,
          max: 50000,
          inRange: {
            color: [
              getColor('primary'),
              rgbaColor(getColor('primary'), 0.8),
              rgbaColor(getColor('primary'), 0.6),
              rgbaColor(getColor('primary'), 0.4),
              rgbaColor(getColor('primary'), 0.2)
            ].reverse()
          }
        },
        series: [
          {
            type: 'map',
            map: 'world',
            data,
            roam: true,
            scaleLimit: {
              min: 1,
              max: 5
            },
            left: 0,
            right: 0,
            label: {
              show: false
            },
            itemStyle: {
              borderColor: getColor('border-color')
            },
            emphasis: {
              label: {
                show: false
              },
              itemStyle: {
                areaColor: getColor('warning')
              }
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      document
        .querySelector('.session-by-country-map-reset')
        ?.addEventListener('click', () => {
          chart.dispatchAction({
            type: 'restore'
          });
        });
    }
  };

  const mapUSAInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-map-usa-example');

    const data = [
      { name: 'Alabama', value: 4822023 },
      { name: 'Alaska', value: 731449 },
      { name: 'Arizona', value: 6553255 },
      { name: 'Arkansas', value: 2949131 },
      { name: 'California', value: 38041430 },
      { name: 'Colorado', value: 5187582 },
      { name: 'Connecticut', value: 3590347 },
      { name: 'Delaware', value: 917092 },
      { name: 'District of Columbia', value: 632323 },
      { name: 'Florida', value: 19317568 },
      { name: 'Georgia', value: 9919945 },
      { name: 'Hawaii', value: 1392313 },
      { name: 'Idaho', value: 1595728 },
      { name: 'Illinois', value: 12875255 },
      { name: 'Indiana', value: 6537334 },
      { name: 'Iowa', value: 3074186 },
      { name: 'Kansas', value: 2885905 },
      { name: 'Kentucky', value: 4380415 },
      { name: 'Louisiana', value: 4601893 },
      { name: 'Maine', value: 1329192 },
      { name: 'Maryland', value: 5884563 },
      { name: 'Massachusetts', value: 6646144 },
      { name: 'Michigan', value: 9883360 },
      { name: 'Minnesota', value: 5379139 },
      { name: 'Mississippi', value: 2984926 },
      { name: 'Missouri', value: 6021988 },
      { name: 'Montana', value: 1005141 },
      { name: 'Nebraska', value: 1855525 },
      { name: 'Nevada', value: 2758931 },
      { name: 'New Hampshire', value: 1320718 },
      { name: 'New Jersey', value: 8864590 },
      { name: 'New Mexico', value: 2085538 },
      { name: 'New York', value: 19570261 },
      { name: 'North Carolina', value: 9752073 },
      { name: 'North Dakota', value: 699628 },
      { name: 'Ohio', value: 11544225 },
      { name: 'Oklahoma', value: 3814820 },
      { name: 'Oregon', value: 3899353 },
      { name: 'Pennsylvania', value: 12763536 },
      { name: 'Rhode Island', value: 1050292 },
      { name: 'South Carolina', value: 4723723 },
      { name: 'South Dakota', value: 833354 },
      { name: 'Tennessee', value: 6456243 },
      { name: 'Texas', value: 26059203 },
      { name: 'Utah', value: 2855287 },
      { name: 'Vermont', value: 626011 },
      { name: 'Virginia', value: 8185867 },
      { name: 'Washington', value: 6897012 },
      { name: 'West Virginia', value: 1855413 },
      { name: 'Wisconsin', value: 5726398 },
      { name: 'Wyoming', value: 576412 },
      { name: 'Puerto Rico', value: 3667084 }
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: (...params) => handleTooltipPosition(params),
          formatter: params => {
            return `<strong>${params.data.name} :</strong> ${params.data.value}`;
          }
        },
        toolbox: {
          show: false,
          feature: {
            restore: {}
          }
        },
        visualMap: {
          left: 'right',
          min: 500000,
          max: 38000000,
          inRange: {
            color: [getColor('primary'), getColor('info')]
          },
          text: ['High', 'Low'],
          calculable: true,
          textStyle: {
            color: getColor('quaternary-color')
          },
          formatter: value => `${value / 1000}k`
        },
        series: [
          {
            left: 10,
            name: 'USA PopEstimates',
            type: 'map',
            zoom: 1.2,
            roam: true,
            scaleLimit: {
              min: 1,
              max: 5
            },
            itemStyle: {
              borderColor: getColor('border-color')
            },
            label: {
              color: '#fff'
            },
            map: 'USA',
            emphasis: {
              label: {
                show: true,
                color: '#fff'
              },

              itemStyle: {
                areaColor: getColor('warning')
              }
            },
            data
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
      document.querySelector('.usa-map-reset').addEventListener('click', () => {
        chart.dispatchAction({
          type: 'restore'
        });
      });
    }
  };

  const basicScatterChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-basic-scatter-chart-example'
    );

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'none'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0
        },
        xAxis: {
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          }
        },
        yAxis: {
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },

          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          }
        },
        series: [
          {
            // symbolSize: val => val[2] * 2,
            data: [
              [10.0, 8.04],
              [8.07, 6.95],
              [13.0, 7.58],
              [9.05, 8.81],
              [11.0, 8.33],
              [14.0, 7.66],
              [13.4, 6.81],
              [10.0, 6.33],
              [14.0, 8.96],
              [12.5, 6.82],
              [9.15, 7.2],
              [11.5, 7.2],
              [3.03, 4.23],
              [12.2, 7.83],
              [2.02, 4.47],
              [1.05, 3.33],
              [4.05, 4.96],
              [6.03, 7.24],
              [12.0, 6.26],
              [12.0, 8.84],
              [7.08, 5.82],
              [5.02, 5.68]
            ],
            type: 'scatter',
            itemStyle: {
              color: getColor('danger')
            }
          }
        ],
        grid: {
          right: 8,
          left: 5,
          bottom: 5,
          top: 8,
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const bubbleChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-bubble-chart-example');

    const data = [
      [
        [28604, 77, 17096869, 'Australia', 1990],
        [31163, 77.4, 27662440, 'Canada', 1990],
        [1516, 68, 1154605773, 'China', 1990],
        [28599, 75, 4986705, 'Finland', 1990],
        [29476, 77.1, 56943299, 'France', 1990],
        [31476, 75.4, 78958237, 'Germany', 1990],
        [1777, 57.7, 870601776, 'India', 1990],
        [29550, 79.1, 122249285, 'Japan', 1990],
        [12087, 72, 42972254, 'South Korea', 1990],
        [24021, 75.4, 3397534, 'New Zealand', 1990],
        [43296, 76.8, 4240375, 'Norway', 1990],
        [10088, 70.8, 38195258, 'Poland', 1990],
        [19349, 69.6, 147568552, 'Russia', 1990],
        [26424, 75.7, 57110117, 'United Kingdom', 1990],
        [37062, 75.4, 252847810, 'United States', 1990]
      ],
      [
        [44056, 81.8, 23968973, 'Australia', 2015],
        [43294, 81.7, 35939927, 'Canada', 2015],
        [13334, 76.9, 1376048943, 'China', 2015],
        [38923, 80.8, 5503457, 'Finland', 2015],
        [37599, 81.9, 64395345, 'France', 2015],
        [44053, 81.1, 80688545, 'Germany', 2015],
        [5903, 66.8, 1311050527, 'India', 2015],
        [36162, 83.5, 126573481, 'Japan', 2015],
        [34644, 80.7, 50293439, 'South Korea', 2015],
        [34186, 80.6, 4528526, 'New Zealand', 2015],
        [64304, 81.6, 5210967, 'Norway', 2015],
        [24787, 77.3, 38611794, 'Poland', 2015],
        [23038, 73.13, 143456918, 'Russia', 2015],
        [38225, 81.4, 64715810, 'United Kingdom', 2015],
        [53354, 79.1, 321773631, 'United States', 2015]
      ]
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        title: {
          text: '1990 and 2015 have per capita and GDP',
          left: 0,
          top: 0,
          textStyle: {
            color: getColor('tertiary-color'),
            fontWeight: 600
          }
        },
        legend: {
          right: 0,
          top: '10%',
          data: ['1990', '2015'],
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        xAxis: {
          axisLabel: {
            color: getColor('quaternary-color'),
            formatter: value => `${value / 1000}k`
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },

          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          }
        },
        yAxis: {
          scale: true,
          axisLabel: {
            color: getColor('quaternary-color')
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },

          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          }
        },
        series: [
          {
            name: '1990',
            data: data[0],
            type: 'scatter',
            symbolSize: value => {
              return Math.sqrt(value[2]) / 5e2;
            },
            emphasis: {
              focus: 'series',
              label: {
                color: getColor('tertiary-color'),
                show: true,
                formatter: param => {
                  return param.data[3];
                },
                position: 'top'
              }
            },
            itemStyle: {
              color: rgbaColor(getColor('primary'), 0.7)
            }
          },
          {
            name: '2015',
            data: data[1],
            type: 'scatter',
            symbolSize: value => {
              return Math.sqrt(value[2]) / 7e2;
            },
            emphasis: {
              focus: 'series',
              label: {
                color: getColor('quaternary-color'),
                show: true,
                formatter: param => {
                  return param.data[3];
                },
                position: 'top'
              }
            },
            itemStyle: {
              color: rgbaColor(getColor('warning'), 0.7)
            }
          }
        ],
        grid: {
          left: 5,
          right: 10,
          bottom: 5,
          top: '20%',
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const quartetScatterChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-quartet-scatter-chart-example'
    );

    const dataAll = [
      [
        [10.0, 8.04],
        [8.0, 6.95],
        [13.0, 7.58],
        [9.0, 8.81],
        [11.0, 8.33],
        [14.0, 9.96],
        [6.0, 7.24],
        [4.0, 4.26],
        [12.0, 10.84],
        [7.0, 4.82],
        [5.0, 5.68]
      ],
      [
        [10.0, 9.14],
        [8.0, 8.14],
        [13.0, 8.74],
        [9.0, 8.77],
        [11.0, 9.26],
        [14.0, 8.1],
        [6.0, 6.13],
        [4.0, 3.1],
        [12.0, 9.13],
        [7.0, 7.26],
        [5.0, 4.74]
      ],
      [
        [10.0, 7.46],
        [8.0, 6.77],
        [13.0, 12.74],
        [9.0, 7.11],
        [11.0, 7.81],
        [14.0, 8.84],
        [6.0, 6.08],
        [4.0, 5.39],
        [12.0, 8.15],
        [7.0, 6.42],
        [5.0, 5.73]
      ],
      [
        [8.0, 6.58],
        [8.0, 5.76],
        [8.0, 7.71],
        [8.0, 8.84],
        [8.0, 8.47],
        [8.0, 7.04],
        [8.0, 5.25],
        [19.0, 12.5],
        [8.0, 5.56],
        [8.0, 7.91],
        [8.0, 6.89]
      ]
    ];

    const xAxis = () => ({
      axisLabel: {
        color: getColor('quaternary-color')
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: getColor('tertiary-bg')
        }
      },

      splitLine: {
        show: true,
        lineStyle: {
          color: getColor('secondary-bg')
        }
      }
    });

    const yAxis = () => ({
      axisLabel: {
        color: getColor('quaternary-color')
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: getColor('secondary-bg')
        }
      },

      axisLine: {
        show: true,
        lineStyle: {
          color: getColor('tertiary-bg')
        }
      }
    });

    const markLineOpt = {
      animation: false,
      label: {
        formatter: 'y = 0.5 * x + 3',
        align: 'right',
        color: getColor('tertiary-color'),
        fontWeight: 600
      },
      lineStyle: {
        type: 'solid'
      },
      tooltip: {
        formatter: 'y = 0.5 * x + 3'
      },
      data: [
        [
          {
            coord: [0, 3],
            symbol: 'none'
          },
          {
            coord: [20, 13],
            symbol: 'none'
          }
        ]
      ]
    };

    const gridMdUp = [
      { left: '7%', top: '10%', width: '38%', height: '38%' },
      { right: '7%', top: '10%', width: '38%', height: '38%' },
      { left: '7%', bottom: '7%', width: '38%', height: '38%' },
      { right: '7%', bottom: '7%', width: '38%', height: '38%' }
    ];

    const gridMdDown = [
      { left: 6, right: 7, top: '4%', height: '20%' },
      { left: 6, right: 7, top: '29%', height: '20%' },
      { left: 6, right: 7, bottom: '26%', height: '20%' },
      { left: 6, right: 7, bottom: 25, height: '20%' }
    ];
    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        color: [
          getColor('primary'),
          getColor('success'),
          getColor('warning'),
          getColor('danger')
        ],
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'none'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          formatter: 'Group {a}: ({c})'
        },
        title: {
          text: "Anscombe's quartet",
          left: 'center',
          top: 0,
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        grid: window.innerWidth < 768 ? gridMdDown : gridMdUp,
        xAxis: [
          { gridIndex: 0, min: 0, max: 20, ...xAxis() },
          { gridIndex: 1, min: 0, max: 20, ...xAxis() },
          { gridIndex: 2, min: 0, max: 20, ...xAxis() },
          { gridIndex: 3, min: 0, max: 20, ...xAxis() }
        ],
        yAxis: [
          { gridIndex: 0, min: 0, max: 15, ...yAxis() },
          { gridIndex: 1, min: 0, max: 15, ...yAxis() },
          { gridIndex: 2, min: 0, max: 15, ...yAxis() },
          { gridIndex: 3, min: 0, max: 15, ...yAxis() }
        ],
        series: [
          {
            name: 'I',
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: dataAll[0],
            markLine: markLineOpt
          },
          {
            name: 'II',
            type: 'scatter',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: dataAll[1],
            markLine: markLineOpt
          },
          {
            name: 'III',
            type: 'scatter',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: dataAll[2],
            markLine: markLineOpt
          },
          {
            name: 'IV',
            type: 'scatter',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: dataAll[3],
            markLine: markLineOpt
          }
        ]
      });
      const responsiveOptions = {
        xs: {
          grid: gridMdDown
        },
        md: {
          grid: gridMdUp
        }
      };
      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const singleAxisScatterChartInit = () => {
    const { getColor, getData, getRandomNumber } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-single-axis-scatter-chart-example'
    );

    const hours = [
      '12am',
      '1am',
      '2am',
      '3am',
      '4am',
      '5am',
      '6am',
      '7am',
      '8am',
      '9am',
      '10am',
      '11am',
      '12pm',
      '1pm',
      '2pm',
      '3pm',
      '4pm',
      '5pm',
      '6pm',
      '7pm',
      '8pm',
      '9pm',
      '10pm',
      '11pm'
    ];

    const days = [
      'Saturday',
      'Friday',
      'Thursday',
      'Wednesday',
      'Tuesday',
      'Monday',
      'Sunday'
    ];

    const data = [];
    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < 24; j += 1) {
        data.push([j, i, getRandomNumber(0, 10)]);
      }
    }

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'none'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: 'top',
          formatter: params => {
            return `
            ${days[params.value[1]]} <br/>
            ${hours[params.value[0]]} : ${params.value[2]}
          `;
          }
        },
        xAxis: {
          type: 'category',
          data: hours,
          boundaryGap: false,
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        yAxis: {
          type: 'category',
          data: days,
          axisLine: {
            show: false
          },
          axisTick: {
            lineStyle: {
              color: getColor('quaternary-color')
            }
          },
          axisLabel: {
            margin: 15
          }
        },
        series: [
          {
            name: 'Punch Card',
            type: 'scatter',
            symbolSize: val => val[2] * 2,
            data,
            animationDelay: idx => {
              return idx * 5;
            },
            itemStyle: {
              color: getColor('primary')
            }
          }
        ],
        grid: {
          right: 12,
          left: 5,
          bottom: 5,
          top: 5,
          containLabel: true
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const pieChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-pie-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        series: [
          {
            type: 'pie',
            radius: window.innerWidth < 530 ? '45%' : '60%',
            label: {
              color: getColor('tertiary-color')
            },
            center: ['50%', '55%'],
            data: [
              {
                value: 1200,
                name: 'Facebook',
                itemStyle: {
                  color: getColor('primary')
                }
              },
              {
                value: 1000,
                name: 'Youtube',
                itemStyle: {
                  color: getColor('danger')
                }
              },
              {
                value: 800,
                name: 'Twitter',
                itemStyle: {
                  color: getColor('info')
                }
              },
              {
                value: 600,
                name: 'Linkedin',
                itemStyle: {
                  color: getColor('success')
                }
              },
              {
                value: 400,
                name: 'Github',
                itemStyle: {
                  color: getColor('warning')
                }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: rgbaColor(getColor('tertiary-color'), 0.5)
              }
            }
          }
        ],
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          }
        }
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              radius: '45%'
            }
          ]
        },
        sm: {
          series: [
            {
              radius: '60%'
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const doughnutChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-doughnut-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: 1200,
                name: 'Facebook',
                itemStyle: {
                  color: getColor('primary')
                }
              },
              {
                value: 1000,
                name: 'Youtube',
                itemStyle: {
                  color: getColor('danger')
                }
              },
              {
                value: 800,
                name: 'Twitter',
                itemStyle: {
                  color: getColor('info')
                }
              },
              {
                value: 600,
                name: 'Linkedin',
                itemStyle: {
                  color: getColor('success')
                }
              },
              {
                value: 400,
                name: 'Github',
                itemStyle: {
                  color: getColor('warning')
                }
              }
            ]
          }
        ],
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          }
        }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const doughnutRoundedChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-doughnut-rounded-chart-example'
    );

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: window.innerWidth < 530 ? ['65%', '55%'] : ['50%', '55%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: getColor('body-highlight-bg'),
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: 1200,
                name: 'Starter',
                itemStyle: {
                  color: getColor('primary')
                }
              },
              {
                value: 1000,
                name: 'Basic',
                itemStyle: {
                  color: getColor('danger')
                }
              },
              {
                value: 800,
                name: 'Optimal',
                itemStyle: {
                  color: getColor('info')
                }
              },
              {
                value: 600,
                name: 'Business',
                itemStyle: {
                  color: getColor('success')
                }
              },
              {
                value: 400,
                name: 'Premium',
                itemStyle: {
                  color: getColor('warning')
                }
              }
            ]
          }
        ],
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          }
        }
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              center: ['65%', '55%']
            }
          ]
        },
        sm: {
          series: [
            {
              center: ['50%', '55%']
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const pieMultipleChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-pie-multiple-chart-example');
    const data1 = [
      {
        value: 1048,
        name: 'Starter',
        itemStyle: {
          color: getColor('danger')
        }
      },
      {
        value: 735,
        name: 'Basic',
        itemStyle: {
          color: getColor('primary')
        }
      },
      {
        value: 580,
        name: 'Optimal',
        itemStyle: {
          color: getColor('secondary')
        }
      },
      {
        value: 484,
        name: 'Business',
        itemStyle: {
          color: getColor('warning')
        }
      },
      {
        value: 300,
        name: 'Premium',
        itemStyle: {
          color: getColor('success')
        }
      },
      {
        value: 300,
        name: 'Platinum',
        itemStyle: {
          color: getColor('info')
        }
      }
    ];

    const data2 = [
      {
        value: 1048,
        name: 'Facebook',
        itemStyle: {
          color: getColor('primary')
        }
      },
      {
        value: 735,
        name: 'Youtube',
        itemStyle: {
          color: getColor('danger')
        }
      },
      {
        value: 580,
        name: 'Twitter',
        itemStyle: {
          color: getColor('info')
        }
      },
      {
        value: 484,
        name: 'Linkedin',
        itemStyle: {
          color: getColor('success')
        }
      },
      {
        value: 300,
        name: 'Github',
        itemStyle: {
          color: getColor('warning')
        }
      }
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        title: [
          {
            text: 'Pie Multiple Chart',
            left: 'center',
            textStyle: {
              color: getColor('tertiary-color')
            }
          }
        ],

        tooltip: {
          trigger: 'item',
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

        series: [
          {
            type: 'pie',
            radius: window.innerWidth < 450 ? '48%' : '55%',
            center: ['25%', '50%'],
            data: data1,
            label: {
              show: false
            }
          },
          {
            type: 'pie',
            radius: window.innerWidth < 450 ? '48%' : '55%',
            center: ['75%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            data: data2
          }
        ]
      });

      const responsiveOptions = {
        xs: {
          series: [{ radius: '48%' }, { radius: '48%' }]
        },
        sm: {
          series: [{ radius: '55%' }, { radius: '55%' }]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const pieLabelAlignChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-pie-label-align-chart-example'
    );

    const data = [
      {
        value: 850,
        name: 'Starter',
        itemStyle: {
          color: rgbaColor(getColor('primary'), 0.5)
        }
      },
      {
        value: 750,
        name: 'Starter Pro',
        itemStyle: {
          color: getColor('danger')
        }
      },
      {
        value: 457,
        name: 'Basic',
        itemStyle: {
          color: getColor('primary')
        }
      },
      {
        value: 654,
        name: 'Optimal',
        itemStyle: {
          color: getColor('secondary')
        }
      },
      {
        value: 447,
        name: 'Business',
        itemStyle: {
          color: getColor('warning')
        }
      },
      {
        value: 682,
        name: 'Classic addition',
        itemStyle: {
          color: rgbaColor(getColor('warning'), 0.8)
        }
      },
      {
        value: 471,
        name: 'Premium',
        itemStyle: {
          color: getColor('success')
        }
      },
      {
        value: 524,
        name: 'Platinum',
        itemStyle: {
          color: getColor('info')
        }
      },
      {
        value: 200,
        name: 'Platinum Pro',
        itemStyle: {
          color: rgbaColor(getColor('primary'), 0.5)
        }
      }
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        title: [
          {
            text: 'Pie Label Align Chart',
            left: 'center',
            textStyle: {
              color: getColor('tertiary-color')
            }
          },
          {
            subtext: 'alignTo: "labelLine"',
            left: '50%',
            top: '85%',
            textAlign: 'center',
            subtextStyle: {
              color: getColor('tertiary-color')
            }
          }
        ],

        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          position(pos, ...size) {
            if (window.innerWidth <= 540) {
              const tooltipHeight = size[1].offsetHeight;
              const obj = { top: pos[1] - tooltipHeight - 20 };
              obj[pos[0] < size[3].viewSize[0] / 2 ? 'left' : 'right'] = 5;
              return obj;
            }
            return null;
          }
        },

        series: [
          {
            type: 'pie',
            radius: window.innerWidth < 530 ? '45%' : '60%',
            center: ['50%', '50%'],
            data,
            label: {
              position: 'outer',
              alignTo: 'labelLine',
              bleedMargin: 5,
              color: getColor('tertiary-color')
            },
            left: '5%',
            right: '5%',
            top: 0,
            bottom: 0
          }
        ]
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              radius: '45%'
            }
          ]
        },
        sm: {
          series: [
            {
              radius: '60%'
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const pieEdgeAlignChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-pie-edge-align-chart-example'
    );

    const data = [
      {
        value: 850,
        name: 'Starter',
        itemStyle: {
          color: rgbaColor(getColor('primary'), 0.5)
        }
      },
      {
        value: 750,
        name: 'Starter Pro',
        itemStyle: {
          color: getColor('danger')
        }
      },
      {
        value: 457,
        name: 'Basic',
        itemStyle: {
          color: getColor('primary')
        }
      },
      {
        value: 654,
        name: 'Optimal',
        itemStyle: {
          color: getColor('secondary')
        }
      },
      {
        value: 447,
        name: 'Business',
        itemStyle: {
          color: getColor('warning')
        }
      },
      {
        value: 682,
        name: 'Classic addition',
        itemStyle: {
          color: rgbaColor(getColor('warning'), 0.8)
        }
      },
      {
        value: 471,
        name: 'Premium',
        itemStyle: {
          color: getColor('success')
        }
      },
      {
        value: 524,
        name: 'Platinum',
        itemStyle: {
          color: getColor('info')
        }
      },
      {
        value: 200,
        name: 'Platinum Pro',
        itemStyle: {
          color: rgbaColor(getColor('primary'), 0.5)
        }
      }
    ];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        title: [
          {
            text: 'Pie Edge Align Chart',
            left: 'center',
            textStyle: {
              color: getColor('tertiary-color')
            }
          },
          {
            subtext: 'alignTo: "edge"',
            left: '50%',
            top: '85%',
            textAlign: 'center',
            subtextStyle: {
              color: getColor('tertiary-color')
            }
          }
        ],

        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          position(pos, ...size) {
            if (window.innerWidth <= 540) {
              const tooltipHeight = size[1].offsetHeight;
              const obj = { top: pos[1] - tooltipHeight - 20 };
              obj[pos[0] < size[3].viewSize[0] / 2 ? 'left' : 'right'] = 5;
              return obj;
            }
            return null;
          }
        },

        series: [
          {
            type: 'pie',
            radius: window.innerWidth < 530 ? '45%' : '60%',
            center: ['50%', '50%'],
            data,
            label: {
              position: 'outer',
              alignTo: 'edge',
              margin: 20,
              color: getColor('tertiary-color')
            },
            left: '5%',
            right: '5%',
            top: 0,
            bottom: 0
          }
        ]
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              radius: '45%'
            }
          ]
        },
        sm: {
          series: [
            {
              radius: '60%'
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const basicGaugeChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-basic-gauge-chart-example');

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

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        radius: '100%',
        series: [
          {
            name: 'Pressure',
            type: 'gauge',
            splitLine: {
              lineStyle: {
                color: getColor('tertiary-color')
              }
            },
            axisLabel: {
              color: getColor('tertiary-color')
            },
            detail: {
              formatter: '{value}'
            },
            title: {
              color: getColor('tertiary-color')
            },
            data: [
              {
                value: 50,
                name: 'SCORE',
                detail: {
                  color: getColor('tertiary-color')
                }
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const gaugeProgressChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-gauge-progress-chart-example'
    );

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

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'],
            radius: '100%',
            startAngle: 180,
            endAngle: 0,
            progress: {
              show: true,
              width: 18,
              itemStyle: {
                color: getColor('info')
              }
            },
            itemStyle: {
              color: getColor('info'),
              shadowColor: rgbaColor(getColor('primary'), 0.5),
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: [[1, getColor('secondary-bg')]]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                width: 2,
                color: getColor('quaternary-color')
              }
            },
            axisLabel: {
              distance: 25,
              color: getColor('quaternary-color')
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 25,
              itemStyle: {
                color: getColor('info')
              }
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 80,
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: 70,
                detail: {
                  fontSize: 30,
                  color: getColor('quaternary-color'),
                  offsetCenter: [0, '40%']
                }
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const gaugeRingChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-gauge-ring-chart-example');

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

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        series: [
          {
            type: 'gauge',
            radius: '100%',
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                borderWidth: 1,
                borderColor: getColor('quaternary-color')
              }
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: [[1, getColor('secondary-bg')]]
              }
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              distance: 50
            },
            data: [
              {
                value: 80,
                title: {
                  offsetCenter: ['0%', '0%']
                },
                detail: {
                  offsetCenter: ['0%', '0%']
                },
                itemStyle: {
                  color: getColor('primary')
                }
              }
            ],
            title: {
              fontSize: 14
            },
            detail: {
              width: 50,
              height: 14,
              fontSize: 20,
              color: 'auto',
              formatter: '{value}%'
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const gaugeMultiRingChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-gauge-multiring-chart-example'
    );

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        series: [
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            radius: '85%',
            pointer: {
              show: false
            },
            center: ['50%', '50%'],
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                color: getColor('info')
              }
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [[1, getColor('secondary-bg')]]
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: [79],
            detail: {
              show: false
            },
            animationDuration: 2000
          },
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            radius: '70%',
            pointer: {
              show: false
            },
            center: ['50%', '50%'],
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                color: getColor('primary')
              }
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [[1, getColor('secondary-bg')]]
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: [85],
            detail: {
              show: false
            },
            animationDuration: 2000
          },
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            radius: '55%',
            pointer: {
              show: false
            },
            center: ['50%', '50%'],
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                color: getColor('success')
              }
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [[1, getColor('secondary-bg')]]
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: [70],
            detail: {
              show: false
            },
            animationDuration: 2000
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const gaugeMultiTitleChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-gauge-multi-title-chart-example'
    );

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

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
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
        series: [
          {
            type: 'gauge',
            radius: '100%',
            anchor: {
              show: true,
              showAbove: true,
              size: 18,
              itemStyle: {
                color: getColor('warning')
              }
            },

            progress: {
              show: true,
              overlap: true,
              roundCap: true
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                color: [[1, getColor('secondary-bg')]]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                width: 2,
                color: getColor('quaternary-color')
              }
            },
            axisLabel: {
              distance: 25,
              color: getColor('quaternary-color')
            },
            data: [
              {
                value: 20,
                name: 'Perfect',
                title: {
                  offsetCenter: ['-40%', '80%']
                },
                detail: {
                  offsetCenter: ['-40%', '95%']
                },
                itemStyle: {
                  color: getColor('primary')
                }
              },
              {
                value: 40,
                name: 'Good',
                title: {
                  offsetCenter: ['0%', '80%']
                },
                detail: {
                  offsetCenter: ['0%', '95%']
                },

                itemStyle: {
                  color: getColor('success')
                }
              },
              {
                value: 60,
                name: 'Commonly',
                title: {
                  offsetCenter: ['40%', '80%']
                },
                detail: {
                  offsetCenter: ['40%', '95%']
                },

                itemStyle: {
                  color: getColor('warning')
                }
              }
            ],
            title: {
              fontSize: 14,
              color: getColor('tertiary-color')
            },
            detail: {
              width: 40,
              height: 14,
              fontSize: 14,
              color: '#fff',
              backgroundColor: 'auto',
              borderRadius: 3,
              formatter: '{value}%'
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const gaugeGradeChartInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-gauge-grade-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        series: [
          {
            radius: '100%',
            type: 'gauge',
            center: ['50%', '70%'],
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 1,
            splitNumber: 8,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.25, getColor('danger')],
                  [0.5, getColor('warning')],
                  [0.75, getColor('info')],
                  [1, getColor('success')]
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '12%',
              width: 20,
              offsetCenter: [0, '-60%'],
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 2
              }
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: 'auto',
                width: 5
              }
            },
            axisLabel: {
              color: getColor('quaternary-color'),
              distance: -60,
              formatter: value => {
                if (value === 0.875) {
                  return 'Excellent';
                }
                if (value === 0.625) {
                  return 'Good';
                }
                if (value === 0.375) {
                  return 'Well';
                }
                if (value === 0.125) {
                  return 'Bad';
                }
                return '';
              }
            },
            title: {
              offsetCenter: [0, '-20%'],
              color: getColor('tertiary-color')
            },
            detail: {
              offsetCenter: [0, '0%'],
              valueAnimation: true,
              formatter: value => {
                return Math.round(value * 100);
              },
              color: 'auto'
            },
            data: [
              {
                value: 0.7,
                name: 'Grade'
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const radarChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-radar-chart-example');

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          position(pos, ...size) {
            if (window.innerWidth <= 540) {
              const tooltipHeight = size[1].offsetHeight;
              const obj = { top: pos[1] - tooltipHeight - 20 };
              obj[pos[0] < size[3].viewSize[0] / 2 ? 'left' : 'right'] = 5;
              return obj;
            }
            return null;
          }
        },

        radar: {
          indicator: [
            { name: 'Marketing', max: 6500 },
            { name: 'Admin', max: 16000 },
            { name: 'Tech', max: 30000 },
            { name: 'Support', max: 38000 },
            { name: 'Dev ', max: 52000 },
            { name: 'Sales ', max: 25000 }
          ],
          radius: 120,
          splitLine: {
            lineStyle: {
              color: rgbaColor(getColor('tertiary-color'))
            }
          }
        },

        series: [
          {
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: 'Data A',
                itemStyle: {
                  color: getColor('primary')
                }
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: 'Data B',
                itemStyle: {
                  color: getColor('warning')
                }
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const radarCustomizedChartInit = () => {
    const { getColor, getData, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-radar-customized-chart-example'
    );

    const getFormatter = params => {
      const indicators = [
        ['Marketing', 'Sales', 'Dev', 'Support', 'Tech', 'Admin'],
        ['Language', 'Math', 'English', 'Physics', 'Chemistry', 'Biology']
      ];
      const num = params.seriesIndex;
      return `<strong > ${params.name} </strong>
    <div class="fs-9 text-body-tertiary">
      <strong >${indicators[params.seriesIndex][0]}</strong>: ${
      params.value[0]
    }  <br>
      <strong>${indicators[num][1]}</strong>: ${params.value[1]}  <br>
      <strong>${indicators[num][2]}</strong>: ${params.value[2]}  <br>
      <strong>${indicators[num][3]}</strong>: ${params.value[3]}  <br>
      <strong>${indicators[num][4]}</strong>: ${params.value[4]}  <br>
      <strong>${indicators[num][5]}</strong>: ${params.value[5]}  <br>
    </div>`;
    };

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          formatter: getFormatter
        },

        radar: [
          {
            startAngle: 90,
            splitNumber: 4,
            shape: 'circle',
            indicator: [
              { name: 'Admin', max: 6500 },
              { name: 'Tech', max: 16000 },
              { name: 'Support', max: 30000 },
              { name: 'Dev', max: 38000 },
              { name: 'Sales', max: 52000 },
              { name: 'Marketing', max: 25000 }
            ],
            name: {
              formatter: '{value}',
              textStyle: {
                color: getColor('tertiary-color')
              }
            },
            splitLine: {
              lineStyle: {
                color: rgbaColor(getColor('tertiary-color'))
              }
            }
          },

          {
            indicator: [
              { text: 'Language', max: 150 },
              { text: 'Math', max: 150 },
              { text: 'English', max: 150 },
              { text: 'physics', max: 120 },
              { text: 'Chemistry', max: 108 },
              { text: 'Biology', max: 72 }
            ],
            radius: window.innerWidth < 576 ? 90 : 120,
            center: window.innerWidth < 992 ? ['50%', '75%'] : ['75%', '50%'],
            splitLine: {
              lineStyle: {
                color: getColor('tertiary-color')
              }
            },
            name: {
              textStyle: {
                color: getColor('tertiary-color'),
                backgroundColor: rgbaColor(getColor('body-highlight-bg')),
                borderRadius: 3,
                padding: [3, 5]
              }
            }
          }
        ],

        series: [
          {
            type: 'radar',
            data: [
              {
                value: [5200, 4000, 20000, 30000, 20000, 18000],
                name: 'Data A',
                itemStyle: {
                  color: getColor('info')
                },
                areaStyle: {
                  color: rgbaColor(getColor('info'), 0.3)
                }
              },
              {
                value: [5000, 12000, 28000, 26000, 32000, 21000],
                name: 'Data B',
                itemStyle: {
                  color: getColor('success')
                },
                areaStyle: {
                  color: rgbaColor(getColor('success'), 0.3)
                }
              }
            ]
          },

          {
            type: 'radar',
            radarIndex: 1,
            data: [
              {
                value: [130, 110, 130, 100, 99, 70],
                name: 'Data C',
                symbol: 'rect',
                symbolSize: 12,
                lineStyle: {
                  type: 'dashed'
                },
                itemStyle: {
                  color: getColor('warning')
                },
                areaStyle: {
                  color: rgbaColor(getColor('warning'), 0.3)
                },
                label: {
                  show: true,
                  formatter: params => {
                    return params.value;
                  },
                  color: getColor('tertiary-color')
                }
              },
              {
                value: [100, 93, 50, 90, 70, 60],
                name: 'Data D',
                itemStyle: {
                  color: getColor('danger')
                },
                areaStyle: {
                  color: rgbaColor(getColor('danger'), 0.3)
                }
              }
            ]
          }
        ]
      });

      const responsiveOptions = {
        xs: {
          radar: [
            {
              center: ['50%', '30%'],
              radius: 90
            },
            {
              center: ['50%', '75%'],
              radius: 90
            }
          ]
        },
        sm: {
          radar: [
            {
              radius: 120
            },
            {
              radius: 120
            }
          ]
        },
        xl: {
          radar: [
            {
              center: ['25%', '50%']
            },
            {
              center: ['75%', '50%']
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const radarMultipleChartInit = () => {
    const { getColor, getData, rgbaColor, resize } = window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-radar-multiple-chart-example'
    );

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const getCenter = () => {
      if (window.innerWidth < 1540 && window.innerWidth > 992) {
        return [
          ['25%', '40%'],
          ['50%', '75%'],
          ['75%', '40%']
        ];
      }
      if (window.innerWidth < 992) {
        return [
          ['50%', '20%'],
          ['50%', '50%'],
          ['50%', '80%']
        ];
      }
      return [
        ['15%', '50%'],
        ['50%', '50%'],
        ['85%', '50%']
      ];
    };

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        legend: {
          left: 'left',
          textStyle: {
            color: getColor('tertiary-color')
          }
        },
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          position(pos, ...size) {
            if (window.innerWidth <= 540) {
              const tooltipHeight = size[1].offsetHeight;
              const obj = { top: pos[1] - tooltipHeight - 20 };
              obj[pos[0] < size[3].viewSize[0] / 2 ? 'left' : 'right'] = 5;
              return obj;
            }
            return null;
          }
        },

        radar: [
          {
            indicator: [
              { text: 'Brand', max: 100 },
              { text: 'content', max: 100 },
              { text: 'Usability', max: 100 },
              { text: 'Features', max: 100 }
            ],
            center: getCenter()[0],
            radius: 85,
            splitLine: {
              lineStyle: {
                color: rgbaColor(getColor('tertiary-color'))
              }
            }
          },
          {
            indicator: [
              { text: 'Exterior', max: 100 },
              { text: 'Take pictures', max: 100 },
              { text: 'system', max: 100 },
              { text: 'performance', max: 100 },
              { text: 'screen', max: 100 }
            ],
            radius: 85,
            center: getCenter()[1],
            splitLine: {
              lineStyle: {
                color: rgbaColor(getColor('tertiary-color'))
              }
            }
          },
          {
            indicator: months.map(month => ({
              text: month,
              max: 100
            })),
            center: getCenter()[2],
            radius: 85,
            splitLine: {
              lineStyle: {
                color: rgbaColor(getColor('tertiary-color'))
              }
            }
          }
        ],

        series: [
          {
            type: 'radar',
            tooltip: {
              trigger: 'item'
            },
            areaStyle: {
              color: rgbaColor(getColor('info'), 0.5)
            },
            data: [
              {
                value: [60, 73, 85, 40],
                name: 'A software',
                itemStyle: {
                  color: getColor('info')
                }
              }
            ]
          },
          {
            type: 'radar',
            radarIndex: 1,
            data: [
              {
                value: [85, 90, 90, 95, 95],
                name: 'A staple mobile phone',
                itemStyle: {
                  color: rgbaColor(getColor('primary'), 0.8)
                },
                areaStyle: {
                  color: rgbaColor(getColor('primary'), 0.3)
                }
              },
              {
                value: [95, 80, 75, 90, 93],
                name: 'A fruit phone',
                itemStyle: {
                  color: getColor('success')
                },
                areaStyle: {
                  color: rgbaColor(getColor('success'), 0.3)
                }
              }
            ]
          },
          {
            type: 'radar',
            radarIndex: 2,
            areaStyle: {},
            tooltip: {
              show: false
            },
            data: [
              {
                name: 'Precipitation',
                value: [
                  2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 75.6, 82.2, 48.7, 18.8, 6.0,
                  2.3
                ],
                itemStyle: {
                  color: getColor('primary')
                },
                areaStyle: {
                  color: rgbaColor(getColor('primary'), 0.5)
                }
              },
              {
                name: 'Evaporation',
                value: [
                  2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 35.6, 62.2, 32.6, 20.0, 6.4,
                  3.3
                ],
                itemStyle: {
                  color: getColor('warning')
                },
                areaStyle: {
                  color: rgbaColor(getColor('warning'), 0.5)
                }
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      resize(() => {
        chart.setOption({
          radar: getCenter().map(item => ({
            center: item
          }))
        });
      });
    }
  };

  const heatmapChartInit = () => {
    const { getColor, getData, rgbaColor, getRandomNumber } =
      window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-heatmap-chart-example');

    const hours = [
      '12a',
      '2a',
      '4a',
      '6a',
      '8a',
      '10a',
      '12p',
      '2p',
      '4p',
      '6p',
      '8p',
      '10p'
    ];
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    const data = [];
    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < 12; j += 1) {
        data.push([j, i, getRandomNumber(5, 12)]);
      }
    }

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        tooltip: {
          position: 'top',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1
        },
        grid: {
          right: 5,
          left: 5,
          top: 5,
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hours,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        yAxis: {
          type: 'category',
          data: days,
          axisLabel: {
            formatter: value => value.substring(0, 3),
            color: getColor('quaternary-color')
          },
          splitArea: {
            show: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          textStyle: {
            color: getColor('tertiary-color'),
            fontWeight: 500
          },
          inRange: {
            color: [
              rgbaColor(getColor('primary'), 1),
              rgbaColor(getColor('info'), 1),
              rgbaColor(getColor('success'), 1)
              // utils.rgbaColor(utils.getColors()['warning'], 1),
              // utils.rgbaColor(utils.getColors()['danger'], 1)
            ]
          }
        },
        series: [
          {
            type: 'heatmap',
            data,
            label: {
              show: true
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: rgbaColor(getColor('black'), 0.5)
              }
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const heatmapSingleSeriesChartInit = () => {
    const { getColor, getData, rgbaColor, getRandomNumber } =
      window.phoenix.utils;
    const $chartEl = document.querySelector(
      '.echart-heatmap-single-series-chart-example'
    );

    const hours = [
      '12a',
      '2a',
      '4a',
      '6a',
      '8a',
      '10a',
      '12p',
      '2p',
      '4p',
      '6p',
      '8p',
      '10p'
    ];
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    const data = [];
    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < 12; j += 1) {
        data.push([j, i, getRandomNumber(1, 12)]);
      }
    }

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);
      const getDefaultOptions = () => ({
        gradientColor: [
          rgbaColor(getColor('info'), 1),
          rgbaColor(getColor('primary'), 1)
        ],

        tooltip: {
          position: 'top',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1
        },
        grid: {
          right: 5,
          left: 5,
          top: 5,
          bottom: 5,
          containLabel: true
        },
        xAxis: {
          axisTick: { show: false },
          type: 'category',
          data: hours,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: getColor('quaternary-color')
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        yAxis: {
          axisTick: { show: false },
          type: 'category',
          data: days,
          axisLabel: {
            formatter: value => value.substring(0, 3),
            color: getColor('quaternary-color')
          },
          splitArea: {
            show: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('quaternary-color')
            }
          }
        },
        visualMap: {
          show: false,
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          textStyle: {
            color: getColor('quaternary-color'),
            fontWeight: 500
          }
        },

        series: [
          {
            type: 'heatmap',
            data,
            label: {
              show: true
            },
            itemStyle: {
              borderColor: getColor('body-highlight-bg'),
              borderWidth: 3
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: rgbaColor(getColor('black'), 0.5)
              }
            }
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(basicLineChartInit);
  docReady(basicAreaLineChartInit);
  docReady(stackedLineChartInit);
  docReady(stackedAreaChartInit);
  docReady(lineMarkerChartInit);
  docReady(areaPiecesChartInit);
  docReady(stepLineChartInit);
  docReady(lineGradientChartInit);
  docReady(dynamicLineChartInit);
  docReady(lineLogChartInit);
  docReady(shareDatasetChartInit);
  docReady(basicBarChartInit);
  docReady(horizontalBarChartInit);
  docReady(barNegativeChartInit);
  docReady(seriesBarChartInit);
  docReady(stackedBarChartInit);
  docReady(stackedHorizontalBarChartInit);
  docReady(barRaceChartInit);
  docReady(barGradientChartInit);
  docReady(barLineMixedChartInit);
  docReady(barWaterFallChartInit);
  docReady(barTimelineChartInit);
  docReady(basicCandlestickChartInit);
  docReady(candlestickMixedChartInit);
  docReady(sessionByCountryMapInit);
  docReady(mapUSAInit);
  docReady(basicScatterChartInit);
  docReady(bubbleChartInit);
  docReady(quartetScatterChartInit);
  docReady(singleAxisScatterChartInit);
  docReady(pieChartInit);
  docReady(doughnutChartInit);
  docReady(doughnutRoundedChartInit);
  docReady(pieMultipleChartInit);
  docReady(pieLabelAlignChartInit);
  docReady(pieEdgeAlignChartInit);
  docReady(basicGaugeChartInit);
  docReady(gaugeProgressChartInit);
  docReady(gaugeRingChartInit);
  docReady(gaugeMultiRingChartInit);
  docReady(gaugeMultiTitleChartInit);
  docReady(gaugeGradeChartInit);
  docReady(radarChartInit);
  docReady(radarCustomizedChartInit);
  docReady(radarMultipleChartInit);
  docReady(heatmapChartInit);
  docReady(heatmapSingleSeriesChartInit);

}));
//# sourceMappingURL=echarts-example.js.map

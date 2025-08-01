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

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const contactsBySourceChartInit = () => {
    const { getColor, getData, toggleColor } = window.phoenix.utils;
    const chartElContainer = document.querySelector(
      '.echart-contact-by-source-container'
    );
    const chartEl = chartElContainer.querySelector('.echart-contact-by-source');
    const chartLabel = chartElContainer.querySelector('[data-label]');

    if (chartEl) {
      const userOptions = getData(chartEl, 'echarts');
      const chart = window.echarts.init(chartEl);
      const data = [
        { value: 80, name: 'Organic Search' },
        { value: 65, name: 'Paid Search' },
        { value: 40, name: 'Direct Traffic' },
        { value: 220, name: 'Social Media' },
        { value: 120, name: 'Referrals' },
        { value: 35, name: 'Others Campaigns' }
      ];
      const totalSource = data.reduce((acc, val) => val.value + acc, 0);
      if (chartLabel) {
        chartLabel.innerHTML = totalSource;
      }
      const getDefaultOptions = () => ({
        color: [
          getColor('primary'),
          getColor('success'),
          getColor('info'),
          getColor('info-light'),
          toggleColor(getColor('danger-lighter'), getColor('danger-darker')),
          toggleColor(getColor('warning-light'), getColor('warning-dark'))
        ],
        tooltip: {
          trigger: 'item',
          backgroundColor: getColor('body-bg'),
          borderColor: getColor('secondary-bg'),
          textStyle: {
            color: getColor('tertiary-color')
          },
          borderWidth: 0,
          position: (...params) => handleTooltipPosition(params),
          extraCssText: 'z-index: 1000'
        },
        responsive: true,
        maintainAspectRatio: false,

        series: [
          {
            name: 'Contacts by Source',
            type: 'pie',
            radius: ['55%', '90%'],
            startAngle: 90,
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: getColor('body-bg'),
              borderWidth: 3
            },

            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            },
            labelLine: {
              show: false
            },
            data
          }
        ],
        grid: {
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          containLabel: false
        }
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const contactsCreatedChartInit = () => {
    const { getColor, getData, getPastDates } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-contacts-created');

    const dates = getPastDates(9);

    const data1 = [24, 14, 30, 24, 32, 32, 18, 12, 32];

    const data2 = [36, 28, 36, 39, 54, 38, 22, 34, 52];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary'), getColor('tertiary-bg')],
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
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'category',
          // boundaryGap: false,
          axisLabel: {
            color: getColor('secondary-color'),
            formatter: value => window.dayjs(value).format('D MMM, YY'),
            fontFamily: 'Nunito Sans',
            fontWeight: 600,
            fontSize: 10.24,
            padding: [0, 0, 0, 20]
          },
          splitLine: {
            show: true,
            interval: '10',
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          show: true,
          interval: 10,
          data: dates,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: false
        },
        yAxis: {
          axisPointer: { type: 'none' },
          position: 'right',
          axisTick: 'none',
          splitLine: {
            interval: 5,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLine: { show: false },
          axisLabel: {
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12.8,
            color: getColor('body-color'),
            margin: 20,
            verticalAlign: 'top',
            formatter: value => `${value.toLocaleString()}`
          }
        },
        series: [
          {
            name: 'Actual revenue',
            type: 'bar',
            data: data1,
            barWidth: '4px',
            barGap: '3',
            label: {
              show: true,
              position: 'top',
              color: getColor('body-color'),
              fontWeight: 'bold',
              fontSize: '10.24px'
            },
            z: 10,
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: getColor('tertiary-bg')
            }
          },
          {
            name: 'Projected revenue',
            type: 'bar',
            barWidth: '4px',
            data: data2,
            label: {
              show: true,
              position: 'top',
              color: getColor('primary'),
              fontWeight: 'bold',
              fontSize: '10.24px'
            },
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: getColor('primary')
            }
          }
        ],
        grid: {
          right: 3,
          left: 6,
          bottom: 0,
          top: '5%',
          containLabel: true
        },
        animation: false
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              label: {
                show: false
              }
            },
            {
              label: {
                show: false
              }
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                     Echart Bar Member info                                 */
  /* -------------------------------------------------------------------------- */

  const newUsersChartsInit = () => {
    const { getColor, getData, getPastDates, rgbaColor } = window.phoenix.utils;
    const $echartnewUsersCharts = document.querySelector('.echarts-new-users');
    const tooltipFormatter = params => {
      const currentDate = window.dayjs(params[0].axisValue);
      const prevDate = window.dayjs(params[0].axisValue).subtract(1, 'month');

      const result = params.map((param, index) => ({
        value: param.value,
        date: index > 0 ? prevDate : currentDate,
        color: param.color
      }));

      let tooltipItem = ``;
      result.forEach((el, index) => {
        tooltipItem += `<h6 class="fs-9 text-body-tertiary ${
        index > 0 && 'mb-0'
      }"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
      ${el.date.format('MMM DD')} : ${el.value}
    </h6>`;
      });
      return `<div class='ms-1'>
              ${tooltipItem}
            </div>`;
    };

    if ($echartnewUsersCharts) {
      const userOptions = getData($echartnewUsersCharts, 'echarts');
      const chart = window.echarts.init($echartnewUsersCharts);
      const dates = getPastDates(12);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: 10,
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: [
          {
            type: 'category',

            data: dates,
            show: true,
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              showMinLabel: true,
              showMaxLabel: false,
              color: getColor('secondary-color'),
              align: 'left',
              interval: 5,
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 12.8
            }
          },
          {
            type: 'category',
            position: 'bottom',
            show: true,
            data: dates,
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              interval: 130,
              showMaxLabel: true,
              showMinLabel: false,
              color: getColor('secondary-color'),
              align: 'right',
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 12.8
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            boundaryGap: false
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
            data: [220, 220, 150, 150, 150, 250, 250, 400, 400, 400, 300, 300],
            lineStyle: {
              width: 2,
              color: getColor('info')
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
                    color: rgbaColor(getColor('info'), 0.2)
                  },
                  {
                    offset: 1,
                    color: rgbaColor(getColor('info'), 0)
                  }
                ]
              }
            },
            showSymbol: false,
            symbol: 'circle',
            zlevel: 1
          }
        ],
        grid: { left: 0, right: 0, top: 5, bottom: 20 }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                     Echart Bar Member info                                 */
  /* -------------------------------------------------------------------------- */

  const newLeadsChartsInit = () => {
    const { getColor, getData, getPastDates, rgbaColor } = window.phoenix.utils;
    const $echartnewLeadsCharts = document.querySelector('.echarts-new-leads');
    const tooltipFormatter = params => {
      const currentDate = window.dayjs(params[0].axisValue);
      const prevDate = window.dayjs(params[0].axisValue).subtract(1, 'month');

      const result = params.map((param, index) => ({
        value: param.value,
        date: index > 0 ? prevDate : currentDate,
        color: param.color
      }));

      let tooltipItem = ``;
      result.forEach((el, index) => {
        tooltipItem += `<h6 class="fs-9 text-body-tertiary ${
        index > 0 && 'mb-0'
      }"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
      ${el.date.format('MMM DD')} : ${el.value}
    </h6>`;
      });
      return `<div class='ms-1'>
              ${tooltipItem}
            </div>`;
    };

    if ($echartnewLeadsCharts) {
      const userOptions = getData($echartnewLeadsCharts, 'echarts');
      const chart = window.echarts.init($echartnewLeadsCharts);
      const dates = getPastDates(11);
      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: 10,
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: [
          {
            type: 'category',

            data: dates,
            show: true,
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              showMinLabel: true,
              showMaxLabel: false,
              color: getColor('secondary-color'),
              align: 'left',
              interval: 5,
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 12.8
            }
          },
          {
            type: 'category',
            position: 'bottom',
            show: true,
            data: dates,
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              interval: 130,
              showMaxLabel: true,
              showMinLabel: false,
              color: getColor('secondary-color'),
              align: 'right',
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 12.8
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            boundaryGap: false
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
            data: [100, 100, 260, 250, 270, 160, 190, 180, 260, 200, 220],
            lineStyle: {
              width: 2,
              color: getColor('primary')
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
                    color: rgbaColor(getColor('primary'), 0.2)
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
            zlevel: 1
          }
        ],
        grid: { left: 0, right: 0, top: 5, bottom: 20 }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const addClicksChartInit = () => {
    const { getColor, getData, getPastDates, getItemFromStore } =
      window.phoenix.utils;
    const $addClicksChart = document.querySelector('.echart-add-clicks-chart');

    // getItemFromStore('phoenixTheme')
    const dates = getPastDates(11);
    const currentMonthData = [
      2000, 2250, 1070, 1200, 1000, 1450, 3100, 2900, 1800, 1450, 1700
    ];

    const prevMonthData = [
      1100, 1200, 2700, 1700, 2100, 2000, 2300, 1200, 2600, 2900, 1900
    ];

    const tooltipFormatter = params => {
      const currentDate = window.dayjs(params[0].axisValue);
      const prevDate = window.dayjs(params[0].axisValue).subtract(1, 'month');

      const result = params.map((param, index) => ({
        value: param.value,
        date: index > 0 ? prevDate : currentDate,
        color: param.color
      }));

      let tooltipItem = ``;
      result.forEach((el, index) => {
        tooltipItem += `<h6 class="fs-9 text-body-tertiary ${
        index > 0 && 'mb-0'
      }"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
      ${el.date.format('MMM DD')} : ${el.value}
    </h6>`;
      });
      return `<div class='ms-1'>
              ${tooltipItem}
            </div>`;
    };

    if ($addClicksChart) {
      const userOptions = getData($addClicksChart, 'echarts');
      const chart = window.echarts.init($addClicksChart);

      const getDefaultOptions = () => ({
        // color: [getColor('primary'), getColor('info')],
        tooltip: {
          trigger: 'axis',
          padding: 10,
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          axisPointer: {
            type: 'none'
          },
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: [
          {
            type: 'category',
            data: dates,
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              interval: 3,
              showMinLabel: true,
              showMaxLabel: false,
              color: getColor('secondary-color'),
              align: 'left',
              fontFamily: 'Nunito Sans',
              fontWeight: 700,
              fontSize: 12.8,
              margin: 15
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: getColor('tertiary-bg')
              }
            },
            axisTick: {
              show: true,
              interval: 5
            },
            boundaryGap: false
          },
          {
            type: 'category',
            position: 'bottom',
            data: dates,
            axisLabel: {
              formatter: value => window.dayjs(value).format('DD MMM, YY'),
              interval: 130,
              showMaxLabel: true,
              showMinLabel: false,
              color: getColor('body-color'),
              align: 'right',
              fontFamily: 'Nunito Sans',
              fontWeight: 700,
              fontSize: 12.8,
              margin: 15
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: getColor('tertiary-bg')
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: false
            },
            boundaryGap: false
          }
        ],
        yAxis: {
          axisPointer: { type: 'none' },
          axisTick: 'none',
          splitLine: {
            show: true,
            lineStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('body-highlight-bg')
                  : getColor('secondary-bg')
            }
          },
          axisLine: { show: false },
          axisLabel: {
            show: true,
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12.8,
            color: getColor('body-color'),
            margin: 25,
            // verticalAlign: 'bottom',
            formatter: value => `${value / 1000}k`
          }
          // axisLabel: { show: true }
        },
        series: [
          {
            name: 'e',
            type: 'line',
            data: prevMonthData,
            // symbol: 'none',
            lineStyle: {
              type: 'line',
              width: 3,
              color: getColor('info-lighter')
            },
            showSymbol: false,
            symbol: 'emptyCircle',
            symbolSize: 6,
            itemStyle: {
              color: getColor('info-lighter'),
              borderWidth: 3
            },
            zlevel: 2
          },
          {
            name: 'd',
            type: 'line',
            data: currentMonthData,
            showSymbol: false,
            symbol: 'emptyCircle',
            symbolSize: 6,
            itemStyle: {
              color: getColor('primary'),
              borderWidth: 3
            },

            lineStyle: {
              type: 'line',
              width: 3,
              color: getColor('primary')
            },
            zlevel: 1
          }
        ],
        grid: {
          right: 2,
          left: 5,
          bottom: '10px',
          top: '2%',
          containLabel: true
        },
        animation: false
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const echartsLeadConversiontInit = () => {
    const { getColor, getData, getPastDates, toggleColor } = window.phoenix.utils;
    const $leadConversionChartEl = document.querySelector(
      '.echart-lead-conversion'
    );

    const dates = getPastDates(4);

    const tooltipFormatter = params => {
      let tooltipItem = ``;
      params.forEach(el => {
        tooltipItem += `<h6 class="fs-9 text-body-tertiary mb-0"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
      ${el.axisValue} : ${el.value}
    </h6>`;
      });
      return `<div class='ms-1'>
              ${tooltipItem}
            </div>`;
    };

    if ($leadConversionChartEl) {
      const userOptions = getData($leadConversionChartEl, 'echarts');
      const chart = window.echarts.init($leadConversionChartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary'), getColor('tertiary-bg')],
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
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'value',
          inverse: true,
          axisLabel: {
            show: false
          },
          show: false,
          data: dates,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: false
        },
        yAxis: {
          data: ['Closed Won', 'Objection', 'Offer', 'Qualify Lead', 'Created'],
          type: 'category',
          axisPointer: { type: 'none' },
          axisTick: 'none',
          splitLine: {
            interval: 5,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLine: { show: false },
          axisLabel: {
            show: true,
            align: 'left',
            margin: 100,
            color: getColor('body-color')
          }
        },
        series: {
          name: 'Lead Conversion',
          type: 'bar',
          barWidth: '20px',
          showBackground: true,
          backgroundStyle: {
            borderRadius: [4, 0, 0, 4]
          },
          data: [
            {
              value: 1060,
              itemStyle: {
                color: toggleColor(
                  getColor('success-lighter'),
                  getColor('success-dark')
                ),
                borderRadius: [4, 0, 0, 4]
              },
              emphasis: {
                itemStyle: {
                  color: toggleColor(
                    getColor('success-light'),
                    getColor('success-dark')
                  )
                },
                label: {
                  formatter: () => `{b| 53% }`,
                  rich: {
                    b: {
                      color: getColor('white')
                    }
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                formatter: () => `{b| 53%}`,
                rich: {
                  b: {
                    color: toggleColor(
                      getColor('success-dark'),
                      getColor('success-subtle')
                    ),
                    fontWeight: 500,
                    padding: [0, 5, 0, 0]
                  }
                }
              }
            },
            // --
            {
              value: 1200,
              itemStyle: {
                color: toggleColor(
                  getColor('info-lighter'),
                  getColor('info-dark')
                ),
                borderRadius: [4, 0, 0, 4]
              },
              emphasis: {
                itemStyle: {
                  color: toggleColor(
                    getColor('info-light'),
                    getColor('info-dark')
                  )
                },
                label: {
                  formatter: () => `{b| 60% }`,
                  rich: {
                    b: {
                      color: getColor('white')
                    }
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                formatter: () => `{b| 60%}`,
                rich: {
                  b: {
                    color: toggleColor(
                      getColor('info-dark'),
                      getColor('info-bg-subtle')
                    ),
                    fontWeight: 500,
                    padding: [0, 5, 0, 0]
                  }
                }
              }
            },
            {
              value: 1600,
              itemStyle: {
                color: toggleColor(
                  getColor('primary-lighter'),
                  getColor('primary-dark')
                ),
                borderRadius: [4, 0, 0, 4]
              },
              emphasis: {
                itemStyle: {
                  color: toggleColor(
                    getColor('primary-light'),
                    getColor('primary-dark')
                  )
                },
                label: {
                  formatter: () => `{b| 80% }`,
                  rich: {
                    b: {
                      color: getColor('white')
                    }
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                formatter: () => `{b| 80% }`,
                rich: {
                  b: {
                    color: toggleColor(
                      getColor('primary-dark'),
                      getColor('primary-bg-subtle')
                    ),
                    fontWeight: 500,
                    padding: [0, 5, 0, 0]
                  }
                }
              }
            },
            {
              value: 1800,
              itemStyle: {
                color: toggleColor(
                  getColor('warning-lighter'),
                  getColor('warning-dark')
                ),
                borderRadius: [4, 0, 0, 4]
              },
              emphasis: {
                itemStyle: {
                  color: toggleColor(
                    getColor('warning-light'),
                    getColor('warning-dark')
                  )
                },
                label: {
                  formatter: () => `{b| 90% }`,
                  rich: {
                    b: {
                      color: getColor('white')
                    }
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                formatter: () => `{b|90%}`,
                rich: {
                  b: {
                    color: toggleColor(
                      getColor('warning-dark'),
                      getColor('warning-bg-subtle')
                    ),
                    fontWeight: 500,
                    padding: [0, 5, 0, 0]
                  }
                }
              }
            },
            {
              value: 2000,
              itemStyle: {
                color: toggleColor(
                  getColor('danger-lighter'),
                  getColor('danger-dark')
                ),
                borderRadius: [4, 0, 0, 4]
              },
              emphasis: {
                itemStyle: {
                  color: toggleColor(
                    getColor('danger-light'),
                    getColor('danger-dark')
                  )
                },
                label: {
                  formatter: () => `{a|100%}`,
                  rich: {
                    a: {
                      color: getColor('white')
                    }
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                formatter: () => `{a|100%}`,
                rich: {
                  a: {
                    color: toggleColor(
                      getColor('danger-dark'),
                      getColor('danger-bg-subtle')
                    ),
                    fontWeight: 500
                  }
                }
              }
            }
          ],
          barGap: '50%'
        },
        grid: {
          right: 5,
          left: 100,
          bottom: 0,
          top: '5%',
          containLabel: false
        },
        animation: false
      });

      const responsiveOptions = {
        xs: {
          yAxis: {
            show: false
          },
          grid: {
            left: 0
          }
        },
        sm: {
          yAxis: {
            show: true
          },
          grid: {
            left: 100
          }
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const echartsRevenueTargetInit = () => {
    const { getColor, getData } = window.phoenix.utils;
    const $leadConversionChartEl = document.querySelector(
      '.echart-revenue-target-conversion'
    );

    const tooltipFormatter = (params = 'MMM DD') => {
      let tooltipItem = ``;
      params.forEach(el => {
        tooltipItem += `<div class='ms-1'>
          <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
            el.color
          }"></span>
            ${el.seriesName} : $${el.value.toLocaleString()}
          </h6>
        </div>`;
      });
      return `<div>
              <p class='mb-2 text-body-tertiary'>
                ${params[0].axisValue}
              </p>
              ${tooltipItem}
            </div>`;
    };

    const data1 = [42000, 35000, 35000, 40000];
    const data2 = [30644, 33644, 28644, 38644];

    if ($leadConversionChartEl) {
      const userOptions = getData($leadConversionChartEl, 'echarts');
      const chart = window.echarts.init($leadConversionChartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary'), getColor('tertiary-bg')],
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
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            interval: 3,
            showMinLabel: true,
            showMaxLabel: false,
            color: getColor('quaternary-color'),
            align: 'left',
            fontFamily: 'Nunito Sans',
            fontWeight: 400,
            fontSize: 12.8,
            margin: 10,
            formatter: value => `${value / 1000}k`
          },
          show: true,
          axisLine: {
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: false,
          splitLine: {
            show: false
          }
        },
        yAxis: {
          data: ['Luxemburg', 'Canada', 'Australia', 'India'],
          type: 'category',
          axisPointer: { type: 'none' },
          axisTick: 'none',
          splitLine: {
            interval: 5,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLine: { show: false },
          axisLabel: {
            show: true,
            margin: 21,
            color: getColor('body-color')
          }
        },
        series: [
          {
            name: 'Target',
            type: 'bar',
            label: {
              show: false
            },
            emphasis: {
              disabled: true
            },
            showBackground: true,
            backgroundStyle: {
              color: getColor('body-highlight-bg')
            },
            barWidth: '30px',
            barGap: '-100%',
            data: data1,
            itemStyle: {
              borderWidth: 4,
              color: getColor('secondary-bg'),
              borderColor: getColor('secondary-bg')
            }
          },
          {
            name: 'Gained',
            type: 'bar',
            emphasis: {
              disabled: true
            },
            label: {
              show: true,
              color: getColor('white'),
              fontWeight: 700,
              fontFamily: 'Nunito Sans',
              fontSize: 12.8,
              formatter: value => `$${value.value.toLocaleString()}`
            },
            // showBackground: true,
            backgroundStyle: {
              color: getColor('body-highlight-bg')
            },
            barWidth: '30px',
            data: data2,
            itemStyle: {
              borderWidth: 4,
              color: getColor('primary-light'),
              borderColor: getColor('secondary-bg')
            }
          }
        ],
        grid: {
          right: 0,
          left: 0,
          bottom: 8,
          top: 0,
          containLabel: true
        },
        animation: false
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(contactsBySourceChartInit);
  docReady(contactsCreatedChartInit);
  docReady(newUsersChartsInit);
  docReady(newLeadsChartsInit);
  docReady(addClicksChartInit);
  docReady(echartsLeadConversiontInit);
  docReady(echartsRevenueTargetInit);

}));
//# sourceMappingURL=crm-dashboard.js.map

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

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const emailCampaignReportsChartInit = () => {
    const { getColor, getData, toggleColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-email-campaign-report');

    const tooltipFormatter = params => {
      const el = params[1];

      const tooltipItem = `<div class='ms-1'>
          <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
            el.borderColor ? el.borderColor : el.color
          }"></span>
            ${el.axisValue} : ${
      typeof el.value === 'object' ? el.value[1] : el.value
    }
          </h6>
        </div>`;

      return `<div>
              <p class='mb-2 text-body-tertiary'>
                ${el.seriesName}
              </p>
              ${tooltipItem}
            </div>`;
    };

    const data1 = [0, 1466, 966, 0];

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
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'category',
          data: ['Total Emails', 'Sent', 'Bounce', 'Delivered'],
          splitLine: { show: false },
          axisLabel: {
            color: getColor('body-color'),
            fontFamily: 'Nunito Sans',
            fontWeight: 400,
            fontSize: 12.8,
            margin: 24,
            rotate: 30
            // formatter: value => `${value.slice(0, 5)}...`,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('tertiary-bg')
            }
          },
          axisTick: false
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLabel: {
            color: getColor('body-color'),
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12.8,
            margin: 24
            // formatter: value => value / 1000,
          },
          interval: 500
        },
        series: [
          {
            name: 'Placeholder',
            type: 'bar',
            barWidth: '64px',
            stack: 'Total',
            // backgroundColor: getColor('success'),
            label: {
              show: false
            },
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            },
            emphasis: {
              itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
              }
            },
            data: data1
          },
          {
            name: 'Email Campaign',
            type: 'bar',
            stack: 'Total',
            itemStyle: {
              // color: getColor('primary-lighter')
              color: toggleColor(
                getColor('primary-lighter'),
                getColor('primary-darker')
              )
            },
            data: [
              {
                value: 2832,
                itemStyle: {
                  color: toggleColor(
                    getColor('primary-light'),
                    getColor('primary-dark')
                  )
                }
              },
              1366,
              500,
              966
            ],
            label: {
              show: true,
              position: 'inside',
              color: getColor('dark'),
              fontWeight: 'normal',
              fontSize: '12.8px',
              formatter: value => `${value.value.toLocaleString()}`
            }
          }
        ],
        grid: {
          right: '0',
          left: 6,
          bottom: 10,
          top: '5%',
          containLabel: true
        },
        animation: false
      });

      const responsiveOptions = {
        xs: {
          series: [
            {
              barWidth: '48px'
            }
          ],
          xAxis: {
            axisLabel: {
              show: true,
              formatter: value => `${value.slice(0, 5)}...`
            }
          }
        },
        sm: {
          series: [
            {
              barWidth: '64px'
            }
          ],
          xAxis: {
            axisLabel: {
              show: true,
              formatter: value => `${value.slice(0, 11)}`,
              rotate: 0
            }
          }
        },
        md: {
          series: [
            {
              barWidth: '56px'
            }
          ],
          xAxis: {
            axisLabel: {
              show: false
            }
          }
        },
        lg: {
          series: [
            {
              barWidth: '64px'
            }
          ],
          xAxis: {
            axisLabel: {
              show: true,
              formatter: value => `${value.slice(0, 11)}`
            }
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

  const socialMarketingRadarChartInit = () => {
    const { getColor, getData, rgbaColor, toggleColor } = window.phoenix.utils;
    const $leadConversionChartEl = document.querySelector(
      '.echart-social-marketing-radar'
    );
    if ($leadConversionChartEl) {
      const userOptions = getData($leadConversionChartEl, 'echarts');
      const chart = echarts.init($leadConversionChartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary-light'), getColor('warning-light')],
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: {
            color: getColor('body-color'),
            fontSize: 12.8,
            fontFamily: 'Nunito Sans'
          },
          borderWidth: 1,
          transitionDuration: 0,
          extraCssText: 'z-index: 1000'
          // formatter: getformatter
        },
        radar: {
          splitNumber: 5,
          axisNameGap: 10,
          radius: '87%',
          // center: ['45%', '50%'],
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              shadowBlur: 0.5,
              color: [
                toggleColor(
                  getColor('body-highlight-bg'),
                  getColor('body-highlight-bg')
                ),
                toggleColor(getColor('body-bg'), getColor('secondary-bg'))
              ]
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          name: {
            textStyle: {
              color: getColor('tertiary-color'),
              fontWeight: 800,
              fontSize: 10.2
            }
          },
          indicator: [
            { name: 'SAT', max: 5000 },
            { name: 'FRI', max: 5000 },
            { name: 'THU', max: 5000 },
            { name: 'WED', max: 5000 },
            { name: 'TUE', max: 5000 },
            { name: 'MON', max: 5000 },
            { name: 'SUN', max: 5000 }
          ]
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            symbol: 'emptyCircle',
            symbolSize: 6,

            data: [
              {
                value: [2100, 2300, 1600, 3700, 3000, 2500, 2500],
                name: 'Offline Marketing',
                itemStyle: {
                  color: getColor('primary-light')
                },
                areaStyle: {
                  color: rgbaColor(getColor('primary-light'), 0.3)
                }
              },
              {
                value: [3000, 1600, 3700, 500, 3700, 3000, 3200],
                name: 'Online Marketing',
                areaStyle: {
                  color: rgbaColor(getColor('warning-light'), 0.3)
                },
                itemStyle: {
                  color: getColor('warning-light')
                }
              }
            ]
          }
        ],
        grid: {
          top: 10,
          left: 0
        }
      });

      const responsiveOptions = {
        md: {
          radar: {
            radius: '74%'
          }
        },
        xl: {
          radar: {
            radius: '85%'
          }
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const salesTrendsChartInit = () => {
    const { getColor, getData, getPastDates, rgbaColor, toggleColor } =
      window.phoenix.utils;
    // const phoenixTheme = window.config.config;
    const $chartEl = document.querySelector('.echart-sales-trends');

    const tooltipFormatter = (params, dateFormatter = 'MMM DD') => {
      let tooltipItem = ``;
      params.forEach(el => {
        tooltipItem += `<div class='ms-1'>
          <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10" style="color:${
            el.color
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
                    ? window.dayjs(params[0].axisValue).format('DD MMM, YYYY')
                    : params[0].axisValue
                }
              </p>
              ${tooltipItem}
            </div>`;
    };

    const dates = getPastDates(7);

    const data1 = [2000, 5700, 3700, 5500, 8000, 4000, 5500];
    const data2 = [10500, 9000, 7000, 9000, 10400, 7500, 9300];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary-lighter'), getColor('info-light')],
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
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        // legend: {
        //   left: '76%',
        //   top: 'auto',
        //   icon: 'circle',
        // },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            color: getColor('body-color'),
            formatter: value => window.dayjs(value).format('ddd'),
            fontFamily: 'Nunito Sans',
            fontWeight: 400,
            fontSize: 12.8,
            margin: 16
          },
          axisLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisTick: false
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLabel: {
            color: getColor('body-color'),
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12.8,
            margin: 24,
            formatter: value => `${value / 1000}k`
          }
          // interval: 1000,
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: '16px',
            label: {
              show: false
            },
            itemStyle: {
              color: toggleColor(
                getColor('primary-lighter'),
                getColor('primary')
              ),

              borderRadius: [4, 4, 0, 0]
            },
            data: data2
          },
          {
            name: 'Profit',
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              color: getColor('info-light'),
              borderColor: toggleColor(
                getColor('white'),
                getColor('light-text-emphasis')
              ),
              borderWidth: 2
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
                    color: rgbaColor(getColor('info-light'), 0.2)
                  },
                  {
                    offset: 1,
                    color: rgbaColor(getColor('info-light'), 0.2)
                  }
                ]
              }
            },
            data: data1
          }
        ],
        grid: {
          right: '0',
          left: '0',
          bottom: 0,
          top: 10,
          containLabel: true
        },
        animation: false
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const callCampaignChartInit = () => {
    const { getColor, getData, getPastDates, rgbaColor } = window.phoenix.utils;
    const $chartEl = document.querySelector('.echart-call-campaign');

    const tooltipFormatter = params => {
      let tooltipItem = ``;
      params.forEach(el => {
        tooltipItem += `<div class='ms-1'>
          <h6 class="text-body-tertiary"><span class="fas fa-circle me-1 fs-10 text-primary"></span>
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
                    ? window.dayjs(params[0].axisValue).format('DD MMM, YYYY')
                    : params[0].axisValue
                }
              </p>
              ${tooltipItem}
            </div>`;
    };

    const dates = getPastDates(7);

    const data1 = [8000, 7700, 5900, 10100, 5100, 6000, 4300];

    if ($chartEl) {
      const userOptions = getData($chartEl, 'echarts');
      const chart = window.echarts.init($chartEl);

      const getDefaultOptions = () => ({
        color: [getColor('primary-lighter'), getColor('info-light')],
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
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: [
          {
            type: 'category',
            data: dates,
            boundaryGap: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: getColor('secondary-bg')
              }
            },
            axisLabel: {
              color: getColor('body-color'),
              // interval: 1,
              showMaxLabel: false,
              showMinLabel: true,
              align: 'left',
              formatter: value => window.dayjs(value).format('ddd'),
              fontFamily: 'Nunito Sans',
              fontWeight: 400,
              fontSize: 12.8,
              margin: 16
            },
            axisLine: {
              lineStyle: {
                color: getColor('secondary-bg')
              }
            },
            axisTick: false
          },
          {
            type: 'category',
            data: dates,
            boundaryGap: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: getColor('secondary-bg')
              }
            },
            axisLabel: {
              color: getColor('body-color'),
              interval: 130,
              showMaxLabel: true,
              showMinLabel: false,
              align: 'right',
              formatter: value => window.dayjs(value).format('ddd'),
              fontFamily: 'Nunito Sans',
              fontWeight: 400,
              fontSize: 12.8,
              margin: 16
            },
            position: 'bottom',
            axisLine: {
              lineStyle: {
                color: getColor('secondary-bg')
              }
            },
            axisTick: false
          }
        ],
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          splitLine: {
            lineStyle: {
              color: getColor('secondary-bg')
            }
          },
          axisLabel: {
            color: getColor('body-color'),
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12.8,
            margin: 16,
            formatter: value => `${value / 1000}k`
          }
          // interval: 150,
        },
        series: [
          {
            name: 'Campaign',
            type: 'line',
            smooth: 0.4,
            symbolSize: 11,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('primary'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('primary')
            },
            symbol: 'circle',
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
                    color: rgbaColor(getColor('primary-light'), 0.2)
                  },
                  {
                    offset: 1,
                    color: rgbaColor(getColor('primary-light'), 0.2)
                  }
                ]
              }
            },
            data: data1
          }
        ],
        grid: {
          right: '8',
          left: 6,
          bottom: '-10',
          top: 10,
          containLabel: true
        },
        animation: false
      });

      const responsiveOptions = {
        xs: {
          xAxis: [
            {},
            {
              axisLabel: {
                showMaxLabel: false
              }
            }
          ]
        },
        sm: {
          xAxis: [
            {},
            {
              axisLabel: {
                showMaxLabel: true
              }
            }
          ]
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(emailCampaignReportsChartInit);
  docReady(socialMarketingRadarChartInit);
  docReady(salesTrendsChartInit);
  docReady(callCampaignChartInit);

}));
//# sourceMappingURL=crm-analytics.js.map

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

  /* -------------------------------------------------------------------------- */
  /*                     Echart booking value                                 */
  /* -------------------------------------------------------------------------- */

  const bookingValueChartInit = () => {
    const { getColor, getData, getDates } = window.phoenix.utils;
    const $echartBookingValue = document.querySelector('.echart-booking-value');
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
        tooltipItem += `<h6 class="fs-9 ${
        index > 0 && 'mb-0'
      }"><span class="fas fa-circle me-2" style="color:${el.color}"></span>
      ${el.date.format('MMM DD')} : <span class="fw-normal">${el.value}</span>
    </h6>`;
      });
      return `<div class='ms-1'>
              ${tooltipItem}
            </div>`;
    };

    if ($echartBookingValue) {
      const userOptions = getData($echartBookingValue, 'echarts');
      const chart = window.echarts.init($echartBookingValue);
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
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        xAxis: [
          {
            type: 'category',
            data: getDates(
              new Date('11/1/2023'),
              new Date('11/7/2023'),
              1000 * 60 * 60 * 24
            ),
            show: true,
            boundaryGap: false,
            axisLine: {
              show: true,
              lineStyle: { color: getColor('secondary-bg') }
            },
            axisTick: {
              show: false
            },
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
            data: [150, 100, 300, 200, 250, 180, 250],
            showSymbol: false,
            symbol: 'circle',
            lineStyle: {
              width: 2,
              color: getColor('warning')
            },
            emphasis: {
              lineStyle: {
                color: getColor('warning')
              }
            },
            itemStyle: {
              color: getColor('warning')
            },
            zlevel: 1
          }
        ],
        grid: { left: 5, right: 5, top: 5, bottom: 0 }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                     Echart Bar booking                                 */
  /* -------------------------------------------------------------------------- */
  const { echarts: echarts$2 } = window;

  const bookingsChartInit = () => {
    const { getColor, getData, getPastDates, getItemFromStore, rgbaColor } =
      window.phoenix.utils;
    const $bookingsChart = document.querySelector('.echart-bookings');

    const fullfilledData = [
      [3500, 2500, 2600, 3400, 2300, 3200, 2800, 2800],
      [2736, 3874, 4192, 1948, 3567, 4821, 2315, 3986],
      [2789, 3895, 2147, 4658, 1723, 3210, 4386, 1974]
    ];

    const cencelledData = [
      [-1500, -2700, -1100, -1400, -1600, -1400, -1100, -2700],
      [-3874, -2631, -4422, -1765, -3198, -4910, -2087, -4675],
      [-2789, -3895, -2147, -4658, -1723, -3210, -4386, -1974]
    ];

    if ($bookingsChart) {
      const userOptions = getData($bookingsChart, 'echarts');
      const chart = echarts$2.init($bookingsChart);
      const getDefaultOptions = () => ({
        color: getColor('body-highlight-bg'),
        legend: {
          data: ['Fulfilled', 'Cancelled'],
          itemWidth: 16,
          itemHeight: 16,
          icon: 'circle',
          itemGap: 32,
          left: 0,
          inactiveColor: getColor('quaternary-color'),
          textStyle: {
            color: getColor('secondary-color'),
            fontWeight: 600,
            fontFamily: 'Nunito Sans'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            color: getColor('secondary-text-emphasis'),
            formatter: value => window.dayjs(value).format('MMM DD'),
            fontFamily: 'Nunito Sans',
            fontWeight: 600,
            fontSize: 12.8
          },
          data: getPastDates(8),
          axisLine: {
            lineStyle: {
              color: getColor('border-color-translucent')
            }
          },
          axisTick: false
        },
        yAxis: {
          axisLabel: {
            color: getColor('body-color'),
            formatter: value => `${Math.abs(Math.round(value / 1000))}K`,
            fontWeight: 700,
            fontFamily: 'Nunito Sans'
          },
          splitLine: {
            interval: 10,
            lineStyle: {
              color: getColor('border-color-translucent')
            }
          }
        },
        series: [
          {
            name: 'Fulfilled',
            type: 'bar',
            stack: 'one',
            data: fullfilledData[0],
            barWidth: '27%',
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('info')
                  : getColor('info-light')
            }
          },
          {
            name: 'Cancelled',
            type: 'bar',
            stack: 'one',
            barWidth: '27%',
            data: cencelledData[0],
            itemStyle: {
              borderRadius: [0, 0, 4, 4],
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.5)
                  : getColor('info-lighter')
            }
          }
        ],
        grid: { left: 0, right: 8, top: 52, bottom: 0, containLabel: true }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);

      const bookingSelect = document.querySelector('[data-booking-options]');
      if (bookingSelect) {
        bookingSelect.addEventListener('change', e => {
          const { value } = e.currentTarget;
          const data1 = fullfilledData[value];
          const data2 = cencelledData[value];
          chart.setOption({
            series: [
              {
                data: data1
              },
              {
                data: data2
              }
            ]
          });
        });
      }
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts cancel booking                            */
  /* -------------------------------------------------------------------------- */

  const cancelBookingChartInit = () => {
    const { getColor, getData, getDates, getItemFromStore } =
      window.phoenix.utils;
    const cancelBookingChartEl = document.querySelector('.chart-cancel-booking');

    if (cancelBookingChartEl) {
      const userOptions = getData(cancelBookingChartEl, 'echarts');
      const chart = window.echarts.init(cancelBookingChartEl);

      const getDefaultOptions = () => ({
        color: getColor('primary'),
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          position: (...params) => handleTooltipPosition(params),
          borderWidth: 1,
          transitionDuration: 0,
          formatter: params => {
            return `<strong>${window
            .dayjs(params.name)
            .format('DD MMM')}:</strong> ${params.value}`;
          },
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'category',
          data: getDates(
            new Date('11/1/2023'),
            new Date('11/6/2023'),
            1000 * 60 * 60 * 24
          )
        },
        yAxis: {
          show: false
        },
        series: [
          {
            type: 'bar',
            barWidth: 3,
            data: [120, 150, 100, 120, 110, 160],
            symbol: 'none',
            itemStyle: {
              borderRadius: [0.5, 0.5, 0, 0],
              colos:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('info')
                  : getColor('info-light')
            }
          }
        ],
        grid: { right: 5, left: 0, bottom: 0, top: 0 }
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Echarts commission                            */
  /* -------------------------------------------------------------------------- */

  const { echarts: echarts$1 } = window;

  const commissionChartInit = () => {
    const { getData, getColor } = window.phoenix.utils;
    const $echartCommission = document.querySelector('.echart-commission');

    if ($echartCommission) {
      const userOptions = getData($echartCommission, 'options');
      const chart = echarts$1.init($echartCommission);

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
        series: [
          {
            type: 'gauge',
            name: 'Commission',
            startAngle: 90,
            endAngle: -270,
            radius: '90%',
            pointer: {
              show: false
            },
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
                width: 3,
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
            data: [
              {
                value: 70
              }
            ],
            detail: {
              show: false
            }
          }
        ]
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts cancel booking                            */
  /* -------------------------------------------------------------------------- */

  const countryWiseVisitorsChartInit = () => {
    const { getColor, getData, getRandomNumber, getItemFromStore } =
      window.phoenix.utils;
    const countryWiseVisitorsChartEl = document.querySelector(
      '.echart-country-wise-visitors'
    );

    const data = [
      127, 156, 183, 110, 195, 129, 176, 147, 163, 199, 158, 115, 191, 105, 143,
      179, 120, 168, 137, 185, 154, 122, 197, 112, 144, 170, 193, 118, 166, 151,
      187, 134, 162, 107, 192, 152, 114, 198
    ];
    const axisData = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38
    ];

    const tooltipFormatter = params => `
    <div>
        <h6 class="fs-9 text-700 mb-0"><span class="fas fa-circle me-1 text-primary-light"></span>
          Users : <span class="fw-normal">${params[0].value}</span>
        </h6>
    </div>
    `;

    if (countryWiseVisitorsChartEl) {
      const userOptions = getData(countryWiseVisitorsChartEl, 'echarts');
      const chart = window.echarts.init(countryWiseVisitorsChartEl);

      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          padding: [7, 10],
          axisPointer: {
            type: 'none'
          },
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          position(pos, params, dom, rect, size) {
            return handleTooltipPosition(pos);
          },
          formatter: tooltipFormatter,
          extraCssText: 'z-index: 1000'
        },
        xAxis: {
          type: 'category',

          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          boundaryGap: [0.2, 0.2],
          data: axisData
        },
        yAxis: {
          type: 'value',
          scale: true,
          boundaryGap: false,
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false
          },
          min: 100,
          max: 200
        },
        series: [
          {
            type: 'bar',
            barMaxWidth: 8,
            barGap: 5,
            data,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('primary')
                  : getColor('primary-light'),
              borderRadius: [2, 2, 0, 0]
            }
          }
        ],
        grid: {
          right: 0,
          left: 0,
          bottom: 0,
          top: 0
        }
      });

      echartSetOption(chart, userOptions, getDefaultOptions);

      const userCounterDom = document.querySelector('.real-time-user');

      setInterval(() => {
        const rndData = getRandomNumber(130, 200);
        data.shift();
        data.push(rndData);
        axisData.shift();
        axisData.push(getRandomNumber(37, 100));
        userCounterDom.innerHTML = rndData;

        chart.setOption({
          xAxis: {
            data: axisData
          },
          series: [
            {
              data
            }
          ]
        });
      }, 2000);
    }
  };

  // dayjs.extend(advancedFormat);

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Financial Activities                            */
  /* -------------------------------------------------------------------------- */

  const financialActivitiesChartInit = () => {
    const { getColor, getData, getItemFromStore } = window.phoenix.utils;
    const $financialActivitiesChartEl = document.querySelector(
      '.echart-financial-Activities'
    );

    const profitData = [
      [350000, 390000, 410700, 450000, 390000, 410700],
      [245000, 310000, 420000, 480000, 530000, 580000],
      [278450, 513220, 359890, 444567, 201345, 589000]
    ];
    const revenueData = [
      [-810000, -640000, -630000, -590000, -620000, -780000],
      [-482310, -726590, -589120, -674832, -811245, -455678],
      [-432567, -688921, -517389, -759234, -601876, -485112]
    ];
    const expansesData = [
      [-450000, -250000, -200000, -120000, -230000, -270000],
      [-243567, -156789, -398234, -120456, -321890, -465678],
      [-235678, -142345, -398765, -287456, -173890, -451234]
    ];

    if ($financialActivitiesChartEl) {
      const userOptions = getData($financialActivitiesChartEl, 'options');
      const chart = window.echarts.init($financialActivitiesChartEl);
      const profitLagend = document.querySelector(`#${userOptions.optionOne}`);
      const revenueLagend = document.querySelector(`#${userOptions.optionTwo}`);
      const expansesLagend = document.querySelector(
        `#${userOptions.optionThree}`
      );

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
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params),
          extraCssText: 'z-index: 1000'
        },
        legend: {
          data: ['Profit', 'Revenue', 'Expanses'],
          show: false
        },
        xAxis: {
          axisLabel: {
            show: true,
            margin: 12,
            color: getColor('secondary-text-emphasis'),
            formatter: value =>
              `${Math.abs(Math.round((value / 1000) * 10) / 10)}k`,
            fontFamily: 'Nunito Sans',
            fontWeight: 700
          },
          splitLine: {
            lineStyle: {
              color: getColor('border-color-translucent')
            }
          }
        },
        yAxis: {
          axisTick: {
            show: false
          },
          data: [
            'NOV-DEC',
            'SEP-OCT',
            'JUL-AUG',
            'MAY-JUN',
            'MAR-APR',
            'JAN-FEB'
          ],
          axisLabel: {
            color: getColor('secondary-text-emphasis'),
            margin: 8,
            fontFamily: 'Nunito Sans',
            fontWeight: 700
          },
          axisLine: {
            lineStyle: {
              color: getColor('border-color-translucent')
            }
          }
        },
        series: [
          {
            name: 'Profit',
            stack: 'Total',
            type: 'bar',
            barWidth: 8,
            roundCap: true,
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('primary')
                  : getColor('primary-light')
            },
            data: profitData[0]
          },
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: 8,
            barGap: '100%',
            stack: 'Total',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: [4, 0, 0, 4],
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('success')
                  : getColor('success-light')
            },
            data: revenueData[0]
          },
          {
            name: 'Expanses',
            type: 'bar',
            barWidth: 8,
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: [4, 0, 0, 4],
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? getColor('info')
                  : getColor('info-light')
            },
            data: expansesData[0]
          }
        ],
        grid: {
          right: 20,
          left: 3,
          bottom: 0,
          top: 16,
          containLabel: true
        },
        animation: false
      });

      const responsiveOptions = {
        xs: {
          yAxis: {
            axisLabel: {
              show: false
            }
          },
          grid: {
            left: 15
          }
        },
        sm: {
          yAxis: {
            axisLabel: {
              margin: 32,
              show: true
            }
          },
          grid: {
            left: 3
          }
        },
        xl: {
          yAxis: {
            axisLabel: {
              show: false
            }
          },
          grid: {
            left: 15
          }
        },
        xxl: {
          yAxis: {
            axisLabel: {
              show: true
            }
          },
          grid: {
            left: 3
          }
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);

      profitLagend.addEventListener('click', () => {
        profitLagend.classList.toggle('opacity-50');
        chart.dispatchAction({
          type: 'legendToggleSelect',
          name: 'Profit'
        });
      });

      revenueLagend.addEventListener('click', () => {
        revenueLagend.classList.toggle('opacity-50');
        chart.dispatchAction({
          type: 'legendToggleSelect',
          name: 'Revenue'
        });
      });

      expansesLagend.addEventListener('click', () => {
        expansesLagend.classList.toggle('opacity-50');
        chart.dispatchAction({
          type: 'legendToggleSelect',
          name: 'Expanses'
        });
      });

      const cetegorySelect = document.querySelector('[data-activities-options]');
      if (cetegorySelect) {
        cetegorySelect.addEventListener('change', e => {
          const { value } = e.currentTarget;
          const data1 = profitData[value];
          const data2 = revenueData[value];
          const data3 = expansesData[value];
          chart.setOption({
            series: [
              {
                data: data1
              },
              {
                data: data2
              },
              {
                data: data3
              }
            ]
          });
        });
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                     Echart Bar booking                                 */
  /* -------------------------------------------------------------------------- */
  const { echarts } = window;

  const grossProfitInit = () => {
    const { getColor, getData, rgbaColor, getItemFromStore } =
      window.phoenix.utils;
    const $grossProfit = document.querySelector('.echart-gross-profit');

    const data = [
      {
        name: 'Flight',
        value: 30,
        itemStyle: {
          color:
            getItemFromStore('phoenixTheme') === 'dark'
              ? getColor('primary')
              : getColor('primary-light')
        },
        children: [
          {
            name: '1st class',
            value: 5,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('primary'), 0.8)
                  : rgbaColor(getColor('primary-light'), 0.7)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: getColor('primary-dark')
                }
              }
            ]
          },
          {
            name: 'Business',
            value: 15,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('primary'), 0.7)
                  : rgbaColor(getColor('primary-light'), 0.5)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('primary-dark'), 0.9)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('primary-dark'), 0.8)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('primary-dark'), 0.7)
                }
              }
            ]
          },
          {
            name: 'Economy',
            value: 10,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('primary'), 0.6)
                  : rgbaColor(getColor('primary-light'), 0.3)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('primary-dark'), 0.6)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('primary-dark'), 0.5)
                }
              }
            ]
          }
        ]
      },
      {
        name: 'Package',
        value: 50,
        itemStyle: {
          color:
            getItemFromStore('phoenixTheme') === 'dark'
              ? getColor('info')
              : getColor('info-light')
        },
        children: [
          {
            name: 'Flight + Hotel',
            value: 5,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.4)
                  : rgbaColor(getColor('info-light'), 0.3)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.2)
                }
              }
            ]
          },
          {
            name: 'Flight + Event',
            value: 20,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.5)
                  : rgbaColor(getColor('info-light'), 0.4)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.3)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.4)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.5)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.6)
                }
              }
            ]
          },
          {
            name: 'Flight + Hotel + Event',
            value: 10,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.6)
                  : rgbaColor(getColor('info-light'), 0.55)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.66)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.7)
                }
              }
            ]
          },
          {
            name: 'Hotel + Event',
            value: 5,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.7)
                  : rgbaColor(getColor('info-light'), 0.75)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.8)
                }
              }
            ]
          },
          {
            name: 'Custom',
            value: 10,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('info'), 0.8)
                  : rgbaColor(getColor('info-light'), 0.9)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('info-dark'), 0.9)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: getColor('info-dark')
                }
              }
            ]
          }
        ]
      },
      {
        name: 'Hotel',
        value: 25,
        itemStyle: {
          color:
            getItemFromStore('phoenixTheme') === 'dark'
              ? getColor('success')
              : getColor('success-light')
        },
        children: [
          {
            name: 'Rooms',
            value: 10,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('success'), 0.8)
                  : rgbaColor(getColor('success-light'), 0.9)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: getColor('success-dark')
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('success-dark'), 0.88)
                }
              }
            ]
          },
          {
            name: 'Resorts',
            value: 15,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('success'), 0.7)
                  : rgbaColor(getColor('success-light'), 0.5)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('success-dark'), 0.77)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('success-dark'), 0.66)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('success-dark'), 0.55)
                }
              }
            ]
          }
        ]
      },
      {
        name: 'Trip',
        value: 15,
        itemStyle: {
          color:
            getItemFromStore('phoenixTheme') === 'dark'
              ? getColor('warning')
              : getColor('warning-light')
        },
        children: [
          {
            name: 'Nature',
            value: 5,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('warning'), 0.8)
                  : rgbaColor(getColor('warning-light'), 0.8)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: getColor('warning-dark')
                }
              }
            ]
          },
          {
            name: 'Events',
            value: 10,
            itemStyle: {
              color:
                getItemFromStore('phoenixTheme') === 'dark'
                  ? rgbaColor(getColor('warning'), 0.7)
                  : rgbaColor(getColor('warning-light'), 0.5)
            },
            children: [
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('warning-dark'), 0.7)
                }
              },
              {
                name: 'label-3',
                value: 5,
                itemStyle: {
                  color: rgbaColor(getColor('warning-dark'), 0.5)
                }
              }
            ]
          }
        ]
      }
    ];

    const colors = [
      getColor('primary-light'),
      getColor('info-light'),
      getColor('success-light'),
      getColor('warning-light')
    ];

    if ($grossProfit) {
      const userOptions = getData($grossProfit, 'echarts');
      const chart = echarts.init($grossProfit);
      const getDefaultOptions = () => ({
        color: colors,
        tooltip: {
          trigger: 'item',
          padding: [7, 10],
          backgroundColor: getColor('body-highlight-bg'),
          borderColor: getColor('border-color'),
          textStyle: { color: getColor('light-text-emphasis') },
          borderWidth: 1,
          transitionDuration: 0,
          extraCssText: 'z-index: 1000'
        },
        series: [
          {
            type: 'sunburst',
            center: ['50%', '50%'],
            data,
            sort(a, b) {
              if (a.depth === 1) {
                return b.getValue() - a.getValue();
              }
              return a.dataIndex - b.dataIndex;
            },
            label: {
              show: false
            },
            levels: [
              {},
              {
                r0: 0,
                r: 53,
                itemStyle: {
                  borderWidth: 2,
                  borderColor: getColor('body-bg')
                },
                label: {
                  show: false
                },
                blur: {
                  itemStyle: {
                    borderWidth: 6.5
                  }
                }
              },
              {
                r0: 65,
                r: 110,
                itemStyle: {
                  borderWidth: 2,
                  borderColor: getColor('body-bg')
                },
                label: {
                  show: false
                }
              },
              {
                r0: 120,
                r: 125,
                itemStyle: {
                  borderWidth: 2,
                  borderColor: getColor('body-bg')
                },
                label: {
                  show: false
                }
              }
            ]
          }
        ]
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  const holidaysNextMonthChartInit = () => {
    const { getColor, getData, getItemFromStore, rgbaColor } =
      window.phoenix.utils;
    const $holidaysNextMonthchartEl = document.querySelector(
      '.echart-holidays-next-month'
    );
    const { echarts } = window;
    const numbers = [
      84, 572, 193, 427, 649, 318, 765, 112, 490, 231, 674, 815, 447, 56, 903,
      178, 629, 394, 742, 295, 518, 67, 936, 129, 681, 862, 410, 553, 268, 719,
      42, 589, 334, 786, 155, 607, 878, 525, 449, 206, 659, 99, 472, 724, 261,
      834, 389, 613, 157, 702, 451, 82, 545, 293, 736, 870, 104, 681, 321, 574,
      136, 689, 840, 470, 127, 598, 354, 807, 215, 767, 498, 51, 904, 176, 629,
      389, 731, 268, 611, 155, 702, 453, 82, 537, 294, 747, 881, 109, 662, 405,
      858, 515, 47, 936, 189, 641, 312, 764, 236, 579, 135, 688, 429, 71, 624,
      370, 822, 173, 725, 476, 29, 880, 125, 677, 338, 791, 216, 568, 115, 666,
      409, 861, 502, 44, 907, 160, 612, 374, 826, 279, 731, 182, 735, 478, 27,
      879, 120, 672, 335, 788, 227, 580, 123, 676, 421, 74, 627, 381, 834, 185,
      738, 489, 32, 885, 128, 681, 342, 794, 245, 598, 137, 690, 433, 76, 629,
      380, 832, 194, 747, 498, 41, 894, 142, 695, 346, 799, 250, 603, 108, 661,
      414, 867, 508, 59, 912, 165, 616, 369, 821, 282, 735, 179, 732, 474, 26,
      879, 124, 676, 329, 782, 233, 586, 118, 671, 414, 867, 299, 651, 156, 708,
      453, 100, 553, 304, 757, 901, 145, 697, 448, 96, 549, 300, 753, 896, 149,
      701, 452, 105, 558, 309, 762, 907, 161, 713, 464, 73, 526, 277, 730, 875,
      122, 575, 326, 779, 924, 171, 724, 475, 28, 831, 184, 737, 882, 129, 582,
      333, 786, 930, 176, 729, 480, 35, 838, 191, 744, 889, 136, 589, 340, 793,
      936, 183, 736, 487, 42, 845, 198, 751, 896, 143, 596, 347, 800, 945, 190,
      743, 498, 49, 852, 205, 758, 903, 150, 603, 354, 807, 952, 197, 750, 505,
      56, 859, 212, 765, 910, 157, 610, 361, 814, 959, 204, 757, 512, 63, 866,
      219, 772, 917, 164, 617, 368, 821, 966, 211, 764, 519, 70, 873, 226, 779,
      924, 171, 724, 475, 28, 831, 184, 737, 882, 129, 582, 333, 786, 930, 176,
      729, 480, 35, 838, 191, 744, 889, 136, 589, 340, 793, 936, 183, 736, 487,
      42, 845, 198, 751, 896, 143, 596, 347, 800, 945, 190, 743, 498, 49, 852,
      205, 758, 903, 150, 603, 354, 807, 952, 197, 750, 505, 56, 859, 212, 765,
      910, 157, 610, 361, 814, 959, 204, 757, 512, 63, 866, 219, 772, 917, 164,
      617, 368, 821, 966, 211, 764, 519, 70, 873, 226, 779, 924, 171, 724, 475,
      28, 831, 184, 737, 882, 129, 582, 333, 786, 930, 176, 729, 480, 35, 838,
      191, 744, 889, 136, 589, 340, 793, 936, 183, 736, 487, 42, 845, 198, 751,
      896, 143, 596, 347, 800, 945, 190, 743, 498, 49, 852, 205, 758, 903, 150,
      603, 354, 807, 952, 197, 750, 505, 56, 859, 212, 765, 910, 157, 610, 361,
      814, 959, 204, 757, 512, 63, 866, 219, 772, 917, 164, 617, 368, 821, 966,
      211, 764, 519, 70, 873, 226, 779, 924, 171, 724, 475, 28, 831
    ];
    function getVirtualData(year) {
      const date = +echarts.time.parse(`${year}-01-01`);
      const end = +echarts.time.parse(`${+year + 1}-01-01`);
      const dayTime = 3600 * 24 * 1000;
      const data = [];
      let index = 0;
      for (let time = date; time < end; time += dayTime) {
        data.push([
          echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
          numbers[index]
        ]);
        index += 1;
      }
      return data;
    }

    if ($holidaysNextMonthchartEl) {
      const userOptions = getData($holidaysNextMonthchartEl, 'echarts');
      const chart = window.echarts.init($holidaysNextMonthchartEl);
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
          extraCssText: 'z-index: 1000'
        },
        visualMap: {
          min: 0,
          max: 1000,
          calculable: true,
          show: false,
          color: [
            getColor('warning'),
            // getColor('warning-light'),
            getItemFromStore('phoenixTheme') === 'dark'
              ? rgbaColor(getColor('warning'), 0.5)
              : getColor('warning-light'),
            // getColor('warning-lighter')
            getItemFromStore('phoenixTheme') === 'dark'
              ? rgbaColor(getColor('warning'), 0.75)
              : getColor('warning-light')
          ]
        },
        calendar: {
          orient: 'vertical',
          range: '2017-03',
          width: '99%',
          height: '85.5%',
          left: '2',
          right: 'auto',
          top: 42,
          yearLabel: {
            show: false
          },
          monthLabel: {
            show: false
          },
          dayLabel: {
            firstDay: 0,
            nameMap: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            margin: 24,
            color: getColor('secondary-text-emphasis'),
            fontFamily: 'Nunito Sans',
            fontWeight: 700
          },
          splitLine: {
            show: false
          },
          itemStyle: {
            color: getColor('dark-text-emphasis'),
            borderColor: getColor('border-color')
          }
        },
        series: {
          type: 'scatter',
          coordinateSystem: 'calendar',
          symbolSize(val) {
            return val[1] / 35;
          },
          data: getVirtualData('2017'),
          itemStyle: {
            color: getColor('warning'),
            opacity: 0.8
          }
        }
      });

      const responsiveOptions = {
        xl: {
          calendar: {
            height: '83%'
          }
        },
        xxl: {
          calendar: {
            height: '85.5%'
          }
        }
      };

      echartSetOption(chart, userOptions, getDefaultOptions, responsiveOptions);
    }
  };

  /* -------------------------------------------------------------------------- */

  /* --------------------------------- Colors --------------------------------- */

  const getColor = (name, dom = document.documentElement) => {
    return getComputedStyle(dom).getPropertyValue(`--phoenix-${name}`).trim();
  };

  /* ---------------------------------- Store --------------------------------- */

  const getItemFromStore = (key, defaultValue, store = localStorage) => {
    try {
      return JSON.parse(store.getItem(key)) || defaultValue;
    } catch {
      return store.getItem(key) || defaultValue;
    }
  };

  const flightMapInit = () => {
    const flightMap = document.querySelector('#flightMap');
    if (flightMap) {
      window.mapboxgl.accessToken =
        'pk.eyJ1IjoidGhlbWV3YWdvbiIsImEiOiJjbGhmNW5ybzkxcmoxM2RvN2RmbW1nZW90In0.hGIvQ890TYkZ948MVrsMIQ';

      const zoomIn = document.querySelector('.zoomIn');
      const zoomOut = document.querySelector('.zoomOut');
      const fullScreen = document.querySelector('.fullScreen');

      const styles = {
        default: 'mapbox://styles/mapbox/light-v11',
        light: 'mapbox://styles/themewagon/clj57pads001701qo25756jtw',
        dark: 'mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew'
      };

      const map = new window.mapboxgl.Map({
        container: 'flightMap',
        style: styles[window.config.config.phoenixTheme],
        center: [-73.102712, 7.102257],
        zoom: 5,
        pitch: 40,
        attributionControl: false
      });

      zoomIn.addEventListener('click', () => map.zoomIn());
      zoomOut.addEventListener('click', () => map.zoomOut());
      fullScreen.addEventListener('click', () =>
        map.getContainer().requestFullscreen()
      );

      const origin = [-61.100583, 5.044713];
      const currentPosition = [-74.2139449434892, 8.136553550752552];
      const destination = [-84.913785, 10.325774];

      const originToCurrentRoute = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [origin, currentPosition]
            }
          }
        ]
      };
      const currentToDestinationRoute = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [currentPosition, destination]
            }
          }
        ]
      };

      const points = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: origin
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: currentPosition
            }
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: destination
            }
          }
        ]
      };

      let count = 1;
      points.features.forEach(feature => {
        const el = document.createElement('div');
        el.className = `marker-${count}`;
        new window.mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
        count += 1;
      });

      const lineDistance = window.turf.length(originToCurrentRoute.features[0]);
      const lineDistance2 = window.turf.length(originToCurrentRoute.features[0]);

      const arc = [];
      const arc2 = [];

      const steps = 500;

      for (let i = 0; i < lineDistance; i += lineDistance / steps) {
        const segment = window.turf.along(originToCurrentRoute.features[0], i);
        arc.push(segment.geometry.coordinates);
      }
      for (let i = 0; i < lineDistance2; i += lineDistance2 / steps) {
        const segment = window.turf.along(
          currentToDestinationRoute.features[0],
          i
        );
        arc2.push(segment.geometry.coordinates);
      }

      originToCurrentRoute.features[0].geometry.coordinates = arc;
      currentToDestinationRoute.features[0].geometry.coordinates = arc2;

      map.on('load', () => {
        map.addSource('route', {
          type: 'geojson',
          data: originToCurrentRoute.features[0]
        });
        map.addSource('route2', {
          type: 'geojson',
          data: currentToDestinationRoute.features[0]
        });

        map.addLayer({
          id: 'route',
          source: 'route',
          type: 'line',
          paint: {
            'line-width': 2,
            'line-color':
              getItemFromStore('phoenixTheme') === 'dark'
                ? getColor('primary')
                : getColor('primary-light')
          }
        });
        map.addLayer({
          id: 'route2',
          source: 'route2',
          type: 'line',
          paint: {
            'line-width': 1,
            'line-color': getColor('warning')
          }
        });
      });
    }
  };

  const themeController = document.body;
  if (themeController) {
    themeController.addEventListener('clickControl', () => {
      flightMapInit();
    });
  }

  const { docReady } = window.phoenix.utils;

  docReady(bookingValueChartInit);
  docReady(commissionChartInit);
  docReady(cancelBookingChartInit);
  docReady(countryWiseVisitorsChartInit);
  docReady(financialActivitiesChartInit);
  docReady(holidaysNextMonthChartInit);
  docReady(bookingsChartInit);
  docReady(grossProfitInit);
  docReady(flightMapInit);

}));
//# sourceMappingURL=travel-agency-dashboard.js.map

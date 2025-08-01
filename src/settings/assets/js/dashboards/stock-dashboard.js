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

  /* eslint-disable no-new */

  /* -------------------------------------------------------------------------- */
  /*                            ChartJs Initialization                          */
  /* -------------------------------------------------------------------------- */

  const chartJsInit = (chartEl, config) => {
    if (!chartEl) return;

    const ctx = chartEl.getContext('2d');
    if (ctx) {
      let chart = new window.Chart(ctx, config());

      const themeController = document.body;
      themeController.addEventListener(
        'clickControl',
        ({ detail: { control } }) => {
          if (control === 'phoenixTheme') {
            chart.destroy();
            chart = new window.Chart(ctx, config());
          }
          return null;
        }
      );
    }
  };

  const getOrCreateTooltip = chart => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add('custom-tooltip');
      tooltipEl.classList.add('bg-body');
      tooltipEl.classList.add('border');
      tooltipEl.style.borderRadius = '4px';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.padding = '14px';
      tooltipEl.style.fontSize = '12px';
      tooltipEl.style.minWidth = '170px';
      tooltipEl.style.zIndex = '9999';

      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context, data) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    if (tooltip.body) {
      const params = tooltip.dataPoints;

      tooltipEl.innerHTML = `
      <div class="fs-9 text-body-secondary">
        <table class="mb-2">
          <tbody>
            <tr>
              <th class="fw-bold" style="width: 72px">Price</th>
              <th class="text-center px-2 fw-semibold">:</th>
              <th class="fw-semibold">${params[0].formattedValue} USD</th>
            </tr>
          </tbody>
        </table>
        <div class="border-top pt-2">
          <table>
            <tbody>
              <tr>
                <th class="fw-bold" style="width: 72px">Date</th>
                <th class="text-center px-2 fw-semibold">:</th>
                <th class="fw-semibold">${window
                  .dayjs(data.date, 'YYYY-MM-DD')
                  .format('D MMM')}</th>
              </tr>
              <tr>
                <th class="fw-bold" style="width: 72px">Time</th>
                <th class="text-center px-2 fw-semibold">:</th>
                <th class="fw-semibold">${params[0].label}</th>
              </tr>
              <tr>
                <th class="fw-bold" style="width: 72px">Time Zone</th>
                <th class="text-center px-2 fw-semibold">:</th>
                <th class="fw-semibold">UTC 4</th>
              </tr>
              <tr>
                <th class="fw-bold" style="width: 72px">Volume</th>
                <th class="text-center px-2 fw-semibold">:</th>
                <th class="fw-semibold">${data.volume}k</th>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
    `;
    }

    const {
      offsetLeft: positionX,
      offsetTop: positionY,
      clientWidth
    } = chart.canvas;
    const tooltipWidth = tooltipEl.clientWidth;
    const tooltipX = tooltip.caretX;
    let leftPosition = positionX + tooltipX;
    if (leftPosition + tooltipWidth > clientWidth) {
      leftPosition -= tooltipWidth;
      tooltipEl.style.transform = 'translate(0, 0)';
    } else if (leftPosition < positionX + 100) {
      leftPosition = positionX + 10;
      tooltipEl.style.transform = 'translate(0, 0)';
    } else {
      tooltipEl.style.transform = 'translate(-50%, 0)';
    }

    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = `${leftPosition}px`;
    tooltipEl.style.top = `${positionY + tooltip.caretY}px`;
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = `${tooltip.options.padding}px ${tooltip.options.padding}px`;
  };

  const verticalLinePlugin = {
    id: 'verticalDottedLine',
    beforeDraw: chart => {
      const { getItemFromStore } = window.phoenix.utils;
      if (
        chart.tooltip &&
        // eslint-disable-next-line no-underscore-dangle
        chart.tooltip._active &&
        // eslint-disable-next-line no-underscore-dangle
        chart.tooltip._active.length
      ) {
        const { ctx } = chart;
        // eslint-disable-next-line no-underscore-dangle
        const activePoint = chart.tooltip._active[0];
        const { x } = activePoint.element;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle =
          getItemFromStore('phoenixTheme') === 'dark' ? '#31374a' : '#CBD0DD';
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const borderXPlugin = {
    id: 'borderEndLine',
    beforeDraw: chart => {
      const { getItemFromStore } = window.phoenix.utils;

      const {
        ctx,
        chartArea: { top, bottom, left, right }
      } = chart;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle =
        getItemFromStore('phoenixTheme') === 'dark'
          ? 'rgba(55, 62, 83, 0.78)'
          : '#E3E6ED';
      ctx.beginPath();

      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.stroke();
    }
  };

  const topStockChartData = {
    apple: {
      color: 'success',
      data: [
        ['2013/10/9', '10 AM', 275, 94.2],
        ['2013/10/9', '10:15 AM', 250, 92.5],
        ['2013/10/9', '10:30 AM', 230, 95.3],
        ['2013/10/9', '10:45 AM', 200, 85.4],
        ['2013/10/9', '11 AM', 190, 102.4],
        ['2013/10/9', '11:15 AM', 220, 84.5],
        ['2013/10/9', '11:30 AM', 230, 74.5],
        ['2013/10/9', '11:45 AM', 240, 53.5],
        ['2013/10/9', '12 PM', 240, 98.5],
        ['2013/10/9', '12:15 PM', 180, 69.5],
        ['2013/10/9', '12:30 PM', 200, 85.9],
        ['2013/10/9', '12:45 PM', 230, 95.3],
        ['2013/10/9', '1 PM', 230, 95.3],
        ['2013/10/9', '1:15 PM', 278, 98.5],
        ['2013/10/9', '1:30 PM', 220, 92.2],
        ['2013/10/9', '1:45 PM', 200, 85.4],
        ['2013/10/9', '2 PM', 200, 85.9],
        ['2013/10/9', '2:15 PM', 230, 95.0],
        ['2013/10/9', '2:30 PM', 250, 98.1],
        ['2013/10/9', '2:45 PM', 190, 84.4],
        ['2013/10/9', '3 PM', 260, 105.2],
        ['2013/10/9', '3:15 PM', 200, 89.3],
        ['2013/10/9', '3:30 PM', 185, 76.4],
        ['2013/10/9', '3:45 PM', 230, 92.6],
        ['2013/10/9', '4 PM', 265, 102.8],
        ['2013/10/9', '4:15 PM', 265, 110.5],
        ['2013/10/9', '4:30 PM', 190, 84.1],
        ['2013/10/9', '4:45 PM', 180, 76.0],
        ['2013/10/9', '5 PM', 220, 95.3],
        ['2013/10/9', '5:15 PM', 200, 89.5],
        ['2013/10/9', '5:30 PM', 272, 101.2],
        ['2013/10/9', '5:45 PM', 240, 98.7],
        ['2013/10/9', '6 PM', 230, 95.9],
        ['2013/10/9', '6:15 PM', 190, 83.2],
        ['2013/10/9', '6:30 PM', 260, 104.3],
        ['2013/10/9', '6:45 PM', 220, 92.4],
        ['2013/10/9', '7 PM', 200, 86.1],
        ['2013/10/9', '7:15 PM', 250, 101.0],
        ['2013/10/9', '7:30 PM', 230, 95.3],
        ['2013/10/9', '7:45 PM', 190, 82.5],
        ['2013/10/9', '8 PM', 220, 91.4],
        ['2013/10/9', '8:15 PM', 260, 104.6],
        ['2013/10/9', '8:30 PM', 190, 82.3],
        ['2013/10/9', '8:45 PM', 200, 86.0],
        ['2013/10/9', '9 PM', 250, 101.5],
        ['2013/10/9', '9:15 PM', 180, 74.8],
        ['2013/10/9', '9:30 PM', 258, 95.2],
        ['2013/10/9', '9:45 PM', 258, 91.0],
        ['2013/10/9', '10 PM', 190, 83.7],
        ['2013/10/9', '10:15 PM', 240, 97.4],
        ['2013/10/9', '10:30 PM', 220, 91.8],
        ['2013/10/9', '10:45 PM', 250, 102.7],
        ['2013/10/9', '11 PM', 180, 74.9],
        ['2013/10/9', '11:15 PM', 260, 104.4],
        ['2013/10/9', '11:30 PM', 200, 87.5],
        ['2013/10/9', '11:45 PM', 190, 83.1],
        ['2013/10/10', '12 AM', 230, 94.5],
        ['2013/10/10', '12:05 AM', 250, 98.5],
        ['2013/10/10', '12:15 AM', 240, 98.3],
        ['2013/10/10', '12:30 AM', 230, 95.0],
        ['2013/10/10', '12:45 AM', 220, 90.5],
        ['2013/10/10', '1 AM', 235, 92.7],
        ['2013/10/10', '1:15 AM', 200, 85.6],
        ['2013/10/10', '1:30 AM', 180, 76.8],
        ['2013/10/10', '1:45 AM', 230, 94.2],
        ['2013/10/10', '2 AM', 183, 77.1],
        ['2013/10/10', '2:15 AM', 195, 82.4],
        ['2013/10/10', '2:30 AM', 200, 85.1],
        ['2013/10/10', '2:45 AM', 185, 78.6],
        ['2013/10/10', '3 AM', 250, 101.9],
        ['2013/10/10', '3:15 AM', 190, 82.8],
        ['2013/10/10', '3:30 AM', 240, 97.2],
        ['2013/10/10', '3:45 AM', 200, 86.1],
        ['2013/10/10', '4 AM', 220, 91.7],
        ['2013/10/10', '4:15 AM', 175, 72.5],
        ['2013/10/10', '4:30 AM', 230, 94.0],
        ['2013/10/10', '4:45 AM', 210, 85.7],
        ['2013/10/10', '5 AM', 200, 83.6],
        ['2013/10/10', '5:15 AM', 240, 97.0],
        ['2013/10/10', '5:30 AM', 195, 82.3],
        ['2013/10/10', '5:45 AM', 230, 94.1],
        ['2013/10/10', '6 AM', 190, 82.0],
        ['2013/10/10', '6:15 AM', 220, 91.9],
        ['2013/10/10', '6:30 AM', 220, 91.9],
        ['2013/10/10', '6:45 AM', 180, 75.4],
        ['2013/10/10', '7 AM', 240, 97.8],
        ['2013/10/10', '7:15 AM', 250, 101.5],
        ['2013/10/10', '7:30 AM', 230, 95.3],
        ['2013/10/10', '8 AM', 190, 83.2],
        ['2013/10/10', '8:15 AM', 180, 81.2]
      ]
    },
    tesla: {
      color: 'danger',
      data: [
        ['2013-10-09', '10 AM', 277, 96.2],
        ['2013-10-09', '10:15 AM', 217, 99.4],
        ['2013-10-09', '10:30 AM', 203, 81.7],
        ['2013-10-09', '10:45 AM', 237, 92.1],
        ['2013-10-09', '11 AM', 255, 67.8],
        ['2013-10-09', '11:15 AM', 197, 82.2],
        ['2013-10-09', '11:30 AM', 201, 62],
        ['2013-10-09', '11:45 AM', 268, 78.4],
        ['2013-10-09', '12 PM', 185, 70.5],
        ['2013-10-09', '12:15 PM', 209, 82.6],
        ['2013-10-09', '12:30 PM', 217, 93.2],
        ['2013-10-09', '12:45 PM', 210, 73],
        ['2013-10-09', '1 PM', 223, 97.4],
        ['2013-10-09', '1:15 PM', 181, 77],
        ['2013-10-09', '1:30 PM', 195, 77.8],
        ['2013-10-09', '1:45 PM', 203, 89.6],
        ['2013-10-09', '2 PM', 262, 61.6],
        ['2013-10-09', '2:15 PM', 253, 92],
        ['2013-10-09', '2:30 PM', 269, 69.2],
        ['2013-10-09', '2:45 PM', 199, 88.4],
        ['2013-10-09', '3 PM', 220, 66.9],
        ['2013-10-09', '3:15 PM', 228, 61.6],
        ['2013-10-09', '3:30 PM', 240, 86.2],
        ['2013-10-09', '3:45 PM', 182, 92.8],
        ['2013-10-09', '4 PM', 259, 77.6],
        ['2013-10-09', '4:15 PM', 217, 96.6],
        ['2013-10-09', '4:30 PM', 190, 76.9],
        ['2013-10-09', '4:45 PM', 200, 76],
        ['2013-10-09', '5 PM', 244, 84.5],
        ['2013-10-09', '5:15 PM', 178, 91.5],
        ['2013-10-09', '5:30 PM', 244, 75.2],
        ['2013-10-09', '5:45 PM', 256, 80.5],
        ['2013-10-09', '6 PM', 204, 73.1],
        ['2013-10-09', '6:15 PM', 214, 82.2],
        ['2013-10-09', '6:30 PM', 214, 76.4],
        ['2013-10-09', '6:45 PM', 247, 69.1],
        ['2013-10-09', '7 PM', 230, 85.8],
        ['2013-10-09', '7:15 PM', 190, 69.9],
        ['2013-10-09', '7:30 PM', 221, 68],
        ['2013-10-09', '7:45 PM', 202, 83.5],
        ['2013-10-09', '8 PM', 189, 74],
        ['2013-10-09', '8:15 PM', 228, 89.5],
        ['2013-10-09', '8:30 PM', 262, 97.6],
        ['2013-10-09', '8:45 PM', 189, 72.6],
        ['2013-10-09', '9 PM', 260, 73.2],
        ['2013-10-09', '9:15 PM', 262, 95.1],
        ['2013-10-09', '9:30 PM', 190, 87.4],
        ['2013-10-09', '9:45 PM', 186, 73.2],
        ['2013-10-09', '10 PM', 259, 60.5],
        ['2013-10-09', '10:15 PM', 179, 81.8],
        ['2013-10-09', '10:30 PM', 250, 85],
        ['2013-10-09', '10:45 PM', 244, 72.5],
        ['2013-10-09', '11 PM', 181, 64.4],
        ['2013-10-09', '11:15 PM', 253, 89],
        ['2013-10-09', '11:30 PM', 246, 64.1],
        ['2013-10-09', '11:45 PM', 183, 73.6],
        ['2013-10-09', '12 AM', 192, 70.9],
        ['2013-10-09', '12:15 AM', 173, 73.5],
        ['2013-10-09', '12:30 AM', 208, 83.9],
        ['2013-10-09', '12:45 AM', 238, 99.9],
        ['2013-10-09', '1 AM', 172, 66.4],
        ['2013-10-09', '1:15 AM', 184, 91.8],
        ['2013-10-09', '1:30 AM', 267, 88.9],
        ['2013-10-09', '1:45 AM', 197, 99.9],
        ['2013-10-09', '2 AM', 172, 92.3],
        ['2013-10-09', '2:15 AM', 255, 93.7],
        ['2013-10-09', '2:30 AM', 201, 60.5],
        ['2013-10-09', '2:45 AM', 213, 69.4],
        ['2013-10-09', '3 AM', 209, 71.1],
        ['2013-10-09', '3:15 AM', 189, 64.1],
        ['2013-10-09', '3:30 AM', 220, 66.2],
        ['2013-10-09', '3:45 AM', 267, 89.7],
        ['2013-10-09', '4 AM', 219, 72.2],
        ['2013-10-09', '4:15 AM', 261, 96.7],
        ['2013-10-09', '4:30 AM', 183, 73.1],
        ['2013-10-09', '4:45 AM', 246, 91.8],
        ['2013-10-09', '5 AM', 203, 88.2],
        ['2013-10-09', '5:15 AM', 285, 81.3],
        ['2013-10-09', '5:30 AM', 223, 81.8],
        ['2013-10-09', '5:45 AM', 247, 78.8],
        ['2013-10-10', '6 AM', 184, 95.8],
        ['2013-10-10', '6:15 AM', 179, 84.2],
        ['2013-10-10', '6:30 AM', 179, 65.3],
        ['2013-10-10', '6:45 AM', 185, 73.1],
        ['2013-10-10', '7 AM', 230, 82.4],
        ['2013-10-10', '7:15 AM', 172, 80.4],
        ['2013-10-10', '7:30 AM', 248, 92.5],
        ['2013-10-10', '7:45 AM', 194, 63.4],
        ['2013-10-10', '8 AM', 196, 90.6]
      ]
    },
    nvidia: {
      color: 'success',
      data: [
        ['2013-10-09', '10 AM', 241, 62.8],
        ['2013-10-09', '10:15 AM', 203, 70.1],
        ['2013-10-09', '10:30 AM', 234, 62.8],
        ['2013-10-09', '10:45 AM', 255, 70.9],
        ['2013-10-09', '11 AM', 189, 95.4],
        ['2013-10-09', '11:15 AM', 239, 93.3],
        ['2013-10-09', '11:30 AM', 255, 69.1],
        ['2013-10-09', '11:45 AM', 218, 87.9],
        ['2013-10-09', '12 PM', 200, 66.2],
        ['2013-10-09', '12:15 PM', 218, 70.4],
        ['2013-10-09', '12:30 PM', 244, 96.3],
        ['2013-10-09', '12:45 PM', 184, 94.5],
        ['2013-10-09', '1 PM', 214, 73.9],
        ['2013-10-09', '1:15 PM', 238, 97.1],
        ['2013-10-09', '1:30 PM', 222, 75.7],
        ['2013-10-09', '1:45 PM', 172, 71.5],
        ['2013-10-09', '2 PM', 249, 80.7],
        ['2013-10-09', '2:15 PM', 232, 79.2],
        ['2013-10-09', '2:30 PM', 246, 97.9],
        ['2013-10-09', '2:45 PM', 185, 95.2],
        ['2013-10-09', '3 PM', 287, 66.1],
        ['2013-10-09', '3:15 PM', 205, 98.9],
        ['2013-10-09', '3:30 PM', 207, 79.8],
        ['2013-10-09', '3:45 PM', 200, 75.6],
        ['2013-10-09', '4 PM', 263, 76],
        ['2013-10-09', '4:15 PM', 230, 94],
        ['2013-10-09', '4:30 PM', 187, 62.2],
        ['2013-10-09', '4:45 PM', 191, 63.6],
        ['2013-10-09', '5 PM', 196, 72.1],
        ['2013-10-09', '5:15 PM', 235, 96.1],
        ['2013-10-09', '5:30 PM', 247, 95.4],
        ['2013-10-09', '5:45 PM', 286, 74.9],
        ['2013-10-09', '6 PM', 175, 89.3],
        ['2013-10-09', '6:15 PM', 208, 73.3],
        ['2013-10-09', '6:30 PM', 233, 99.8],
        ['2013-10-09', '6:45 PM', 184, 75.3],
        ['2013-10-09', '7 PM', 258, 63.3],
        ['2013-10-09', '7:15 PM', 221, 98.6],
        ['2013-10-09', '7:30 PM', 194, 99.6],
        ['2013-10-09', '7:45 PM', 193, 86.4],
        ['2013-10-09', '8 PM', 179, 88.7],
        ['2013-10-09', '8:15 PM', 199, 81],
        ['2013-10-09', '8:30 PM', 214, 78.2],
        ['2013-10-09', '8:45 PM', 203, 69],
        ['2013-10-09', '9 PM', 278, 75.5],
        ['2013-10-09', '9:15 PM', 189, 76.4],
        ['2013-10-09', '9:30 PM', 228, 76],
        ['2013-10-09', '9:45 PM', 222, 86.5],
        ['2013-10-09', '10 PM', 175, 66],
        ['2013-10-09', '10:15 PM', 174, 60.9],
        ['2013-10-09', '10:30 PM', 207, 66.2],
        ['2013-10-09', '10:45 PM', 233, 79.4],
        ['2013-10-09', '11 PM', 195, 66.4],
        ['2013-10-09', '11:15 PM', 206, 62.8],
        ['2013-10-09', '11:30 PM', 228, 76.6],
        ['2013-10-09', '11:45 PM', 245, 70.7],
        ['2013-10-09', '12 AM', 187, 97.2],
        ['2013-10-09', '12:15 AM', 253, 65.1],
        ['2013-10-09', '12:30 AM', 236, 90],
        ['2013-10-09', '12:45 AM', 189, 96],
        ['2013-10-09', '1 AM', 173, 84.2],
        ['2013-10-09', '1:15 AM', 252, 85.9],
        ['2013-10-09', '1:30 AM', 253, 62.9],
        ['2013-10-09', '1:45 AM', 183, 68.2],
        ['2013-10-09', '2 AM', 172, 76],
        ['2013-10-09', '2:15 AM', 209, 70.3],
        ['2013-10-09', '2:30 AM', 195, 84.8],
        ['2013-10-09', '2:45 AM', 182, 98.1],
        ['2013-10-09', '3 AM', 231, 73.4],
        ['2013-10-09', '3:15 AM', 201, 86.9],
        ['2013-10-09', '3:30 AM', 207, 81.8],
        ['2013-10-09', '3:45 AM', 264, 92.9],
        ['2013-10-09', '4 AM', 233, 73.4],
        ['2013-10-09', '4:15 AM', 260, 69.8],
        ['2013-10-09', '4:30 AM', 244, 60.7],
        ['2013-10-09', '4:45 AM', 266, 83.3],
        ['2013-10-09', '5 AM', 237, 84.8],
        ['2013-10-09', '5:15 AM', 223, 84.5],
        ['2013-10-09', '5:30 AM', 207, 72.9],
        ['2013-10-09', '5:45 AM', 217, 94.6],
        ['2013-10-10', '6 AM', 252, 87.6],
        ['2013-10-10', '6:15 AM', 173, 82.3],
        ['2013-10-10', '6:30 AM', 227, 65.9],
        ['2013-10-10', '6:45 AM', 194, 96.8],
        ['2013-10-10', '7 AM', 175, 83.5],
        ['2013-10-10', '7:15 AM', 243, 68.7],
        ['2013-10-10', '7:30 AM', 183, 91.7],
        ['2013-10-10', '7:45 AM', 201, 61.7],
        ['2013-10-10', '8 AM', 267, 97.1]
      ]
    },
    alphabet: {
      color: 'success',
      data: [
        ['2013-10-09', '10 AM', 172, 67.2],
        ['2013-10-09', '10:15 AM', 190, 66.9],
        ['2013-10-09', '10:30 AM', 253, 89.1],
        ['2013-10-09', '10:45 AM', 279, 67.3],
        ['2013-10-09', '11 AM', 282, 91.5],
        ['2013-10-09', '11:15 AM', 211, 90.9],
        ['2013-10-09', '11:30 AM', 231, 79.8],
        ['2013-10-09', '11:45 AM', 220, 67.1],
        ['2013-10-09', '12 PM', 254, 95.4],
        ['2013-10-09', '12:15 PM', 189, 77.3],
        ['2013-10-09', '12:30 PM', 236, 86.3],
        ['2013-10-09', '12:45 PM', 265, 87.8],
        ['2013-10-09', '1 PM', 266, 85.3],
        ['2013-10-09', '1:15 PM', 224, 91.6],
        ['2013-10-09', '1:30 PM', 213, 62.9],
        ['2013-10-09', '1:45 PM', 254, 84.9],
        ['2013-10-09', '2 PM', 192, 76.3],
        ['2013-10-09', '2:15 PM', 172, 97.5],
        ['2013-10-09', '2:30 PM', 204, 94.8],
        ['2013-10-09', '2:45 PM', 192, 80.6],
        ['2013-10-09', '3 PM', 264, 93.6],
        ['2013-10-09', '3:15 PM', 245, 91.8],
        ['2013-10-09', '3:30 PM', 267, 95.9],
        ['2013-10-09', '3:45 PM', 260, 60.6],
        ['2013-10-09', '4 PM', 184, 75.9],
        ['2013-10-09', '4:15 PM', 176, 88.6],
        ['2013-10-09', '4:30 PM', 201, 75.6],
        ['2013-10-09', '4:45 PM', 229, 90.7],
        ['2013-10-09', '5 PM', 231, 70.5],
        ['2013-10-09', '5:15 PM', 257, 84.7],
        ['2013-10-09', '5:30 PM', 213, 84.5],
        ['2013-10-09', '5:45 PM', 243, 63.9],
        ['2013-10-09', '6 PM', 258, 74.7],
        ['2013-10-09', '6:15 PM', 215, 71.3],
        ['2013-10-09', '6:30 PM', 266, 60.7],
        ['2013-10-09', '6:45 PM', 197, 99.2],
        ['2013-10-09', '7 PM', 247, 78.2],
        ['2013-10-09', '7:15 PM', 248, 69.1],
        ['2013-10-09', '7:30 PM', 176, 79.6],
        ['2013-10-09', '7:45 PM', 171, 67.6],
        ['2013-10-09', '8 PM', 263, 70.1],
        ['2013-10-09', '8:15 PM', 198, 85.2],
        ['2013-10-09', '8:30 PM', 249, 67.6],
        ['2013-10-09', '8:45 PM', 242, 99.5],
        ['2013-10-09', '9 PM', 214, 92.3],
        ['2013-10-09', '9:15 PM', 196, 62.9],
        ['2013-10-09', '9:30 PM', 230, 92.7],
        ['2013-10-09', '9:45 PM', 182, 97.4],
        ['2013-10-09', '10 PM', 180, 81.9],
        ['2013-10-09', '10:15 PM', 194, 96.3],
        ['2013-10-09', '10:30 PM', 196, 74.2],
        ['2013-10-09', '10:45 PM', 185, 79.1],
        ['2013-10-09', '11 PM', 267, 86.7],
        ['2013-10-09', '11:15 PM', 262, 70.3],
        ['2013-10-09', '11:30 PM', 179, 66.5],
        ['2013-10-09', '11:45 PM', 210, 83.3],
        ['2013-10-09', '12 AM', 244, 96.1],
        ['2013-10-09', '12:15 AM', 244, 63.8],
        ['2013-10-09', '12:30 AM', 266, 87.5],
        ['2013-10-09', '12:45 AM', 205, 69.2],
        ['2013-10-09', '1 AM', 268, 91.5],
        ['2013-10-09', '1:15 AM', 172, 93.1],
        ['2013-10-09', '1:30 AM', 257, 63.5],
        ['2013-10-09', '1:45 AM', 204, 94.8],
        ['2013-10-09', '2 AM', 237, 93.7],
        ['2013-10-09', '2:15 AM', 230, 95.2],
        ['2013-10-09', '2:30 AM', 195, 76.1],
        ['2013-10-09', '2:45 AM', 217, 98.3],
        ['2013-10-09', '3 AM', 189, 95.4],
        ['2013-10-09', '3:15 AM', 261, 71.2],
        ['2013-10-09', '3:30 AM', 194, 97.3],
        ['2013-10-09', '3:45 AM', 219, 69.3],
        ['2013-10-09', '4 AM', 264, 70.1],
        ['2013-10-09', '4:15 AM', 251, 77.6],
        ['2013-10-09', '4:30 AM', 200, 88.6],
        ['2013-10-09', '4:45 AM', 265, 67.7],
        ['2013-10-09', '5 AM', 226, 87.3],
        ['2013-10-09', '5:15 AM', 197, 89.5],
        ['2013-10-09', '5:30 AM', 240, 87],
        ['2013-10-09', '5:45 AM', 247, 68.7],
        ['2013-10-10', '6 AM', 247, 68],
        ['2013-10-10', '6:15 AM', 186, 62.3],
        ['2013-10-10', '6:30 AM', 182, 65],
        ['2013-10-10', '6:45 AM', 221, 71.4],
        ['2013-10-10', '7 AM', 181, 63.1],
        ['2013-10-10', '7:15 AM', 197, 66],
        ['2013-10-10', '7:30 AM', 197, 77.7],
        ['2013-10-10', '7:45 AM', 259, 61.6],
        ['2013-10-10', '8 AM', 250, 91.6]
      ]
    },
    amd: {
      color: 'success',
      data: [
        ['2013-10-09', '10 AM', 257, 76.4],
        ['2013-10-09', '10:15 AM', 289, 70.6],
        ['2013-10-09', '10:30 AM', 274, 63.7],
        ['2013-10-09', '10:45 AM', 263, 87.2],
        ['2013-10-09', '11 AM', 208, 68.1],
        ['2013-10-09', '11:15 AM', 187, 63.7],
        ['2013-10-09', '11:30 AM', 229, 91.1],
        ['2013-10-09', '11:45 AM', 218, 77.7],
        ['2013-10-09', '12 PM', 212, 86.5],
        ['2013-10-09', '12:15 PM', 231, 95],
        ['2013-10-09', '12:30 PM', 186, 64.4],
        ['2013-10-09', '12:45 PM', 235, 76],
        ['2013-10-09', '1 PM', 209, 91.2],
        ['2013-10-09', '1:15 PM', 193, 95.5],
        ['2013-10-09', '1:30 PM', 211, 86.3],
        ['2013-10-09', '1:45 PM', 251, 69.9],
        ['2013-10-09', '2 PM', 220, 99.2],
        ['2013-10-09', '2:15 PM', 287, 85.5],
        ['2013-10-09', '2:30 PM', 253, 95.4],
        ['2013-10-09', '2:45 PM', 265, 95.4],
        ['2013-10-09', '3 PM', 184, 81],
        ['2013-10-09', '3:15 PM', 195, 84.7],
        ['2013-10-09', '3:30 PM', 209, 83.5],
        ['2013-10-09', '3:45 PM', 196, 69.5],
        ['2013-10-09', '4 PM', 189, 96.4],
        ['2013-10-09', '4:15 PM', 180, 67.9],
        ['2013-10-09', '4:30 PM', 258, 85.7],
        ['2013-10-09', '4:45 PM', 203, 95.7],
        ['2013-10-09', '5 PM', 188, 87.3],
        ['2013-10-09', '5:15 PM', 215, 82.5],
        ['2013-10-09', '5:30 PM', 268, 73.4],
        ['2013-10-09', '5:45 PM', 194, 73.7],
        ['2013-10-09', '6 PM', 180, 91.8],
        ['2013-10-09', '6:15 PM', 233, 72.7],
        ['2013-10-09', '6:30 PM', 236, 81.3],
        ['2013-10-09', '6:45 PM', 195, 86.5],
        ['2013-10-09', '7 PM', 206, 78.2],
        ['2013-10-09', '7:15 PM', 193, 85.7],
        ['2013-10-09', '7:30 PM', 212, 70.4],
        ['2013-10-09', '7:45 PM', 197, 89.4],
        ['2013-10-09', '8 PM', 249, 66.4],
        ['2013-10-09', '8:15 PM', 247, 67.3],
        ['2013-10-09', '8:30 PM', 265, 94],
        ['2013-10-09', '8:45 PM', 252, 70],
        ['2013-10-09', '9 PM', 238, 63.6],
        ['2013-10-09', '9:15 PM', 235, 92.4],
        ['2013-10-09', '9:30 PM', 174, 66.8],
        ['2013-10-09', '9:45 PM', 253, 65.7],
        ['2013-10-09', '10 PM', 210, 67.6],
        ['2013-10-09', '10:15 PM', 192, 84],
        ['2013-10-09', '10:30 PM', 199, 73],
        ['2013-10-09', '10:45 PM', 228, 62.2],
        ['2013-10-09', '11 PM', 229, 68.9],
        ['2013-10-09', '11:15 PM', 215, 95.2],
        ['2013-10-09', '11:30 PM', 272, 74.9],
        ['2013-10-09', '11:45 PM', 288, 82.2],
        ['2013-10-09', '12 AM', 211, 71.1],
        ['2013-10-09', '12:15 AM', 285, 70.7],
        ['2013-10-09', '12:30 AM', 213, 96.3],
        ['2013-10-09', '12:45 AM', 205, 81],
        ['2013-10-09', '1 AM', 206, 63],
        ['2013-10-09', '1:15 AM', 271, 79.2],
        ['2013-10-09', '1:30 AM', 232, 75.6],
        ['2013-10-09', '1:45 AM', 233, 66.5],
        ['2013-10-09', '2 AM', 217, 95.2],
        ['2013-10-09', '2:15 AM', 190, 89.5],
        ['2013-10-09', '2:30 AM', 214, 94.7],
        ['2013-10-09', '2:45 AM', 281, 87.1],
        ['2013-10-09', '3 AM', 211, 67.3],
        ['2013-10-09', '3:15 AM', 249, 97.2],
        ['2013-10-09', '3:30 AM', 256, 64.9],
        ['2013-10-09', '3:45 AM', 210, 96.5],
        ['2013-10-09', '4 AM', 191, 79.4],
        ['2013-10-09', '4:15 AM', 222, 95.3],
        ['2013-10-09', '4:30 AM', 230, 93.8],
        ['2013-10-09', '4:45 AM', 264, 81.1],
        ['2013-10-09', '5 AM', 180, 70.8],
        ['2013-10-09', '5:15 AM', 247, 73.4],
        ['2013-10-09', '5:30 AM', 283, 74],
        ['2013-10-09', '5:45 AM', 219, 76.7],
        ['2013-10-10', '6 AM', 252, 64.4],
        ['2013-10-10', '6:15 AM', 233, 62.2],
        ['2013-10-10', '6:30 AM', 177, 65.8],
        ['2013-10-10', '6:45 AM', 284, 91.1],
        ['2013-10-10', '7 AM', 219, 88.8],
        ['2013-10-10', '7:15 AM', 234, 79.6],
        ['2013-10-10', '7:30 AM', 217, 96.2],
        ['2013-10-10', '7:45 AM', 231, 95],
        ['2013-10-10', '8 AM', 198, 95.5]
      ]
    },
    microsoft: {
      color: 'success',
      data: [
        ['2013-10-09', '10 AM', 284, 65.4],
        ['2013-10-09', '10:15 AM', 174, 84.3],
        ['2013-10-09', '10:30 AM', 261, 74.7],
        ['2013-10-09', '10:45 AM', 286, 96.3],
        ['2013-10-09', '11 AM', 177, 74.2],
        ['2013-10-09', '11:15 AM', 238, 90.3],
        ['2013-10-09', '11:30 AM', 260, 69.3],
        ['2013-10-09', '11:45 AM', 196, 87.1],
        ['2013-10-09', '12 PM', 192, 79.7],
        ['2013-10-09', '12:15 PM', 172, 78.8],
        ['2013-10-09', '12:30 PM', 271, 78.5],
        ['2013-10-09', '12:45 PM', 251, 93.9],
        ['2013-10-09', '1 PM', 237, 83.2],
        ['2013-10-09', '1:15 PM', 224, 81.6],
        ['2013-10-09', '1:30 PM', 242, 94.9],
        ['2013-10-09', '1:45 PM', 250, 94.9],
        ['2013-10-09', '2 PM', 247, 91.7],
        ['2013-10-09', '2:15 PM', 249, 67.4],
        ['2013-10-09', '2:30 PM', 189, 72.4],
        ['2013-10-09', '2:45 PM', 201, 62.6],
        ['2013-10-09', '3 PM', 229, 95.1],
        ['2013-10-09', '3:15 PM', 271, 87.9],
        ['2013-10-09', '3:30 PM', 250, 99.4],
        ['2013-10-09', '3:45 PM', 227, 80.4],
        ['2013-10-09', '4 PM', 235, 98.5],
        ['2013-10-09', '4:15 PM', 178, 70.1],
        ['2013-10-09', '4:30 PM', 191, 90.6],
        ['2013-10-09', '4:45 PM', 220, 84.2],
        ['2013-10-09', '5 PM', 263, 96.4],
        ['2013-10-09', '5:15 PM', 267, 65.5],
        ['2013-10-09', '5:30 PM', 286, 78.6],
        ['2013-10-09', '5:45 PM', 287, 60.7],
        ['2013-10-09', '6 PM', 259, 79.4],
        ['2013-10-09', '6:15 PM', 191, 85],
        ['2013-10-09', '6:30 PM', 212, 83.5],
        ['2013-10-09', '6:45 PM', 183, 81],
        ['2013-10-09', '7 PM', 253, 76.8],
        ['2013-10-09', '7:15 PM', 194, 64.7],
        ['2013-10-09', '7:30 PM', 196, 78.4],
        ['2013-10-09', '7:45 PM', 174, 84],
        ['2013-10-09', '8 PM', 214, 92.3],
        ['2013-10-09', '8:15 PM', 205, 66.8],
        ['2013-10-09', '8:30 PM', 262, 96.5],
        ['2013-10-09', '8:45 PM', 191, 97.4],
        ['2013-10-09', '9 PM', 223, 69.2],
        ['2013-10-09', '9:15 PM', 242, 87.3],
        ['2013-10-09', '9:30 PM', 176, 60.3],
        ['2013-10-09', '9:45 PM', 172, 95.7],
        ['2013-10-09', '10 PM', 209, 62.6],
        ['2013-10-09', '10:15 PM', 286, 71.1],
        ['2013-10-09', '10:30 PM', 265, 77.7],
        ['2013-10-09', '10:45 PM', 237, 90.1],
        ['2013-10-09', '11 PM', 251, 83.7],
        ['2013-10-09', '11:15 PM', 217, 60.1],
        ['2013-10-09', '11:30 PM', 207, 65.6],
        ['2013-10-09', '11:45 PM', 181, 68.5],
        ['2013-10-09', '12 AM', 171, 95.8],
        ['2013-10-09', '12:15 AM', 211, 81.4],
        ['2013-10-09', '12:30 AM', 247, 86.5],
        ['2013-10-09', '12:45 AM', 211, 67.6],
        ['2013-10-09', '1 AM', 180, 64.1],
        ['2013-10-09', '1:15 AM', 227, 78.1],
        ['2013-10-09', '1:30 AM', 197, 67.5],
        ['2013-10-09', '1:45 AM', 212, 64.5],
        ['2013-10-09', '2 AM', 261, 95.1],
        ['2013-10-09', '2:15 AM', 192, 65.3],
        ['2013-10-09', '2:30 AM', 247, 62.8],
        ['2013-10-09', '2:45 AM', 177, 78.9],
        ['2013-10-09', '3 AM', 243, 86.7],
        ['2013-10-09', '3:15 AM', 182, 83.2],
        ['2013-10-09', '3:30 AM', 262, 82.7],
        ['2013-10-09', '3:45 AM', 270, 67.4],
        ['2013-10-09', '4 AM', 171, 63.4],
        ['2013-10-09', '4:15 AM', 207, 73.2],
        ['2013-10-09', '4:30 AM', 257, 84],
        ['2013-10-09', '4:45 AM', 185, 99.4],
        ['2013-10-09', '5 AM', 185, 79.2],
        ['2013-10-09', '5:15 AM', 243, 67.7],
        ['2013-10-09', '5:30 AM', 219, 84.2],
        ['2013-10-09', '5:45 AM', 285, 91.1],
        ['2013-10-10', '6 AM', 269, 69.6],
        ['2013-10-10', '6:15 AM', 189, 89.2],
        ['2013-10-10', '6:30 AM', 243, 72.8],
        ['2013-10-10', '6:45 AM', 269, 71.2],
        ['2013-10-10', '7 AM', 227, 63.8],
        ['2013-10-10', '7:15 AM', 244, 73.4],
        ['2013-10-10', '7:30 AM', 284, 86.3],
        ['2013-10-10', '7:45 AM', 224, 72.6],
        ['2013-10-10', '8 AM', 207, 60.4]
      ]
    },
    intel: {
      color: 'success',
      data: [
        ['2013-10-09', '10 AM', 208, 76.7],
        ['2013-10-09', '10:15 AM', 209, 78.2],
        ['2013-10-09', '10:30 AM', 198, 62.1],
        ['2013-10-09', '10:45 AM', 261, 78.9],
        ['2013-10-09', '11 AM', 247, 97.6],
        ['2013-10-09', '11:15 AM', 215, 70.6],
        ['2013-10-09', '11:30 AM', 210, 80.1],
        ['2013-10-09', '11:45 AM', 210, 95.5],
        ['2013-10-09', '12 PM', 200, 84.6],
        ['2013-10-09', '12:15 PM', 216, 76.4],
        ['2013-10-09', '12:30 PM', 224, 88.3],
        ['2013-10-09', '12:45 PM', 236, 74.4],
        ['2013-10-09', '1 PM', 208, 71],
        ['2013-10-09', '1:15 PM', 232, 78.2],
        ['2013-10-09', '1:30 PM', 222, 80.5],
        ['2013-10-09', '1:45 PM', 221, 91.4],
        ['2013-10-09', '2 PM', 266, 85.8],
        ['2013-10-09', '2:15 PM', 180, 86.1],
        ['2013-10-09', '2:30 PM', 243, 90.1],
        ['2013-10-09', '2:45 PM', 199, 68.4],
        ['2013-10-09', '3 PM', 222, 67.2],
        ['2013-10-09', '3:15 PM', 184, 97.5],
        ['2013-10-09', '3:30 PM', 228, 78.2],
        ['2013-10-09', '3:45 PM', 182, 80],
        ['2013-10-09', '4 PM', 186, 76.7],
        ['2013-10-09', '4:15 PM', 191, 77.5],
        ['2013-10-09', '4:30 PM', 195, 71.1],
        ['2013-10-09', '4:45 PM', 182, 68.3],
        ['2013-10-09', '5 PM', 277, 63],
        ['2013-10-09', '5:15 PM', 181, 95.8],
        ['2013-10-09', '5:30 PM', 270, 69.5],
        ['2013-10-09', '5:45 PM', 283, 75.9],
        ['2013-10-09', '6 PM', 265, 93.9],
        ['2013-10-09', '6:15 PM', 204, 84.8],
        ['2013-10-09', '6:30 PM', 170, 82],
        ['2013-10-09', '6:45 PM', 221, 71.7],
        ['2013-10-09', '7 PM', 173, 86],
        ['2013-10-09', '7:15 PM', 212, 93],
        ['2013-10-09', '7:30 PM', 240, 87.3],
        ['2013-10-09', '7:45 PM', 258, 86.7],
        ['2013-10-09', '8 PM', 198, 89.2],
        ['2013-10-09', '8:15 PM', 234, 87.2],
        ['2013-10-09', '8:30 PM', 267, 87],
        ['2013-10-09', '8:45 PM', 278, 85.2],
        ['2013-10-09', '9 PM', 287, 95.8],
        ['2013-10-09', '9:15 PM', 172, 86.6],
        ['2013-10-09', '9:30 PM', 259, 60.2],
        ['2013-10-09', '9:45 PM', 212, 99.7],
        ['2013-10-09', '10 PM', 222, 61.2],
        ['2013-10-09', '10:15 PM', 245, 72.2],
        ['2013-10-09', '10:30 PM', 190, 80.5],
        ['2013-10-09', '10:45 PM', 185, 67.1],
        ['2013-10-09', '11 PM', 180, 70],
        ['2013-10-09', '11:15 PM', 199, 71.5],
        ['2013-10-09', '11:30 PM', 230, 65.9],
        ['2013-10-09', '11:45 PM', 269, 87.9],
        ['2013-10-09', '12 AM', 180, 61.3],
        ['2013-10-09', '12:15 AM', 258, 99.1],
        ['2013-10-09', '12:30 AM', 220, 71.3],
        ['2013-10-09', '12:45 AM', 275, 92.1],
        ['2013-10-09', '1 AM', 230, 79],
        ['2013-10-09', '1:15 AM', 271, 88.2],
        ['2013-10-09', '1:30 AM', 243, 74.3],
        ['2013-10-09', '1:45 AM', 193, 76.4],
        ['2013-10-09', '2 AM', 202, 72.3],
        ['2013-10-09', '2:15 AM', 217, 87.8],
        ['2013-10-09', '2:30 AM', 187, 98.6],
        ['2013-10-09', '2:45 AM', 251, 99.4],
        ['2013-10-09', '3 AM', 201, 87.7],
        ['2013-10-09', '3:15 AM', 230, 95.1],
        ['2013-10-09', '3:30 AM', 199, 60.2],
        ['2013-10-09', '3:45 AM', 230, 80.3],
        ['2013-10-09', '4 AM', 214, 77.9],
        ['2013-10-09', '4:15 AM', 174, 71.8],
        ['2013-10-09', '4:30 AM', 230, 91],
        ['2013-10-09', '4:45 AM', 253, 99.2],
        ['2013-10-09', '5 AM', 217, 63.6],
        ['2013-10-09', '5:15 AM', 172, 72.7],
        ['2013-10-09', '5:30 AM', 284, 75.6],
        ['2013-10-09', '5:45 AM', 251, 65.4],
        ['2013-10-10', '6 AM', 202, 70.7],
        ['2013-10-10', '6:15 AM', 221, 63.2],
        ['2013-10-10', '6:30 AM', 212, 68.7],
        ['2013-10-10', '6:45 AM', 204, 78.1],
        ['2013-10-10', '7 AM', 197, 68.5],
        ['2013-10-10', '7:15 AM', 190, 79.6],
        ['2013-10-10', '7:30 AM', 262, 89.8],
        ['2013-10-10', '7:45 AM', 275, 98.2],
        ['2013-10-10', '8 AM', 283, 61]
      ]
    }
  };

  const topStocksChartsInit = () => {
    const { getColor, rgbaColor, breakpoints } = window.phoenix.utils;

    const chartCanvasInit = ($chart, dataItem) => {
      const chartData = dataItem;
      const dataSets1 = chartData.data.map(item => item[2]);
      const labels = chartData.data.map(item => item[1]);

      const index = chartData.data.findIndex(item => item[1] === '11:45 PM');

      const areaLine = (ctx, idx, color) =>
        ctx.p0.parsed.x <= idx ? color : undefined;
      const transparentLine = (ctx, idx, color) =>
        ctx.p0.parsed.x > idx ? color : undefined;

      let chartGradient = null;

      const getGradient = ctx => {
        const { chartArea } = ctx.chart;
        if (!chartArea) return chartGradient;

        const gradient = ctx.chart.ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, rgbaColor(getColor(chartData.color), 0.0));
        gradient.addColorStop(1, rgbaColor(getColor(chartData.color), 0.5));

        chartGradient = gradient;
        return gradient;
      };

      const getOptions = () => {
        return {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Dataset 1',
                borderWidth: 1,
                fill: true,
                data: dataSets1,
                pointRadius: 0,
                segment: {
                  backgroundColor: ctx =>
                    areaLine(ctx, index, getGradient(ctx)) ||
                    transparentLine(ctx, index, 'transparent'),
                  borderColor: ctx =>
                    areaLine(ctx, index, getColor(chartData.color)) ||
                    transparentLine(ctx, index, getColor('border-color'))
                }
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            animation: false,
            plugins: {
              legend: {
                display: false,
                labels: {
                  color: getColor('body-color')
                }
              },
              tooltip: {
                enabled: false,
                position: 'nearest',
                external: context => {
                  const { tooltip } = context;
                  if (!tooltip || tooltip.dataPoints.length === 0) return;

                  const tooltipItem = tooltip.dataPoints[0];
                  const idx = tooltipItem.dataIndex;

                  const hoveredData = chartData.data[idx];
                  const [date, time, value, volume] = hoveredData;

                  externalTooltipHandler(context, { date, time, value, volume });
                }
              },
              beforeDraw: () => {
                chartGradient = null;
              }
            },
            scales: {
              x: {
                type: 'category',
                offset: false,
                alignToPixels: true,
                title: {},
                ticks: {
                  color: getColor('body-color'),
                  maxTicksLimit: () => {
                    const width = window.innerWidth;

                    if (width < breakpoints.sm) {
                      return 4;
                    }
                    if (width < breakpoints.md) {
                      return 7;
                    }
                    return 12;
                  }
                },
                grid: {
                  color: 'transparent',
                  drawBorder: false
                }
              },
              y: {
                beginAtZero: false,
                min: 170,
                max: 290,
                ticks: {
                  stepSize: 10,
                  color: getColor('body-color'),
                  offset: true,
                  callback: value => {
                    return `${value}     `;
                  }
                },
                grid: {
                  color: getColor('border-color-translucent'),
                  drawBorder: true,
                  drawTicks: false
                }
              }
            }
          },
          plugins: [verticalLinePlugin, borderXPlugin]
        };
      };

      chartJsInit($chart, getOptions);
    };

    const chartKeys = [
      'apple',
      'tesla',
      'nvidia',
      'alphabet',
      'amd',
      'microsoft',
      'intel'
    ];

    chartKeys.forEach(key => {
      const el = document.getElementById(`top-stock-${key}-chart`);
      const data = topStockChartData[key];
      if (el && data) {
        chartCanvasInit(el, data);
      }
    });
  };

  const { docReady } = window.phoenix.utils;

  docReady(stockOverviewChartInit);
  docReady(stockOverviewInvertedChartInit);
  docReady(stockOverviewMixedChartInit);
  docReady(topStocksChartsInit);

}));
//# sourceMappingURL=stock-dashboard.js.map

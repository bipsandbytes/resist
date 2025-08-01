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
    console.log('getDefaultOptions:', getDefaultOptions());
    console.log('userOptions:', userOptions);
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

  const issuesDiscoveredChartInit = () => {
    const { getColor, getData, toggleColor } = window.phoenix.utils;
    const issuesDiscoveredChartEl = document.querySelector('.echart-issue-chart');

    const tooltipFormatter = params => {
      return `<div style="width: 160px;">
              <p class='mb-2 text-body-tertiary'>
                ${params.seriesName}
              </p>
              <div class='ms-1'>
                <h6 class="text-body-tertiary d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fas fa-circle me-1 fs-10" style="color:${
                      params.borderColor ? params.borderColor : params.color
                    }"></span>
                  ${params.name}
                  </div>
                  ${params.value}
                </h6>
              </div>
            </div>
    `;
    };

    if (issuesDiscoveredChartEl) {
      const userOptions = getData(issuesDiscoveredChartEl, 'echarts');
      const chart = window.echarts.init(issuesDiscoveredChartEl);

      const getDefaultOptions = () => ({
        color: [
          toggleColor(getColor('info-light'), getColor('info-dark')),
          toggleColor(getColor('warning-light'), getColor('warning-dark')),
          toggleColor(getColor('danger-light'), getColor('danger-dark')),
          toggleColor(getColor('success-light'), getColor('success-dark')),
          getColor('primary')
        ],
        tooltip: {
          trigger: 'item',
          backgroundColor: getColor('body-bg'),
          borderColor: getColor('secondary-bg'),
          extraCssText: 'z-index: 1000',
          position: (...params) => handleTooltipPosition(params),
          formatter: params => tooltipFormatter(params)
        },
        responsive: true,
        maintainAspectRatio: false,

        series: [
          {
            name: 'Tasks assigned to me',
            type: 'pie',
            radius: ['48%', '90%'],
            startAngle: 30,
            avoidLabelOverlap: false,
            // label: {
            //   show: false,
            //   position: 'center'
            // },

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
            data: [
              { value: 78, name: 'Product design' },
              { value: 63, name: 'Development' },
              { value: 56, name: 'QA & Testing' },
              { value: 36, name: 'Customer queries' },
              { value: 24, name: 'R & D' }
            ]
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

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const zeroBurnOutChartInit = () => {
    const { getColor, getData, getPastDates } = window.phoenix.utils;
    const $zeroBurnOutChartEl = document.querySelector(
      '.echart-zero-burnout-chart'
    );

    if ($zeroBurnOutChartEl) {
      const userOptions = getData($zeroBurnOutChartEl, 'echarts');
      const chart = window.echarts.init($zeroBurnOutChartEl);

      const getDefaultOptions = () => ({
        tooltip: {
          trigger: 'axis',
          backgroundColor: getColor('body-bg'),
          borderColor: getColor('secondary-bg'),
          formatter: params => tooltipFormatter(params, 'MMM DD, YYYY'),
          axisPointer: {
            shadowStyle: {
              color: 'red'
            }
          },
          extraCssText: 'z-index: 1000'
        },
        legend: {
          bottom: '10',
          data: [
            {
              name: 'Open',
              icon: 'roundRect'
            },
            {
              name: 'Issues found',
              icon: 'roundRect'
            },
            {
              name: 'In Progress',
              icon: 'roundRect'
            }
          ],
          itemWidth: 16,
          itemHeight: 8,
          itemGap: 10,
          inactiveColor: getColor('quaternary-color'),
          inactiveBorderWidth: 0,
          textStyle: {
            color: getColor('body-color'),
            fontWeight: 600,
            fontSize: 16,
            fontFamily: 'Nunito Sans'
          }
        },

        // grid: {
        //   left: '0%',
        //   right: '4%',
        //   bottom: '15%',
        //   top: '10%',
        //   containLabel: true,
        //   show: true
        // },

        xAxis: [
          {
            show: true,
            interval: 2,
            axisLine: {
              lineStyle: {
                type: 'solid',
                color: getColor('border-color')
              }
            },
            axisLabel: {
              color: getColor('body-color'),
              formatter: data => window.dayjs(data).format('D MMM'),
              interval: 5,
              align: 'left',
              margin: 20,
              fontSize: 12.8
            },
            axisTick: {
              show: true,
              length: 15
              // alignWithLabel: true
            },
            splitLine: {
              interval: 0,
              show: true,
              lineStyle: {
                color: getColor('border-color'),
                type: 'dashed'
              }
            },
            type: 'category',
            boundaryGap: false,
            data: getPastDates(15)
          },
          {
            show: true,
            interval: 2,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              interval: 1,
              show: true,
              lineStyle: {
                color: getColor('border-color'),
                type: 'solid'
              }
            },
            boundaryGap: false,
            data: getPastDates(15)
          }
        ],
        yAxis: {
          show: true,
          type: 'value',
          axisLine: {
            lineStyle: {
              type: 'solid',
              color: getColor('border-color')
            }
          },
          axisLabel: {
            color: getColor('body-color'),
            margin: 20,
            fontSize: 12.8,
            interval: 0
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: getColor('border-color'),
              type: 'solid'
            }
          },
          axisTick: {
            show: true,
            length: 15,
            alignWithLabel: true,
            lineStyle: {
              color: getColor('border-color')
            }
          }
          // data: ['0', '10', '20']
        },
        series: [
          {
            name: 'Estimated',
            type: 'line',
            symbol: 'none',
            data: [20, 17.5, 15, 15, 15, 12.5, 10, 7.5, 5, 2.5, 2.5, 2.5, 0],
            lineStyle: {
              width: 0
            },
            areaStyle: {
              color: getColor('primary-light'),
              opacity: 0.075
            },
            tooltip: {
              show: false
            }
          },
          {
            name: 'Issues found',
            type: 'line',
            symbolSize: 6,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('success'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('success')
            },
            symbol: 'circle',
            data: [3, 1, 2, 4, 3, 1]
          },
          {
            name: 'Open',
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
            data: [6, 5, 4, 6, 5, 5]
          },
          {
            name: 'In Progress',
            type: 'line',
            symbolSize: 6,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('warning'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('warning')
            },
            symbol: 'circle',
            data: [11, 12, 11, 9, 11, 6]
          },
          {
            name: 'Actual',
            type: 'line',
            symbolSize: 6,
            itemStyle: {
              color: getColor('body-highlight-bg'),
              borderColor: getColor('quaternary-color'),
              borderWidth: 2
            },
            lineStyle: {
              color: getColor('quaternary-color'),
              type: 'dashed'
            },
            symbol: 'circle',
            data: [20, 19, 15, 14, 12, 8]
          }
        ],
        grid: {
          right: 5,
          left: 0,
          bottom: '15%',
          top: 20,
          containLabel: true
        }
      });

      echartSetOption(chart, userOptions, getDefaultOptions);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Echarts Total Sales                            */
  /* -------------------------------------------------------------------------- */

  const zeroRoadmapChartInit = () => {
    const { getItemFromStore } = window.phoenix.utils;
    const zeroRoadMapEl = document.querySelector('.gantt-zero-roadmap');

    if (zeroRoadMapEl) {
      const chartEl = zeroRoadMapEl.querySelector('.gantt-zero-roadmap-chart');

      window.gantt.plugins({
        tooltip: true
      });

      window.gantt.config.date_format = '%Y-%m-%d %H:%i';
      window.gantt.config.scale_height = 0;
      window.gantt.config.row_height = 36;
      window.gantt.config.bar_height = 12;
      window.gantt.config.drag_move = false;
      window.gantt.config.drag_progress = false;
      window.gantt.config.drag_resize = false;
      window.gantt.config.drag_links = false;
      window.gantt.config.details_on_dblclick = false;
      window.gantt.config.click_drag = false;

      if (getItemFromStore('phoenixIsRTL')) {
        window.gantt.config.rtl = true;
      }

      const zoomConfig = {
        levels: [
          {
            name: 'month',
            scales: [
              { unit: 'month', format: '%F, %Y' },
              { unit: 'week', format: 'Week #%W' }
            ]
          },

          {
            name: 'year',
            scales: [{ unit: 'year', step: 1, format: '%Y' }]
          },
          {
            name: 'week',
            scales: [
              {
                unit: 'week',
                step: 1,
                format: date => {
                  const dateToStr = window.gantt.date.date_to_str('%d %M');
                  const endDate = window.gantt.date.add(date, -6, 'day');
                  const weekNum = window.gantt.date.date_to_str('%W')(date);
                  return (
                    '#' +
                    weekNum +
                    ', ' +
                    dateToStr(date) +
                    ' - ' +
                    dateToStr(endDate)
                  );
                }
              },
              { unit: 'day', step: 1, format: '%j %D' }
            ]
          }
        ]
      };

      gantt.ext.zoom.init(zoomConfig);
      gantt.ext.zoom.setLevel('week');
      gantt.ext.zoom.attachEvent('onAfterZoom', function (level, config) {
        document.querySelector(
          "input[value='" + config.name + "']"
        ).checked = true;
      });

      gantt.config.columns = [{ name: 'text', width: 56, resize: true }];

      gantt.templates.task_class = (start, end, task) => task.task_class;

      gantt.timeline_cell_class = function (task, date) {
        return 'weekend';
      };

      gantt.templates.task_text = () => '';

      window.gantt.init(chartEl);
      window.gantt.parse({
        data: [
          {
            id: 1,
            text: 'Planning',
            start_date: '2019-08-01 00:00',
            duration: 3,
            progress: 1,
            task_class: 'planning'
          },
          {
            id: 2,
            text: 'Research',
            start_date: '2019-08-02 00:00',
            duration: 5,
            // parent: 1,
            progress: 0.5,
            task_class: 'research'
          },
          {
            id: 3,
            text: 'Design',
            start_date: '2019-08-02 00:00',
            duration: 10,
            // parent: 1,
            progress: 0.4,
            task_class: 'design'
          },
          {
            id: 4,
            text: 'Review',
            start_date: '2019-08-05 00:00',
            duration: 5,
            // parent: 1,
            progress: 0.8,
            task_class: 'review'
          },
          {
            id: 5,
            text: 'Develop',
            start_date: '2019-08-06 00:00',
            duration: 10,
            // parent: 1,
            progress: 0.3,
            open: true,
            task_class: 'develop'
          },
          {
            id: 6,
            text: 'Review II',
            start_date: '2019-08-10 00:00',
            duration: 4,
            // parent: 4,
            progress: 0.02,
            task_class: 'review-2'
          }
        ],
        links: [
          { id: 1, source: 1, target: 2, type: '0' },
          { id: 2, source: 1, target: 3, type: '0' },
          { id: 3, source: 3, target: 4, type: '0' },
          { id: 4, source: 6, target: 5, type: '3' }
        ]
      });

      const scaleRadios = zeroRoadMapEl.querySelectorAll('input[name=scaleView]');

      const progressCheck = zeroRoadMapEl.querySelector('[data-gantt-progress]');
      const linksCheck = zeroRoadMapEl.querySelector('[data-gantt-links]');

      scaleRadios.forEach(item => {
        item.addEventListener('click', e => {
          window.gantt.ext.zoom.setLevel(e.target.value);
        });
      });

      linksCheck.addEventListener('change', e => {
        window.gantt.config.show_links = e.target.checked;
        window.gantt.init(chartEl);
      });

      progressCheck.addEventListener('change', e => {
        window.gantt.config.show_progress = e.target.checked;
        window.gantt.init(chartEl);
      });
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(zeroRoadmapChartInit);
  docReady(zeroBurnOutChartInit);
  docReady(issuesDiscoveredChartInit);

}));
//# sourceMappingURL=projectmanagement-dashboard.js.map

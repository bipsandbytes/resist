(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /* -------------------------------------------------------------------------- */

  /* --------------------------------- Colors --------------------------------- */

  const getColor = (name, dom = document.documentElement) => {
    return getComputedStyle(dom).getPropertyValue(`--phoenix-${name}`).trim();
  };

  /* -------------------------------------------------------------------------- */
  /*                                   mapbox cluster                                  */
  /* -------------------------------------------------------------------------- */

  const mapboxClusterInit = () => {
    const mapboxCluster = document.querySelectorAll('#mapbox-cluster');
    if (mapboxCluster) {
      mapboxCluster.forEach(() => {
        window.mapboxgl.accessToken =
          'pk.eyJ1IjoidGhlbWV3YWdvbiIsImEiOiJjbGhmNW5ybzkxcmoxM2RvN2RmbW1nZW90In0.hGIvQ890TYkZ948MVrsMIQ';

        const styles = {
          default: 'mapbox://styles/mapbox/light-v11',
          light: 'mapbox://styles/themewagon/clj57pads001701qo25756jtw',
          dark: 'mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew'
        };

        const map = new window.mapboxgl.Map({
          container: 'mapbox-cluster',
          style: styles[window.config.config.phoenixTheme],
          center: [-73.102712, 7.102257],
          zoom: 3.5,
          pitch: 40,
          attributionControl: false
        });

        map.on('load', () => {
          map.addSource('earthquakes', {
            type: 'geojson',
            data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'earthquakes',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                getColor('secondary'),
                100,
                getColor('info'),
                750,
                getColor('warning')
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ]
            }
          });

          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'earthquakes',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': getColor('white')
            }
          });

          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'earthquakes',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': getColor('primary-light'),
              'circle-radius': 4,
              'circle-stroke-width': 1,
              'circle-stroke-color': getColor('emphasis-bg')
            }
          });

          map.on('click', 'clusters', e => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map
              .getSource('earthquakes')
              .getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                map.easeTo({
                  center: features[0].geometry.coordinates,
                  zoom
                });
              });
          });

          map.on('click', 'unclustered-point', e => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const { mag } = e.features[0].properties;
            const tsunami = e.features[0].properties.tsunami === 1 ? 'yes' : 'no';

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new window.mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
              .addTo(map);
          });

          map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
          });
        });
      });
    }
  };

  const themeController = document.body;
  if (themeController) {
    themeController.addEventListener('clickControl', () => {
      mapboxClusterInit();
    });
  }

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
  /*                             Echarts trip review                            */
  /* -------------------------------------------------------------------------- */

  const { echarts } = window;

  const tripReviewChartInit = () => {
    const { getData, getColor } = window.phoenix.utils;
    const $echartTripReviews = document.querySelectorAll('.echart-trip-review');

    if ($echartTripReviews) {
      $echartTripReviews.forEach($echartTripReview => {
        const userOptions = getData($echartTripReview, 'options');
        const chart = echarts.init($echartTripReview);

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
                // roundCap: true,
                clip: false,
                itemStyle: {
                  color: getColor('primary')
                }
              },
              axisLine: {
                lineStyle: {
                  width: 4,
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
              detail: {
                fontSize: '20px',
                color: getColor('body-color'),
                offsetCenter: [0, '10%']
              }
            }
          ]
        });

        echartSetOption(chart, userOptions, getDefaultOptions);
      });
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(tripReviewChartInit);
  docReady(mapboxClusterInit);

}));
//# sourceMappingURL=trip.js.map

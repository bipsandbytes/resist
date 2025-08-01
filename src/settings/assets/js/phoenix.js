(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('bootstrap')) :
  typeof define === 'function' && define.amd ? define(['bootstrap'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.phoenix = factory(global.bootstrap));
})(this, (function (bootstrap) { 'use strict';

      var phoenixIsRTL = window.config.config.phoenixIsRTL;
      if (phoenixIsRTL) {
        var linkDefault = document.getElementById('style-default');
        var userLinkDefault = document.getElementById('user-style-default');
        linkDefault.setAttribute('disabled', true);
        userLinkDefault.setAttribute('disabled', true);
        document.querySelector('html').setAttribute('dir', 'rtl');
      } else {
        var linkRTL = document.getElementById('style-rtl');
        var userLinkRTL = document.getElementById('user-style-rtl');
        linkRTL.setAttribute('disabled', true);
        userLinkRTL.setAttribute('disabled', true);
      }

	var navbarTopStyle = window.config.config.phoenixNavbarTopStyle;
        var navbarTop = document.querySelector('.navbar-top');
        if (navbarTopStyle === 'darker') {
          navbarTop.setAttribute('data-navbar-appearance', 'darker');
        }

        var navbarVerticalStyle = window.config.config.phoenixNavbarVerticalStyle;
        var navbarVertical = document.querySelector('.navbar-vertical');
        if (navbarVertical && navbarVerticalStyle === 'darker') {
          navbarVertical.setAttribute('data-navbar-appearance', 'darker');
        }
  /* -------------------------------------------------------------------------- */
  /*                                    Utils                                   */
  /* -------------------------------------------------------------------------- */
  const docReady = fn => {
    // see if DOM is already available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      setTimeout(fn, 1);
    }
  };

  const toggleColor = (lightColor, darkColor) => {
    const currentMode = getItemFromStore('phoenixTheme');
    const mode = currentMode === 'auto' ? getSystemTheme() : currentMode;
    return mode === 'light' ? lightColor : darkColor;
  };

  const resize = fn => window.addEventListener('resize', fn);

  const isIterableArray = array => Array.isArray(array) && !!array.length;

  const camelize = str => {
    const text = str.replace(/[-_\s.]+(.)?/g, (_, c) =>
      c ? c.toUpperCase() : ''
    );
    return `${text.substr(0, 1).toLowerCase()}${text.substr(1)}`;
  };

  const getData = (el, data) => {
    try {
      return JSON.parse(el.dataset[camelize(data)]);
    } catch (e) {
      return el.dataset[camelize(data)];
    }
  };

  /* ----------------------------- Colors function ---------------------------- */

  const hexToRgb = hexValue => {
    let hex;
    hexValue.indexOf('#') === 0
      ? (hex = hexValue.substring(1))
      : (hex = hexValue);
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
    );
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : null;
  };

  const rgbaColor = (color = '#fff', alpha = 0.5) =>
    `rgba(${hexToRgb(color)}, ${alpha})`;

  /* --------------------------------- Colors --------------------------------- */

  const getColor = (name, dom = document.documentElement) => {
    return getComputedStyle(dom).getPropertyValue(`--phoenix-${name}`).trim();
  };

  const hasClass = (el, className) => {
    return el.classList.value.includes(className);
  };

  const addClass = (el, className) => {
    el.classList.add(className);
  };

  const getOffset = el => {
    const rect = el.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  };

  const isScrolledIntoView = el => {
    let top = el.offsetTop;
    let left = el.offsetLeft;
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    while (el.offsetParent) {
      // eslint-disable-next-line no-param-reassign
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return {
      all:
        top >= window.pageYOffset &&
        left >= window.pageXOffset &&
        top + height <= window.pageYOffset + window.innerHeight &&
        left + width <= window.pageXOffset + window.innerWidth,
      partial:
        top < window.pageYOffset + window.innerHeight &&
        left < window.pageXOffset + window.innerWidth &&
        top + height > window.pageYOffset &&
        left + width > window.pageXOffset
    };
  };

  const breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1540
  };

  const getBreakpoint = el => {
    const classes = el && el.classList.value;
    let breakpoint;
    if (classes) {
      breakpoint =
        breakpoints[
          classes
            .split(' ')
            .filter(cls => cls.includes('navbar-expand-'))
            .pop()
            .split('-')
            .pop()
        ];
    }
    return breakpoint;
  };

  /* --------------------------------- Cookie --------------------------------- */

  const setCookie = (name, value, seconds) => {
    const expires = window.dayjs().add(seconds, 'second').toDate();
    document.cookie = `${name}=${value};expires=${expires}`;
  };

  const getCookie = name => {
    const keyValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return keyValue ? keyValue[2] : keyValue;
  };

  const settings = {
    tinymce: {
      theme: 'oxide'
    },
    chart: {
      borderColor: 'rgba(255, 255, 255, 0.8)'
    }
  };

  /* -------------------------- Chart Initialization -------------------------- */

  const newChart = (chart, config) => {
    const ctx = chart.getContext('2d');
    return new window.Chart(ctx, config);
  };

  /* ---------------------------------- Store --------------------------------- */

  const getItemFromStore = (key, defaultValue, store = localStorage) => {
    try {
      return JSON.parse(store.getItem(key)) || defaultValue;
    } catch {
      return store.getItem(key) || defaultValue;
    }
  };

  const setItemToStore = (key, payload, store = localStorage) =>
    store.setItem(key, payload);
  const getStoreSpace = (store = localStorage) =>
    parseFloat(
      (
        escape(encodeURIComponent(JSON.stringify(store))).length /
        (1024 * 1024)
      ).toFixed(2)
    );

  /* get Dates between */

  const getDates = (
    startDate,
    endDate,
    interval = 1000 * 60 * 60 * 24
  ) => {
    const duration = endDate - startDate;
    const steps = duration / interval;
    return Array.from(
      { length: steps + 1 },
      (v, i) => new Date(startDate.valueOf() + interval * i)
    );
  };

  const getPastDates = duration => {
    let days;

    switch (duration) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;

      default:
        days = duration;
    }

    const date = new Date();
    const endDate = date;
    const startDate = new Date(new Date().setDate(date.getDate() - (days - 1)));
    return getDates(startDate, endDate);
  };

  /* Get Random Number */
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // export const handleThemeDropdownIcon = value => {
  //   document.querySelectorAll('[data-theme-dropdown-toggle-icon]').forEach(el => {
  //     const theme = getData(el, 'theme-dropdown-toggle-icon');

  //     if (value === theme) {
  //       el.classList.remove('d-none');
  //     } else {
  //       el.classList.add('d-none');
  //     }
  //   });
  // };
  // handleThemeDropdownIcon(getItemFromStore('phoenixTheme'));

  var utils = {
    docReady,
    toggleColor,
    resize,
    isIterableArray,
    camelize,
    getData,
    hasClass,
    addClass,
    hexToRgb,
    rgbaColor,
    getColor,
    breakpoints,
    // getGrays,
    getOffset,
    isScrolledIntoView,
    getBreakpoint,
    setCookie,
    getCookie,
    newChart,
    settings,
    getItemFromStore,
    setItemToStore,
    getStoreSpace,
    getDates,
    getPastDates,
    getRandomNumber,
    getSystemTheme
    // handleThemeDropdownIcon
  };

  const docComponentInit = () => {
    const componentCards = document.querySelectorAll('[data-component-card]');
    const iconCopiedToast = document.getElementById('icon-copied-toast');
    const iconCopiedToastInstance = new bootstrap.Toast(iconCopiedToast);

    componentCards.forEach(card => {
      const copyCodeBtn = card.querySelector('.copy-code-btn');
      const copyCodeEl = card.querySelector('.code-to-copy');
      const previewBtn = card.querySelector('.preview-btn');
      const collapseElement = card.querySelector('.code-collapse');
      const collapseInstance = bootstrap.Collapse.getOrCreateInstance(collapseElement, {
        toggle: false
      });

      previewBtn?.addEventListener('click', () => {
        collapseInstance.toggle();
      });

      copyCodeBtn?.addEventListener('click', () => {
        const el = document.createElement('textarea');
        el.value = copyCodeEl.innerHTML;
        document.body.appendChild(el);

        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        iconCopiedToast.querySelector(
          '.toast-body'
        ).innerHTML = `<code class='text-body-quaternary'>Code has been copied to clipboard.</code>`;
        iconCopiedToastInstance.show();
      });
    });
  };

  // import AnchorJS from 'anchor-js';

  const anchorJSInit = () => {
    const anchors = new window.AnchorJS({
      icon: '#'
    });
    anchors.add('[data-anchor]');
  };

  /* -------------------------------------------------------------------------- */
  /*                                 bigPicture                                 */
  /* -------------------------------------------------------------------------- */
  const bigPictureInit = () => {
    const { getData } = window.phoenix.utils;
    if (window.BigPicture) {
      const bpItems = document.querySelectorAll('[data-bigpicture]');
      bpItems.forEach(bpItem => {
        const userOptions = getData(bpItem, 'bigpicture');
        const defaultOptions = {
          el: bpItem,
          noLoader: true,
          allowfullscreen: true
        };
        const options = window._.merge(defaultOptions, userOptions);

        bpItem.addEventListener('click', () => {
          window.BigPicture(options);
        });
      });
    }
  };

  /* eslint-disable no-unused-expressions */
  /*-----------------------------------------------
  |   DomNode
  -----------------------------------------------*/
  class DomNode {
    constructor(node) {
      this.node = node;
    }

    addClass(className) {
      this.isValidNode() && this.node.classList.add(className);
    }

    removeClass(className) {
      this.isValidNode() && this.node.classList.remove(className);
    }

    toggleClass(className) {
      this.isValidNode() && this.node.classList.toggle(className);
    }

    hasClass(className) {
      this.isValidNode() && this.node.classList.contains(className);
    }

    data(key) {
      if (this.isValidNode()) {
        try {
          return JSON.parse(this.node.dataset[this.camelize(key)]);
        } catch (e) {
          return this.node.dataset[this.camelize(key)];
        }
      }
      return null;
    }

    attr(name) {
      return this.isValidNode() && this.node[name];
    }

    setAttribute(name, value) {
      this.isValidNode() && this.node.setAttribute(name, value);
    }

    removeAttribute(name) {
      this.isValidNode() && this.node.removeAttribute(name);
    }

    setProp(name, value) {
      this.isValidNode() && (this.node[name] = value);
    }

    on(event, cb) {
      this.isValidNode() && this.node.addEventListener(event, cb);
    }

    isValidNode() {
      return !!this.node;
    }

    // eslint-disable-next-line class-methods-use-this
    camelize(str) {
      const text = str.replace(/[-_\s.]+(.)?/g, (_, c) =>
        c ? c.toUpperCase() : ''
      );
      return `${text.substr(0, 1).toLowerCase()}${text.substr(1)}`;
    }
  }

  /*-----------------------------------------------
  |   Bulk Select
  -----------------------------------------------*/

  const elementMap = new Map();

  class BulkSelect {
    constructor(element, option) {
      this.element = element;
      this.option = {
        displayNoneClassName: 'd-none',
        ...option
      };
      elementMap.set(this.element, this);
    }

    // Static
    static getInstance(element) {
      if (elementMap.has(element)) {
        return elementMap.get(element);
      }
      return null;
    }

    init() {
      this.attachNodes();
      this.clickBulkCheckbox();
      this.clickRowCheckbox();
    }

    getSelectedRows() {
      return Array.from(this.bulkSelectRows)
        .filter(row => row.checked)
        .map(row => getData(row, 'bulk-select-row'));
    }

    attachNodes() {
      const { body, actions, replacedElement } = getData(
        this.element,
        'bulk-select'
      );

      this.actions = new DomNode(document.getElementById(actions));
      this.replacedElement = new DomNode(
        document.getElementById(replacedElement)
      );
      this.bulkSelectRows = document
        .getElementById(body)
        .querySelectorAll('[data-bulk-select-row]');
    }

    attachRowNodes(elms) {
      this.bulkSelectRows = elms;
    }

    clickBulkCheckbox() {
      // Handle click event in bulk checkbox
      this.element.addEventListener('click', () => {
        if (this.element.indeterminate === 'indeterminate') {
          this.actions.addClass(this.option.displayNoneClassName);
          this.replacedElement.removeClass(this.option.displayNoneClassName);

          this.removeBulkCheck();

          this.bulkSelectRows.forEach(el => {
            const rowCheck = new DomNode(el);
            rowCheck.checked = false;
            rowCheck.setAttribute('checked', false);
          });
          return;
        }

        this.toggleDisplay();
        this.bulkSelectRows.forEach(el => {
          el.checked = this.element.checked;
        });
      });
    }

    clickRowCheckbox() {
      // Handle click event in checkbox of each row
      this.bulkSelectRows.forEach(el => {
        const rowCheck = new DomNode(el);
        rowCheck.on('click', () => {
          if (this.element.indeterminate !== 'indeterminate') {
            this.element.indeterminate = true;
            this.element.setAttribute('indeterminate', 'indeterminate');
            this.element.checked = true;
            this.element.setAttribute('checked', true);

            this.actions.removeClass(this.option.displayNoneClassName);
            this.replacedElement.addClass(this.option.displayNoneClassName);
          }

          if ([...this.bulkSelectRows].every(element => element.checked)) {
            this.element.indeterminate = false;
            this.element.setAttribute('indeterminate', false);
          }

          if ([...this.bulkSelectRows].every(element => !element.checked)) {
            this.removeBulkCheck();
            this.toggleDisplay();
          }
        });
      });
    }

    removeBulkCheck() {
      this.element.indeterminate = false;
      this.element.removeAttribute('indeterminate');
      this.element.checked = false;
      this.element.setAttribute('checked', false);
    }

    toggleDisplay(replacedElement, actions) {
      if (replacedElement || actions) {
        replacedElement.classList.toggle(this.option.displayNoneClassName);
        actions.classList.toggle(this.option.displayNoneClassName);
      }
      this.actions.toggleClass(this.option.displayNoneClassName);
      this.replacedElement.toggleClass(this.option.displayNoneClassName);
    }

    deselectAll(replacedElement, actions) {
      this.removeBulkCheck();
      this.toggleDisplay(replacedElement, actions);
      this.bulkSelectRows.forEach(el => {
        el.checked = false;
        el.removeAttribute('checked');
      });
    }
  }

  const bulkSelectInit = () => {
    const bulkSelects = document.querySelectorAll('[data-bulk-select]');

    if (bulkSelects.length) {
      bulkSelects.forEach(el => {
        const bulkSelect = new BulkSelect(el);
        bulkSelect.init();
      });
    }
  };

  // import * as echarts from 'echarts';
  const { merge: merge$2 } = window._;

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
    chart.setOption(merge$2(getDefaultOptions(), userOptions));

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

  // import dayjs from 'dayjs';
  /* -------------------------------------------------------------------------- */
  /*                     Echart Bar Member info                                 */
  /* -------------------------------------------------------------------------- */

  const basicEchartsInit = () => {
    const { getColor, getData, getDates } = window.phoenix.utils;

    const $echartBasicCharts = document.querySelectorAll('[data-echarts]');
    $echartBasicCharts.forEach($echartBasicChart => {
      const userOptions = getData($echartBasicChart, 'echarts');
      const chart = window.echarts.init($echartBasicChart);
      const getDefaultOptions = () => ({
        color: getColor('primary'),
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
        xAxis: {
          type: 'category',
          data: getDates(
            new Date('5/1/2022'),
            new Date('5/7/2022'),
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
            interval: 6,
            showMinLabel: true,
            showMaxLabel: true,
            color: getColor('secondary-color')
          }
        },
        yAxis: {
          show: false,
          type: 'value',
          boundaryGap: false
        },
        series: [
          {
            type: 'bar',
            symbol: 'none'
          }
        ],
        grid: { left: 22, right: 22, top: 0, bottom: 20 }
      });
      echartSetOption(chart, userOptions, getDefaultOptions);
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                   choices                                   */
  /* -------------------------------------------------------------------------- */
  const choicesInit = () => {
    const { getData } = window.phoenix.utils;

    if (window.Choices) {
      const elements = document.querySelectorAll('[data-choices]');
      elements.forEach(item => {
        const userOptions = getData(item, 'options');
        const choices = new window.Choices(item, {
          itemSelectText: '',
          addItems: true,
          allowHTML: true,
          ...userOptions
        });

        const needsValidation = document.querySelectorAll('.needs-validation');

        needsValidation.forEach(validationItem => {
          const selectFormValidation = () => {
            validationItem.querySelectorAll('.choices').forEach(choicesItem => {
              const singleSelect = choicesItem.querySelector(
                '.choices__list--single'
              );
              const multipleSelect = choicesItem.querySelector(
                '.choices__list--multiple'
              );

              if (choicesItem.querySelector('[required]')) {
                if (singleSelect) {
                  if (
                    singleSelect
                      .querySelector('.choices__item--selectable')
                      ?.getAttribute('data-value') !== ''
                  ) {
                    choicesItem.classList.remove('invalid');
                    choicesItem.classList.add('valid');
                  } else {
                    choicesItem.classList.remove('valid');
                    choicesItem.classList.add('invalid');
                  }
                }
                // ----- for multiple select only ----------
                if (multipleSelect) {
                  const { selectedOptions } = item;
                  if (
                    selectedOptions.length > 0 &&
                    [...selectedOptions].some(opt => opt.value !== '')
                  ) {
                    choicesItem.classList.remove('invalid');
                    choicesItem.classList.add('valid');
                  } else {
                    choicesItem.classList.remove('valid');
                    choicesItem.classList.add('invalid');
                  }
                }

                // ------ select end ---------------
              }
            });
          };

          validationItem.addEventListener('submit', () => {
            selectFormValidation();
          });

          item.addEventListener('change', () => {
            selectFormValidation();
          });
        });

        return choices;
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Copy LinK                                 */
  /* -------------------------------------------------------------------------- */

  const copyLink = () => {
    const { getData } = window.phoenix.utils;

    const copyButtons = document.querySelectorAll('[data-copy]');

    copyButtons.forEach(button => {
      const tooltip = new window.bootstrap.Tooltip(button);

      button.addEventListener('mouseover', () => tooltip.show());
      button.addEventListener('mouseleave', () => tooltip.hide());

      button.addEventListener('click', () => {
        button.setAttribute('data-bs-original-title', 'Copied');
        tooltip.show();
        const inputID = getData(button, 'copy');
        const input = document.querySelector(inputID);
        input.select();
        navigator.clipboard.writeText(input.value);
        button.setAttribute('data-bs-original-title', 'click to copy');
      });
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Count Up                                  */
  /* -------------------------------------------------------------------------- */

  const countupInit = () => {
    const { getData } = window.phoenix.utils;
    if (window.countUp) {
      const countups = document.querySelectorAll('[data-countup]');
      countups.forEach(node => {
        const { endValue, ...options } = getData(node, 'countup');
        const countUp = new window.countUp.CountUp(node, endValue, {
          duration: 4,
          // suffix: '+',

          ...options
        });
        if (!countUp.error) {
          countUp.start();
        } else {
          console.error(countUp.error);
        }
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Detector                                  */
  /* -------------------------------------------------------------------------- */

  const detectorInit = () => {
    const { addClass } = window.phoenix.utils;
    const { is } = window;
    const html = document.querySelector('html');

    is.opera() && addClass(html, 'opera');
    is.mobile() && addClass(html, 'mobile');
    is.firefox() && addClass(html, 'firefox');
    is.safari() && addClass(html, 'safari');
    is.ios() && addClass(html, 'ios');
    is.iphone() && addClass(html, 'iphone');
    is.ipad() && addClass(html, 'ipad');
    is.ie() && addClass(html, 'ie');
    is.edge() && addClass(html, 'edge');
    is.chrome() && addClass(html, 'chrome');
    is.mac() && addClass(html, 'osx');
    is.windows() && addClass(html, 'windows');
    navigator.userAgent.match('CriOS') && addClass(html, 'chrome');
  };

  /* -------------------------------------------------------------------------- */
  /*                           Open dropdown on hover                           */
  /* -------------------------------------------------------------------------- */

  const dropdownOnHover = () => {
    const navbarArea = document.querySelector('[data-dropdown-on-hover]');

    if (navbarArea) {
      navbarArea.addEventListener('mouseover', e => {
        if (
          e.target?.classList.contains('dropdown-toggle') &&
          !e.target.parentNode.className.includes('dropdown-inside') &&
          window.innerWidth > 992
        ) {
          const dropdownInstance = new window.bootstrap.Dropdown(e.target);

          /* eslint-disable no-underscore-dangle */
          dropdownInstance._element.classList.add('show');
          dropdownInstance._menu.classList.add('show');
          dropdownInstance._menu.setAttribute('data-bs-popper', 'none');

          e.target.parentNode.addEventListener('mouseleave', () => {
            if (window.innerWidth > 992) {
              dropdownInstance.hide();
            }
          });
        }
      });
    }
  };

  /* eslint-disable */
  const { merge: merge$1 } = window._;

  /*-----------------------------------------------
  |   Dropzone
  -----------------------------------------------*/

  window.Dropzone ? (window.Dropzone.autoDiscover = false) : '';

  const dropzoneInit = () => {
    const { getData } = window.phoenix.utils;
    const Selector = {
      DROPZONE: '[data-dropzone]',
      DZ_ERROR_MESSAGE: '.dz-error-message',
      DZ_PREVIEW: '.dz-preview',
      DZ_PROGRESS: '.dz-preview .dz-preview-cover .dz-progress',
      DZ_PREVIEW_COVER: '.dz-preview .dz-preview-cover'
    };

    const ClassName = {
      DZ_FILE_PROCESSING: 'dz-file-processing',
      DZ_FILE_COMPLETE: 'dz-file-complete',
      DZ_COMPLETE: 'dz-complete',
      DZ_PROCESSING: 'dz-processing'
    };

    const DATA_KEY = {
      OPTIONS: 'options'
    };

    const Events = {
      ADDED_FILE: 'addedfile',
      REMOVED_FILE: 'removedfile',
      COMPLETE: 'complete'
    };

    const dropzones = document.querySelectorAll(Selector.DROPZONE);

    !!dropzones.length &&
      dropzones.forEach(item => {
        let userOptions = getData(item, DATA_KEY.OPTIONS);
        userOptions = userOptions ? userOptions : {};
        const data = userOptions.data ? userOptions.data : {};
        const options = merge$1(
          {
            url: '/assets/php/',
            addRemoveLinks: false,
            previewsContainer: item.querySelector(Selector.DZ_PREVIEW),
            previewTemplate: item.querySelector(Selector.DZ_PREVIEW).innerHTML,
            thumbnailWidth: null,
            thumbnailHeight: null,
            maxFilesize: 2,
            autoProcessQueue: false,
            filesizeBase: 1000,
            init: function init() {
              const thisDropzone = this;

              if (data.length) {
                data.forEach(v => {
                  const mockFile = { name: v.name, size: v.size };
                  thisDropzone.options.addedfile.call(thisDropzone, mockFile);
                  thisDropzone.options.thumbnail.call(
                    thisDropzone,
                    mockFile,
                    `${v.url}/${v.name}`
                  );
                });
              }

              thisDropzone.on(Events.ADDED_FILE, function addedfile() {
                if ('maxFiles' in userOptions) {
                  if (
                    userOptions.maxFiles === 1 &&
                    item.querySelectorAll(Selector.DZ_PREVIEW_COVER).length > 1
                  ) {
                    item.querySelector(Selector.DZ_PREVIEW_COVER).remove();
                  }
                  if (userOptions.maxFiles === 1 && this.files.length > 1) {
                    this.removeFile(this.files[0]);
                  }
                }
              });
            },
            error(file, message) {
              if (file.previewElement) {
                file.previewElement.classList.add('dz-error');
                if (typeof message !== 'string' && message.error) {
                  message = message.error;
                }
                for (let node of file.previewElement.querySelectorAll(
                  '[data-dz-errormessage]'
                )) {
                  node.textContent = message;
                }
              }
            }
          },
          userOptions
        );
        // eslint-disable-next-line
        item.querySelector(Selector.DZ_PREVIEW).innerHTML = '';

        const dropzone = new window.Dropzone(item, options);

        dropzone.on(Events.ADDED_FILE, () => {
          if (item.querySelector(Selector.DZ_PREVIEW_COVER)) {
            item
              .querySelector(Selector.DZ_PREVIEW_COVER)
              .classList.remove(ClassName.DZ_FILE_COMPLETE);
          }
          item.classList.add(ClassName.DZ_FILE_PROCESSING);
          // Kanban custom bg radio select
          document
            .querySelector('.kanban-custom-bg-radio')
            ?.setAttribute('checked', true);
        });
        dropzone.on(Events.REMOVED_FILE, () => {
          if (item.querySelector(Selector.DZ_PREVIEW_COVER)) {
            item
              .querySelector(Selector.DZ_PREVIEW_COVER)
              .classList.remove(ClassName.DZ_PROCESSING);
          }
          item.classList.add(ClassName.DZ_FILE_COMPLETE);
        });
        dropzone.on(Events.COMPLETE, () => {
          if (item.querySelector(Selector.DZ_PREVIEW_COVER)) {
            item
              .querySelector(Selector.DZ_PREVIEW_COVER)
              .classList.remove(ClassName.DZ_PROCESSING);
          }

          item.classList.add(ClassName.DZ_FILE_COMPLETE);
        });
      });
  };

  // import feather from 'feather-icons';
  /* -------------------------------------------------------------------------- */
  /*                            Feather Icons                                   */
  /* -------------------------------------------------------------------------- */

  const featherIconsInit = () => {
    if (window.feather) {
      window.feather.replace({
        width: '16px',
        height: '16px'
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Flatpickr                                 */
  /* -------------------------------------------------------------------------- */

  const flatpickrInit = () => {
    const { getData } = window.phoenix.utils;
    document.querySelectorAll('.datetimepicker').forEach(item => {
      const userOptions = getData(item, 'options');
      window.flatpickr(item, {
        nextArrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"/></svg>`,
        prevArrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"/></svg>`,
        locale: {
          firstDayOfWeek: 1,

          shorthand: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        },
        monthSelectorType: 'static',
        onDayCreate: (dObj, dStr, fp, dayElem) => {
          if (dayElem.dateObj.getDay() === 6 || dayElem.dateObj.getDay() === 0) {
            dayElem.className += ' weekend-days';
          }
        },
        ...userOptions
      });

      // datepicker.l10n.weekdays.shorthand = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                              Form Validation                               */
  /* -------------------------------------------------------------------------- */

  const formValidationInit = () => {
    const forms = document.querySelectorAll('.needs-validation');

    forms.forEach(form => {
      form.addEventListener(
        'submit',
        event => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        },
        false
      );
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Calendar                                 */

  /* -------------------------------------------------------------------------- */
  const renderCalendar = (el, option) => {
    const { merge } = window._;

    const options = merge(
      {
        initialView: 'dayGridMonth',
        weekNumberCalculation: 'ISO',
        editable: true,
        direction: document.querySelector('html').getAttribute('dir'),
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }
      },
      option
    );
    const calendar = new window.FullCalendar.Calendar(el, options);
    calendar.render();
    document
      .querySelector('.navbar-vertical-toggle')
      ?.addEventListener('navbar.vertical.toggle', () => calendar.updateSize());
    return calendar;
  };

  const fullCalendarInit = () => {
    const { getData } = window.phoenix.utils;

    const calendars = document.querySelectorAll('[data-calendar]');
    calendars.forEach(item => {
      const options = getData(item, 'calendar');
      renderCalendar(item, options);
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Glightbox                                */
  /* -------------------------------------------------------------------------- */

  const glightboxInit = () => {
    if (window.GLightbox) {
      window.GLightbox({
        selector: '[data-gallery]'
      });
    }
  };

  /*-----------------------------------------------
  |   Gooogle Map
  -----------------------------------------------*/

  function initMap() {
    const { getData } = window.phoenix.utils;
    const themeController = document.body;
    const $googlemaps = document.querySelectorAll('[data-googlemap]');
    if ($googlemaps.length && window.google) {
      const createControlBtn = (map, type) => {
        const controlButton = document.createElement('button');
        controlButton.classList.add(type);
        controlButton.innerHTML =
          type === 'zoomIn'
            ? '<span class="fas fa-plus text-body-emphasis"></span>'
            : '<span class="fas fa-minus text-body-emphasis"></span>';

        controlButton.addEventListener('click', () => {
          const zoom = map.getZoom();
          if (type === 'zoomIn') {
            map.setZoom(zoom + 1);
          }
          if (type === 'zoomOut') {
            map.setZoom(zoom - 1);
          }
        });

        return controlButton;
      };
      const mapStyles = {
        SnazzyCustomLight: [
          {
            featureType: 'administrative',
            elementType: 'all',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
              {
                visibility: 'on'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              {
                color: '#525b75'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.icon',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#ffffff'
              }
            ]
          },
          {
            featureType: 'administrative.province',
            elementType: 'geometry.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#E3E6ED'
              }
            ]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'labels',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [
              {
                color: '#eff2f6'
              }
            ]
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'all',
            stylers: [
              {
                visibility: 'on'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#eff2f6'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#9fa6bc'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#eff2f6'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#9fa6bc'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit.station.airport',
            elementType: 'geometry',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit.station.airport',
            elementType: 'labels',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
              {
                color: '#F5F7FA'
              }
            ]
          },
          {
            featureType: 'water',
            elementType: 'labels',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          }
        ],
        SnazzyCustomDark: [
          {
            featureType: 'administrative',
            elementType: 'all',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              {
                color: '#8a94ad'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.icon',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [
              { visibility: 'on' },
              {
                color: '#000000'
              }
            ]
          },
          {
            featureType: 'administrative.province',
            elementType: 'geometry.stroke',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ visibility: 'on' }, { color: '#222834' }]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ color: '#141824' }]
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'all',
            stylers: [
              {
                visibility: 'on'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#141824'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#525b75'
              }
            ]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#141824'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [
              {
                visibility: 'on'
              },
              {
                color: '#67718A'
              }
            ]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.stroke',
            stylers: [
              {
                visibility: 'off'
              }
            ]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.station.airport',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.station.airport',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f111a' }]
          },
          {
            featureType: 'water',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      $googlemaps.forEach(itm => {
        const latLng = getData(itm, 'latlng').split(',');
        const markerPopup = itm.innerHTML;
        const zoom = getData(itm, 'zoom');
        const mapElement = itm;
        const mapStyle = getData(itm, 'phoenixTheme');

        if (getData(itm, 'phoenixTheme') === 'streetview') {
          const pov = getData(itm, 'pov');
          const mapOptions = {
            position: { lat: Number(latLng[0]), lng: Number(latLng[1]) },
            pov,
            zoom,
            gestureHandling: 'none',
            scrollwheel: false
          };

          return new window.google.maps.StreetViewPanorama(
            mapElement,
            mapOptions
          );
        }

        const mapOptions = {
          zoom,
          minZoom: 1.2,
          clickableIcons: false,
          zoomControl: false,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.LEFT
          },
          scrollwheel: getData(itm, 'scrollwheel'),
          disableDefaultUI: true,
          center: new window.google.maps.LatLng(latLng[0], latLng[1]),
          styles:
            window.config.config.phoenixTheme === 'dark'
              ? mapStyles.SnazzyCustomDark
              : mapStyles[mapStyle || 'SnazzyCustomLight']
        };

        const map = new window.google.maps.Map(mapElement, mapOptions);
        const infoWindow = new window.google.maps.InfoWindow({
          content: markerPopup
        });

        // Create the DIV to hold the control.
        const controlDiv = document.createElement('div');
        controlDiv.classList.add('google-map-control-btn');
        // Create the control.
        const zoomInBtn = createControlBtn(map, 'zoomIn');
        const zoomOutBtn = createControlBtn(map, 'zoomOut');
        // Append the control to the DIV.
        controlDiv.appendChild(zoomInBtn);
        controlDiv.appendChild(zoomOutBtn);

        map.controls[window.google.maps.ControlPosition.LEFT].push(controlDiv);

        const marker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(latLng[0], latLng[1]),
          // icon,
          map
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        themeController &&
          themeController.addEventListener(
            'clickControl',
            ({ detail: { control, value } }) => {
              if (control === 'phoenixTheme') {
                map.set(
                  'styles',
                  value === 'dark'
                    ? mapStyles.SnazzyCustomDark
                    : mapStyles.SnazzyCustomLight
                );
              }
            }
          );

        // return null;
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           Icon copy to clipboard                           */
  /* -------------------------------------------------------------------------- */

  const iconCopiedInit = () => {
    const iconList = document.getElementById('icon-list');
    const iconCopiedToast = document.getElementById('icon-copied-toast');
    const iconCopiedToastInstance = new window.bootstrap.Toast(iconCopiedToast);

    if (iconList) {
      iconList.addEventListener('click', e => {
        const el = e.target;
        if (el.tagName === 'INPUT') {
          el.select();
          el.setSelectionRange(0, 99999);
          document.execCommand('copy');
          iconCopiedToast.querySelector(
            '.toast-body'
          ).innerHTML = `<span class="fw-black">Copied:</span>  <code>${el.value}</code>`;
          iconCopiedToastInstance.show();
        }
      });
    }
  };

  /*-----------------------------------------------
  |                     Isotope
  -----------------------------------------------*/

  const isotopeInit = () => {
    const { getData } = window.phoenix.utils;
    const Selector = {
      ISOTOPE_ITEM: '.isotope-item',
      DATA_ISOTOPE: '[data-sl-isotope]',
      DATA_FILTER: '[data-filter]',
      DATA_FILER_NAV: '[data-filter-nav]',
      DATA_GALLERY_COLUMN: '[data-gallery-column]'
    };

    const DATA_KEY = {
      ISOTOPE: 'sl-isotope'
    };
    const ClassName = {
      ACTIVE: 'active'
    };

    if (window.Isotope) {
      const masonryItems = document.querySelectorAll(Selector.DATA_ISOTOPE);
      const columnGallery = document.querySelector(Selector.DATA_GALLERY_COLUMN);
      if (masonryItems.length) {
        masonryItems.forEach(masonryItem => {
          window.imagesLoaded(masonryItem, () => {
            document.querySelectorAll(Selector.ISOTOPE_ITEM).forEach(item => {
              // eslint-disable-next-line no-param-reassign
              item.style.visibility = 'visible';
            });

            const userOptions = getData(masonryItem, DATA_KEY.ISOTOPE);
            const defaultOptions = {
              itemSelector: Selector.ISOTOPE_ITEM,
              layoutMode: 'packery'
            };

            const options = window._.merge(defaultOptions, userOptions);
            const isotope = new window.Isotope(masonryItem, options);
            const addSeparator = (count = 4) => {
              for (let i = 1; i < count; i += 1) {
                const separator = document.createElement('span');
                separator.classList.add(
                  `gallery-column-separator`,
                  `gallery-column-separator-${i}`
                );
                masonryItem.appendChild(separator);
              }
            };
            const removeSeparator = () => {
              document
                .querySelectorAll('span[class*="gallery-column-separator-"]')
                .forEach(separatorEle => separatorEle.remove());
            };
            if (columnGallery) addSeparator();
            // --------- filter -----------------
            const filterElement = document.querySelector(Selector.DATA_FILER_NAV);
            filterElement?.addEventListener('click', e => {
              const item = e.target.dataset.filter;
              isotope.arrange({ filter: item });
              document.querySelectorAll(Selector.DATA_FILTER).forEach(el => {
                el.classList.remove(ClassName.ACTIVE);
              });
              e.target.classList.add(ClassName.ACTIVE);
              const filteredItems = isotope.getFilteredItemElements();
              if (columnGallery) {
                removeSeparator();
              }
              setTimeout(() => {
                if (columnGallery) {
                  addSeparator(
                    filteredItems.length > 4 ? 4 : filteredItems.length
                  );
                }
                isotope.layout();
              }, 400);
            });
            // ---------- filter end ------------
            isotope.layout();
            return isotope;
          });
        });
      }
    }
  };

  /* eslint-disable no-unused-expressions */
  /* -------------------------------------------------------------------------- */
  /*                                 Data Table                                 */
  /* -------------------------------------------------------------------------- */
  /* eslint-disable no-param-reassign */
  const togglePaginationButtonDisable = (button, disabled) => {
    button.disabled = disabled;
    button.classList[disabled ? 'add' : 'remove']('disabled');
  };

  const listInit = () => {
    const { getData } = window.phoenix.utils;
    if (window.List) {
      const lists = document.querySelectorAll('[data-list]');

      if (lists.length) {
        lists.forEach(el => {
          const bulkSelect = el.querySelector('[data-bulk-select]');

          let options = getData(el, 'list');

          if (options.pagination) {
            options = {
              ...options,
              pagination: {
                item: `<li><button class='page' type='button'></button></li>`,
                ...options.pagination
              }
            };
          }

          const paginationButtonNext = el.querySelector(
            '[data-list-pagination="next"]'
          );
          const paginationButtonPrev = el.querySelector(
            '[data-list-pagination="prev"]'
          );
          const viewAll = el.querySelector('[data-list-view="*"]');
          const viewLess = el.querySelector('[data-list-view="less"]');
          const listInfo = el.querySelector('[data-list-info]');
          const listFilter = el.querySelector('[data-list-filter]');
          const list = new List(el, options);

          // ---------------------------------------

          let totalItem = list.items.length;
          const itemsPerPage = list.page;
          const btnDropdownClose = list.listContainer.querySelector('.btn-close');
          let pageQuantity = Math.ceil(list.size() / list.page);
          let pageCount = 1;
          let numberOfcurrentItems =
            (pageCount - 1) * Number(list.page) + list.visibleItems.length;
          let isSearching = false;

          btnDropdownClose &&
            btnDropdownClose.addEventListener('search.close', () => {
              list.fuzzySearch('');
            });

          const updateListControls = () => {
            listInfo &&
              (listInfo.innerHTML = `${list.i} to ${numberOfcurrentItems} <span class='text-body-tertiary'> Items of </span>${totalItem}`);

            paginationButtonPrev &&
              togglePaginationButtonDisable(
                paginationButtonPrev,
                pageCount === 1 || pageCount === 0
              );
            paginationButtonNext &&
              togglePaginationButtonDisable(
                paginationButtonNext,
                pageCount === pageQuantity || pageCount === 0
              );

            if (pageCount > 1 && pageCount < pageQuantity) {
              togglePaginationButtonDisable(paginationButtonNext, false);
              togglePaginationButtonDisable(paginationButtonPrev, false);
            }
          };

          // List info
          updateListControls();

          if (paginationButtonNext) {
            paginationButtonNext.addEventListener('click', e => {
              e.preventDefault();
              pageCount += 1;
              const nextInitialIndex = list.i + itemsPerPage;
              nextInitialIndex <= list.size() &&
                list.show(nextInitialIndex, itemsPerPage);
            });
          }

          if (paginationButtonPrev) {
            paginationButtonPrev.addEventListener('click', e => {
              e.preventDefault();
              pageCount -= 1;
              const prevItem = list.i - itemsPerPage;
              prevItem > 0 && list.show(prevItem, itemsPerPage);
            });
          }

          const toggleViewBtn = () => {
            viewLess.classList.toggle('d-none');
            viewAll.classList.toggle('d-none');
          };

          if (viewAll) {
            viewAll.addEventListener('click', () => {
              list.show(1, totalItem);
              pageCount = 1;
              toggleViewBtn();
            });
          }
          if (viewLess) {
            viewLess.addEventListener('click', () => {
              list.show(1, itemsPerPage);
              pageCount = 1;
              toggleViewBtn();
            });
          }
          // numbering pagination
          if (options.pagination) {
            el.querySelector('.pagination').addEventListener('click', e => {
              if (e.target.classList[0] === 'page') {
                const pageNum = Number(e.target.getAttribute('data-i'));
                if (pageNum) {
                  list.show(itemsPerPage * (pageNum - 1) + 1, list.page);
                  pageCount = pageNum;
                }
              }
            });
          }
          // filter
          if (options.filter) {
            const { key } = options.filter;
            listFilter.addEventListener('change', e => {
              list.filter(item => {
                if (e.target.value === '') {
                  return true;
                }
                pageQuantity = Math.ceil(list.matchingItems.length / list.page);
                pageCount = 1;
                updateListControls();
                return item
                  .values()
                  [key].toLowerCase()
                  .includes(e.target.value.toLowerCase());
              });
            });
          }

          // bulk-select
          if (bulkSelect) {
            const bulkSelectInstance =
              window.phoenix.BulkSelect.getInstance(bulkSelect);
            bulkSelectInstance.attachRowNodes(
              list.items.map(item =>
                item.elm.querySelector('[data-bulk-select-row]')
              )
            );

            bulkSelect.addEventListener('change', () => {
              if (list) {
                if (bulkSelect.checked) {
                  list.items.forEach(item => {
                    item.elm.querySelector(
                      '[data-bulk-select-row]'
                    ).checked = true;
                  });
                } else {
                  list.items.forEach(item => {
                    item.elm.querySelector(
                      '[data-bulk-select-row]'
                    ).checked = false;
                  });
                }
              }
            });
          }

          list.on('searchStart', () => {
            isSearching = true;
          });
          list.on('searchComplete', () => {
            isSearching = false;
          });

          list.on('updated', item => {
            if (!list.matchingItems.length) {
              pageQuantity = Math.ceil(list.size() / list.page);
            } else {
              pageQuantity = Math.ceil(list.matchingItems.length / list.page);
            }
            numberOfcurrentItems =
              (pageCount - 1) * Number(list.page) + list.visibleItems.length;
            updateListControls();

            // -------search-----------
            if (isSearching) {
              if (list.matchingItems.length === 0) {
                pageCount = 0;
              } else {
                pageCount = 1;
              }
              totalItem = list.matchingItems.length;
              numberOfcurrentItems =
                (pageCount === 0 ? 1 : pageCount - 1) * Number(list.page) +
                list.visibleItems.length;

              updateListControls();
              listInfo &&
                (listInfo.innerHTML = `${
                list.matchingItems.length === 0 ? 0 : list.i
              } to ${
                list.matchingItems.length === 0 ? 0 : numberOfcurrentItems
              } <span class='text-body-tertiary'> Items of </span>${
                list.matchingItems.length
              }`);
            }

            // -------fallback-----------
            const fallback =
              el.querySelector('.fallback') ||
              document.getElementById(options.fallback);

            if (fallback) {
              if (item.matchingItems.length === 0) {
                fallback.classList.remove('d-none');
              } else {
                fallback.classList.add('d-none');
              }
            }
          });
        });
      }
    }
  };

  const lottieInit = () => {
    const { getData } = window.phoenix.utils;
    const lotties = document.querySelectorAll('.lottie');
    if (lotties.length) {
      lotties.forEach(item => {
        const options = getData(item, 'options');
        window.bodymovin.loadAnimation({
          container: item,
          path: '../img/animated-icons/warning-light.json',
          renderer: 'svg',
          loop: true,
          autoplay: true,
          name: 'Hello World',
          ...options
        });
      });
    }
  };

  /* ----------------------------------------------------------------- */
  /*                               Modal                               */
  /* ----------------------------------------------------------------- */

  const modalInit = () => {
    const $modals = document.querySelectorAll('[data-phoenix-modal]');

    if ($modals) {
      const { getData, getCookie, setCookie } = window.phoenix.utils;
      $modals.forEach(modal => {
        const userOptions = getData(modal, 'phoenix-modal');
        const defaultOptions = {
          autoShow: false
        };
        const options = window._.merge(defaultOptions, userOptions);
        if (options.autoShow) {
          const autoShowModal = new window.bootstrap.Modal(modal);
          const disableModalBtn = modal.querySelector(
            '[data-disable-modal-auto-show]'
          );

          disableModalBtn.addEventListener('click', () => {
            const seconds = 24 * 60 * 60;
            setCookie('disableAutoShowModal', 'true', seconds);
          });

          const disableAutoShowModalCookie = getCookie('disableAutoShowModal');
          if (!disableAutoShowModalCookie) {
            autoShowModal.show();
          }
        } else {
          modal.addEventListener('shown.bs.modal', () => {
            const $autofocusEls = modal.querySelectorAll('[autofocus=autofocus]');
            $autofocusEls.forEach(el => {
              el.focus();
            });
          });
        }
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Navbar Combo Layout                            */
  /* -------------------------------------------------------------------------- */

  const navbarComboInit = () => {
    const { getBreakpoint, getData, addClass, hasClass, resize } =
      window.phoenix.utils;

    const Selector = {
      NAVBAR_VERTICAL: '.navbar-vertical',
      NAVBAR_TOP_COMBO: '[data-navbar-top="combo"]',
      COLLAPSE: '.collapse',
      DATA_MOVE_CONTAINER: '[data-move-container]',
      NAVBAR_NAV: '.navbar-nav',
      NAVBAR_VERTICAL_DIVIDER: '.navbar-vertical-divider'
    };

    const ClassName = {
      FLEX_COLUMN: 'flex-column'
    };

    const navbarVertical = document.querySelector(Selector.NAVBAR_VERTICAL);
    const navbarTopCombo = document.querySelector(Selector.NAVBAR_TOP_COMBO);

    const moveNavContent = windowWidth => {
      const navbarVerticalBreakpoint = getBreakpoint(navbarVertical);
      const navbarTopBreakpoint = getBreakpoint(navbarTopCombo);

      if (windowWidth < navbarTopBreakpoint) {
        const navbarCollapse = navbarTopCombo.querySelector(Selector.COLLAPSE);
        const navbarTopContent = navbarCollapse.innerHTML;

        if (navbarTopContent) {
          const targetID = getData(navbarTopCombo, 'move-target');
          const targetElement = document.querySelector(targetID);

          navbarCollapse.innerHTML = '';
          targetElement.insertAdjacentHTML(
            'afterend',
            `
            <div data-move-container class='move-container'>
              <div class='navbar-vertical-divider'>
                <hr class='navbar-vertical-hr' />
              </div>
              ${navbarTopContent}
            </div>
          `
          );

          if (navbarVerticalBreakpoint < navbarTopBreakpoint) {
            const navbarNav = document
              .querySelector(Selector.DATA_MOVE_CONTAINER)
              .querySelector(Selector.NAVBAR_NAV);
            addClass(navbarNav, ClassName.FLEX_COLUMN);
          }
        }
      } else {
        const moveableContainer = document.querySelector(
          Selector.DATA_MOVE_CONTAINER
        );
        if (moveableContainer) {
          const navbarNav = moveableContainer.querySelector(Selector.NAVBAR_NAV);
          hasClass(navbarNav, ClassName.FLEX_COLUMN) &&
            navbarNav.classList.remove(ClassName.FLEX_COLUMN);
          moveableContainer
            .querySelector(Selector.NAVBAR_VERTICAL_DIVIDER)
            .remove();
          navbarTopCombo.querySelector(Selector.COLLAPSE).innerHTML =
            moveableContainer.innerHTML;
          moveableContainer.remove();
        }
      }
    };

    moveNavContent(window.innerWidth);

    resize(() => moveNavContent(window.innerWidth));
  };

  const navbarShadowOnScrollInit = () => {
    const navbar = document.querySelector('[data-navbar-shadow-on-scroll]');
    if (navbar) {
      window.onscroll = () => {
        if (window.scrollY > 300) {
          navbar.classList.add('navbar-shadow');
        } else {
          navbar.classList.remove('navbar-shadow');
        }
      };
    }
  };

  const navbarInit = () => {
    const navbar = document.querySelector('[data-navbar-soft-on-scroll]');
    if (navbar) {
      const windowHeight = window.innerHeight;
      const handleAlpha = () => {
        const scrollTop = window.pageYOffset;
        let alpha = (scrollTop / windowHeight) * 2;
        alpha >= 1 && (alpha = 1);
        navbar.style.backgroundColor = `rgba(255, 255, 255, ${alpha})`;
      };
      handleAlpha();
      document.addEventListener('scroll', () => handleAlpha());
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               Navbar Vertical                              */
  /* -------------------------------------------------------------------------- */

  const handleNavbarVerticalCollapsed = () => {
    const { getItemFromStore, setItemToStore, resize } = window.phoenix.utils;
    const Selector = {
      HTML: 'html',
      BODY: 'body',
      NAVBAR_VERTICAL: '.navbar-vertical',
      NAVBAR_VERTICAL_TOGGLE: '.navbar-vertical-toggle',
      NAVBAR_VERTICAL_COLLAPSE: '.navbar-vertical .navbar-collapse',
      ACTIVE_NAV_LINK: '.navbar-vertical .nav-link.active'
    };

    const Events = {
      CLICK: 'click',
      MOUSE_OVER: 'mouseover',
      MOUSE_LEAVE: 'mouseleave',
      NAVBAR_VERTICAL_TOGGLE: 'navbar.vertical.toggle'
    };
    const ClassNames = {
      NAVBAR_VERTICAL_COLLAPSED: 'navbar-vertical-collapsed'
    };
    const navbarVerticalToggle = document.querySelector(
      Selector.NAVBAR_VERTICAL_TOGGLE
    );
    // const html = document.querySelector(Selector.HTML);
    const navbarVerticalCollapse = document.querySelector(
      Selector.NAVBAR_VERTICAL_COLLAPSE
    );
    const activeNavLinkItem = document.querySelector(Selector.ACTIVE_NAV_LINK);
    if (navbarVerticalToggle) {
      navbarVerticalToggle.addEventListener(Events.CLICK, e => {
        const isNavbarVerticalCollapsed = getItemFromStore(
          'phoenixIsNavbarVerticalCollapsed',
          false
        );
        navbarVerticalToggle.blur();
        document.documentElement.classList.toggle(
          ClassNames.NAVBAR_VERTICAL_COLLAPSED
        );

        // Set collapse state on localStorage
        setItemToStore(
          'phoenixIsNavbarVerticalCollapsed',
          !isNavbarVerticalCollapsed
        );

        const event = new CustomEvent(Events.NAVBAR_VERTICAL_TOGGLE);
        e.currentTarget?.dispatchEvent(event);
      });
    }
    if (navbarVerticalCollapse) {
      const isNavbarVerticalCollapsed = getItemFromStore(
        'phoenixIsNavbarVerticalCollapsed',
        false
      );
      if (activeNavLinkItem && !isNavbarVerticalCollapsed) {
        activeNavLinkItem.scrollIntoView({ behavior: 'smooth' });
      }
    }
    const setDocumentMinHeight = () => {
      const bodyHeight = document.querySelector(Selector.BODY).offsetHeight;
      const navbarVerticalHeight = document.querySelector(
        Selector.NAVBAR_VERTICAL
      )?.offsetHeight;

      if (
        document.documentElement.classList.contains(
          ClassNames.NAVBAR_VERTICAL_COLLAPSED
        ) &&
        bodyHeight < navbarVerticalHeight
      ) {
        document.documentElement.style.minHeight = `${navbarVerticalHeight}px`;
      } else {
        document.documentElement.removeAttribute('style');
      }
    };

    // set document min height for collapse vertical nav
    setDocumentMinHeight();
    resize(() => {
      setDocumentMinHeight();
    });
    if (navbarVerticalToggle) {
      navbarVerticalToggle.addEventListener('navbar.vertical.toggle', () => {
        setDocumentMinHeight();
      });
    }
  };

  /* eslint-disable no-new */
  /*-----------------------------------------------
  |                    Phoenix Offcanvas
  -----------------------------------------------*/

  const phoenixOffcanvasInit = () => {
    const { getData } = window.phoenix.utils;
    const toggleEls = document.querySelectorAll(
      "[data-phoenix-toggle='offcanvas']"
    );
    const offcanvasBackdrops = document.querySelectorAll(
      '[data-phoenix-backdrop]'
    );
    const offcanvasBodyScroll = document.querySelector('[data-phoenix-scroll]');
    const offcanvases = document.querySelectorAll('.phoenix-offcanvas');
    const offcanvasFaq = document.querySelector('.faq');
    const offcanvasFaqShow = document.querySelector('.faq-sidebar');

    if (offcanvases) {
      const breakpoints = {
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1540
      };

      window.addEventListener('resize', () => {
        offcanvases.forEach(offcanvas => {
          const offcanvasInstance = new window.bootstrap.Offcanvas(offcanvas);
          const breakpoint = offcanvas.getAttribute('data-breakpoint');
          const breakpointValue = breakpoints[breakpoint];
          if (window.innerWidth >= breakpointValue) {
            document.body.style.overflow = '';
            offcanvasInstance.hide();
          }
        });
      });
    }

    const showFilterCol = offcanvasEl => {
      offcanvasEl.classList.add('show');
      if (!offcanvasBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
    };
    const hideFilterCol = offcanvasEl => {
      offcanvasEl.classList.remove('show');
      document.body.style.removeProperty('overflow');
    };

    if (toggleEls) {
      toggleEls.forEach(toggleEl => {
        const offcanvasTarget = getData(toggleEl, 'phoenix-target');
        const offcanvasTargetEl = document.querySelector(offcanvasTarget);
        const closeBtn = offcanvasTargetEl.querySelectorAll(
          "[data-phoenix-dismiss='offcanvas']"
        );
        toggleEl.addEventListener('click', () => {
          showFilterCol(offcanvasTargetEl);
        });
        if (closeBtn) {
          closeBtn.forEach(el => {
            el.addEventListener('click', () => {
              hideFilterCol(offcanvasTargetEl);
            });
          });
        }
        if (offcanvasBackdrops) {
          offcanvasBackdrops.forEach(offcanvasBackdrop => {
            offcanvasBackdrop.addEventListener('click', () => {
              hideFilterCol(offcanvasTargetEl);
            });
          });
        }
      });
    }

    if (offcanvasFaq) {
      if (offcanvasFaqShow.classList.contains('show')) {
        offcanvasFaq.classList.add = 'newFaq';
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Popover                                  */
  /* -------------------------------------------------------------------------- */

  const picmoInit = () => {
    const { getData } = window.phoenix.utils;

    const picmoBtns = document.querySelectorAll('[data-picmo]');

    if (picmoBtns) {
      Array.from(picmoBtns).forEach(btn => {
        const options = getData(btn, 'picmo');

        const picker = window.picmoPopup.createPopup(
          {},
          {
            referenceElement: btn,
            triggerElement: btn,
            position: 'bottom-start',
            showCloseButton: false
          }
        );
        btn.addEventListener('click', () => {
          picker.toggle();
        });

        const input = document.querySelector(options.inputTarget);

        picker.addEventListener('emoji:select', selection => {
          if (input) {
            input.innerHTML += selection.emoji;
          }
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Popover                                  */
  /* -------------------------------------------------------------------------- */

  const popoverInit = () => {
    const popoverTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );

    popoverTriggerList.map(popoverTriggerEl => {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  };

  /* eslint-disable no-new */
  /*-----------------------------------------------
  |                    Swiper
  -----------------------------------------------*/

  const getThubmnailDirection = () => {
    if (
      window.innerWidth < 768 ||
      (window.innerWidth >= 992 && window.innerWidth < 1200)
    ) {
      return 'horizontal';
    }
    return 'vertical';
  };

  const productDetailsInit = () => {
    const { getData, resize } = window.phoenix.utils;
    const productDetailsEl = document.querySelector('[data-product-details]');
    if (productDetailsEl) {
      const colorVariantEl = productDetailsEl.querySelector(
        '[data-product-color]'
      );
      productDetailsEl.querySelector(
        '[data-product-quantity]'
      );
      const productQuantityInputEl = productDetailsEl.querySelector(
        '[data-quantity] input[type="number"]'
      );
      const productColorVariantConatiner = productDetailsEl.querySelector(
        '[data-product-color-variants]'
      );

      const swiperInit = productImages => {
        const productSwiper = productDetailsEl.querySelector(
          '[data-products-swiper]'
        );

        const options = getData(productSwiper, 'swiper');

        const thumbTarget = getData(productSwiper, 'thumb-target');

        const thumbEl = document.getElementById(thumbTarget);

        let slides = '';
        productImages.forEach(img => {
          slides += `
          <div class='swiper-slide '>
            <img class='w-100' src=${img} alt="">
          </div>
        `;
        });
        productSwiper.innerHTML = `<div class='swiper-wrapper'>${slides}</div>`;

        let thumbSlides = '';
        productImages.forEach(img => {
          thumbSlides += `
          <div class='swiper-slide '>
            <div class="product-thumb-container p-2 p-sm-3 p-xl-2">
              <img src=${img} alt="">
            </div>
          </div>
        `;
        });
        thumbEl.innerHTML = `<div class='swiper-wrapper'>${thumbSlides}</div>`;

        const thumbSwiper = new window.Swiper(thumbEl, {
          slidesPerView: 5,
          spaceBetween: 16,
          direction: getThubmnailDirection(),
          breakpoints: {
            768: {
              spaceBetween: 100
            },
            992: {
              spaceBetween: 16
            }
          }
        });

        const swiperNav = productSwiper.querySelector('.swiper-nav');

        resize(() => {
          thumbSwiper.changeDirection(getThubmnailDirection());
        });

        new Swiper(productSwiper, {
          ...options,
          navigation: {
            nextEl: swiperNav?.querySelector('.swiper-button-next'),
            prevEl: swiperNav?.querySelector('.swiper-button-prev')
          },
          thumbs: {
            swiper: thumbSwiper
          }
        });
      };

      const colorVariants =
        productColorVariantConatiner.querySelectorAll('[data-variant]');

      colorVariants.forEach(variant => {
        if (variant.classList.contains('active')) {
          swiperInit(getData(variant, 'products-images'));
          colorVariantEl.innerHTML = getData(variant, 'variant');
        }
        const productImages = getData(variant, 'products-images');

        variant.addEventListener('click', () => {
          swiperInit(productImages);
          colorVariants.forEach(colorVariant => {
            colorVariant.classList.remove('active');
          });
          variant.classList.add('active');
          colorVariantEl.innerHTML = getData(variant, 'variant');
        });
      });
      productQuantityInputEl.addEventListener('change', e => {
        if (e.target.value == '') {
          e.target.value = 0;
        }
      });
    }
  };

  /*-----------------------------------------------
  |  Quantity
  -----------------------------------------------*/
  const quantityInit = () => {
    const { getData } = window.phoenix.utils;
    const Selector = {
      DATA_QUANTITY_BTN: '[data-quantity] [data-type]',
      DATA_QUANTITY: '[data-quantity]',
      DATA_QUANTITY_INPUT: '[data-quantity] input[type="number"]'
    };

    const Events = {
      CLICK: 'click'
    };

    const Attributes = {
      MIN: 'min'
    };

    const DataKey = {
      TYPE: 'type'
    };

    const quantities = document.querySelectorAll(Selector.DATA_QUANTITY_BTN);

    quantities.forEach(quantity => {
      quantity.addEventListener(Events.CLICK, e => {
        const el = e.currentTarget;
        const type = getData(el, DataKey.TYPE);
        const numberInput = el
          .closest(Selector.DATA_QUANTITY)
          .querySelector(Selector.DATA_QUANTITY_INPUT);

        const min = numberInput.getAttribute(Attributes.MIN);
        let value = parseInt(numberInput.value, 10);

        if (type === 'plus') {
          value += 1;
        } else {
          value = value > min ? (value -= 1) : value;
        }
        numberInput.value = value;
      });
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                               Ratings                               */
  /* -------------------------------------------------------------------------- */

  const randomColorInit = () => {
    const { getData } = window.phoenix.utils;

    const randomColorElements = document.querySelectorAll('[data-random-color]');
    const defaultColors = [
      '#85A9FF',
      '#60C6FF',
      '#90D67F',
      '#F48270',
      '#3874FF',
      '#0097EB',
      '#25B003',
      '#EC1F00',
      '#E5780B',
      '#004DFF',
      '#0080C7',
      '#23890B',
      '#CC1B00',
      '#D6700A',
      '#222834',
      '#3E465B',
      '#6E7891',
      '#9FA6BC'
    ];

    randomColorElements.forEach(el => {
      const userColors = getData(el, 'random-color');
      let colors;
      if (Array.isArray(userColors)) {
        colors = [...defaultColors, ...userColors];
      } else {
        colors = [...defaultColors];
      }

      el.addEventListener('click', e => {
        const randomColor =
          colors[Math.floor(Math.random() * (colors.length - 1))];
        e.target.value = randomColor;
        const inputLabel = e.target.nextElementSibling;
        // e.target.nextElementSibling.style.boxShadow = `0 0 0 0.2rem ${randomColor}`;
        inputLabel.style.background = `${randomColor}`;
        inputLabel.style.borderColor = `${randomColor}`;
        inputLabel.style.color = `white`;
      });
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                               Ratings                               */
  /* -------------------------------------------------------------------------- */

  const ratingInit = () => {
    const { getData, getItemFromStore } = window.phoenix.utils;
    const raters = document.querySelectorAll('[data-rater]');

    raters.forEach(rater => {
      const options = {
        reverse: getItemFromStore('phoenixIsRTL'),
        starSize: 32,
        step: 0.5,
        element: rater,
        rateCallback(rating, done) {
          this.setRating(rating);
          done();
        },
        ...getData(rater, 'rater')
      };

      return window.raterJs(options);
    });
  };

  /*eslint-disable*/
  /*-----------------------------------------------
  |   Top navigation opacity on scroll
  -----------------------------------------------*/

  const responsiveNavItemsInit = () => {
    const { resize } = window.phoenix.utils;
    const Selector = {
      NAV_ITEM: '[data-nav-item]',
      NAVBAR: '[data-navbar]',
      DROPDOWN: '[data-more-item]',
      CATEGORY_LIST: '[data-category-list]',
      CATEGORY_BUTTON: '[data-category-btn]'
    };

    const navbarEl = document.querySelector(Selector.NAVBAR);

    const navbar = () => {
      const navbarWidth = navbarEl.clientWidth;
      const dropdown = navbarEl.querySelector(Selector.DROPDOWN);
      const dropdownWidth = dropdown.clientWidth;
      const navbarContainerWidth = navbarWidth - dropdownWidth;
      const elements = navbarEl.querySelectorAll(Selector.NAV_ITEM);
      const categoryBtn = navbarEl.querySelector(Selector.CATEGORY_BUTTON);
      const categoryBtnWidth = categoryBtn?.clientWidth;

      let totalItemsWidth = 0;
      dropdown.style.display = 'none';

      elements.forEach(item => {
        const itemWidth = item.clientWidth;

        totalItemsWidth = totalItemsWidth + itemWidth;

        if (
          totalItemsWidth + (categoryBtnWidth || 0) + dropdownWidth >
            navbarContainerWidth &&
          !item.classList.contains('dropdown')
        ) {
          dropdown.style.display = 'block';
          item.style.display = 'none';
          const link = item.firstChild;
          const linkItem = link.cloneNode(true);

          navbarEl.querySelector('.category-list').appendChild(linkItem);
        }
      });
      const dropdownMenu = navbarEl.querySelectorAll('.dropdown-menu .nav-link');

      dropdownMenu.forEach(item => {
        item.classList.remove('nav-link');
        item.classList.add('dropdown-item');
      });
    };

    if (navbarEl) {
      window.addEventListener('load', () => {
        navbar();
        // hideDropdown();
      });

      resize(() => {
        const navElements = navbarEl.querySelectorAll(Selector.NAV_ITEM);
        const dropElements = navbarEl.querySelectorAll(Selector.CATEGORY_LIST);

        navElements.forEach(item => item.removeAttribute('style'));
        dropElements.forEach(item => (item.innerHTML = ''));
        navbar();
        // hideDropdown();
      });

      const navbarLinks = navbarEl.querySelectorAll('.nav-link');

      navbarEl.addEventListener('click', function (e) {
        for (let x = 0; x < navbarLinks.length; x++) {
          navbarLinks[x].classList.remove('active');
        }
        if (e.target.closest('li')) {
          e.target.closest('li').classList.add('active');
        }
      });
    }
  };

  const searchInit = () => {
    const Selectors = {
      SEARCH_DISMISS: '[data-bs-dismiss="search"]',
      DROPDOWN_TOGGLE: '[data-bs-toggle="dropdown"]',
      DROPDOWN_MENU: '.dropdown-menu',
      SEARCH_BOX: '.search-box',
      SEARCH_INPUT: '.search-input',
      SEARCH_TOGGLE: '[data-bs-toggle="search"]'
    };

    const ClassName = {
      SHOW: 'show'
    };

    const Attribute = {
      ARIA_EXPANDED: 'aria-expanded'
    };

    const Events = {
      CLICK: 'click',
      FOCUS: 'focus',
      SHOW_BS_DROPDOWN: 'show.bs.dropdown',
      SEARCH_CLOSE: 'search.close'
    };

    const hideSearchSuggestion = searchArea => {
      const el = searchArea.querySelector(Selectors.SEARCH_TOGGLE);
      const dropdownMenu = searchArea.querySelector(Selectors.DROPDOWN_MENU);
      if (!el || !dropdownMenu) return;

      el.setAttribute(Attribute.ARIA_EXPANDED, 'false');
      el.classList.remove(ClassName.SHOW);
      dropdownMenu.classList.remove(ClassName.SHOW);
    };

    const searchAreas = document.querySelectorAll(Selectors.SEARCH_BOX);

    const hideAllSearchAreas = () => {
      searchAreas.forEach(hideSearchSuggestion);
    };

    searchAreas.forEach(searchArea => {
      const input = searchArea.querySelector(Selectors.SEARCH_INPUT);
      const btnDropdownClose = searchArea.querySelector(Selectors.SEARCH_DISMISS);
      const dropdownMenu = searchArea.querySelector(Selectors.DROPDOWN_MENU);

      if (input) {
        input.addEventListener(Events.FOCUS, () => {
          hideAllSearchAreas();
          const el = searchArea.querySelector(Selectors.SEARCH_TOGGLE);
          if (!el || !dropdownMenu) return;
          el.setAttribute(Attribute.ARIA_EXPANDED, 'true');
          el.classList.add(ClassName.SHOW);
          dropdownMenu.classList.add(ClassName.SHOW);
        });
      }

      document.addEventListener(Events.CLICK, ({ target }) => {
        !searchArea.contains(target) && hideSearchSuggestion(searchArea);
      });

      btnDropdownClose &&
        btnDropdownClose.addEventListener(Events.CLICK, e => {
          hideSearchSuggestion(searchArea);
          input.value = '';
          const event = new CustomEvent(Events.SEARCH_CLOSE);
          e.currentTarget.dispatchEvent(event);
        });
    });

    document.querySelectorAll(Selectors.DROPDOWN_TOGGLE).forEach(dropdown => {
      dropdown.addEventListener(Events.SHOW_BS_DROPDOWN, () => {
        hideAllSearchAreas();
      });
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                    Toast                                   */
  /* -------------------------------------------------------------------------- */

  const simplebarInit = () => {
    const scrollEl = Array.from(document.querySelectorAll('.scrollbar-overlay'));

    scrollEl.forEach(el => {
      return new window.SimpleBar(el);
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 SortableJS                                 */
  /* -------------------------------------------------------------------------- */

  const sortableInit = () => {
    const { getData } = window.phoenix.utils;

    const sortableEl = document.querySelectorAll('[data-sortable]');

    const defaultOptions = {
      animation: 150,
      group: {
        name: 'shared'
      },
      delay: 100,
      delayOnTouchOnly: true, // useful for mobile touch
      forceFallback: true, // * ignore the HTML5 DnD behaviour
      onStart() {
        document.body.classList.add('sortable-dragging'); // to add cursor grabbing
      },
      onEnd() {
        document.body.classList.remove('sortable-dragging');
      }
    };

    sortableEl.forEach(el => {
      const userOptions = getData(el, 'sortable');
      const options = window._.merge(defaultOptions, userOptions);

      return window.Sortable.create(el, options);
    });
  };

  const supportChatInit = () => {
    const supportChat = document.querySelector('.support-chat');
    const supportChatBtn = document.querySelectorAll('.btn-support-chat');
    const supportChatcontainer = document.querySelector(
      '.support-chat-container'
    );
    const { phoenixSupportChat } = window.config.config;

    if (phoenixSupportChat) {
      supportChatcontainer?.classList.add('show');
    }
    if (supportChatBtn) {
      supportChatBtn.forEach(item => {
        item.addEventListener('click', () => {
          supportChat.classList.toggle('show-chat');

          supportChatBtn[supportChatBtn.length - 1].classList.toggle(
            'btn-chat-close'
          );

          supportChatcontainer.classList.add('show');
        });
      });
    }
  };

  /* eslint-disable no-new */
  /*-----------------------------------------------
  |                    Swiper
  -----------------------------------------------*/

  const swiperInit = () => {
    const { getData } = window.phoenix.utils;
    const swiperContainers = document.querySelectorAll('.swiper-theme-container');
    if (swiperContainers) {
      swiperContainers.forEach(swiperContainer => {
        const swiper = swiperContainer.querySelector('[data-swiper]');
        const options = getData(swiper, 'swiper');
        const thumbsOptions = options.thumb;
        let thumbsInit;
        if (thumbsOptions) {
          const thumbImages = swiper.querySelectorAll('img');
          let slides = '';
          thumbImages.forEach(img => {
            slides += `
          <div class='swiper-slide'>
            <img class='img-fluid rounded mt-2' src=${img.src} alt=''/>
          </div>
        `;
          });

          const thumbs = document.createElement('div');
          thumbs.setAttribute('class', 'swiper thumb');
          thumbs.innerHTML = `<div class='swiper-wrapper'>${slides}</div>`;

          if (thumbsOptions.parent) {
            const parent = document.querySelector(thumbsOptions.parent);
            parent.parentNode.appendChild(thumbs);
          } else {
            swiper.parentNode.appendChild(thumbs);
          }

          thumbsInit = new window.Swiper(thumbs, thumbsOptions);
        }
        const swiperNav = swiperContainer.querySelector('.swiper-nav');
        new window.Swiper(swiper, {
          ...options,
          navigation: {
            nextEl: swiperNav?.querySelector('.swiper-button-next'),
            prevEl: swiperNav?.querySelector('.swiper-button-prev')
          },
          thumbs: {
            swiper: thumbsInit
          }
        });
        const gallerySlider = document.querySelector('.swiper-slider-gallery');
        if (gallerySlider) {
          window.addEventListener('resize', () => {
            thumbsInit.update();
          });
        }
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                Theme Control                               */
  /* -------------------------------------------------------------------------- */
  /* eslint-disable no-param-reassign */
  /* eslint-disable */
  const { config } = window.config;

  const initialDomSetup = element => {
    const { getData, getItemFromStore, getSystemTheme } = window.phoenix.utils;
    if (!element) return;

    element.querySelectorAll('[data-theme-control]').forEach(el => {
      const inputDataAttributeValue = getData(el, 'theme-control');
      const localStorageValue = getItemFromStore(inputDataAttributeValue);

      // diable horizontal navbar shape for dual nav
      if (
        inputDataAttributeValue === 'phoenixNavbarTopShape' &&
        getItemFromStore('phoenixNavbarPosition') === 'dual-nav'
      ) {
        el.setAttribute('disabled', true);
      }

      // diable navbar vertical style for horizontal & dual navbar
      const currentNavbarPosition = getItemFromStore('phoenixNavbarPosition');
      const isHorizontalOrDualNav =
        currentNavbarPosition === 'horizontal' ||
        currentNavbarPosition === 'dual-nav';
      if (
        inputDataAttributeValue === 'phoenixNavbarVerticalStyle' &&
        isHorizontalOrDualNav
      ) {
        el.setAttribute('disabled', true);
      }

      if (el.type === 'checkbox') {
        if (inputDataAttributeValue === 'phoenixTheme') {
          if (
            localStorageValue === 'auto'
              ? getSystemTheme() === 'dark'
              : localStorageValue === 'dark'
          ) {
            el.setAttribute('checked', true);
          }
        } else {
          localStorageValue && el.setAttribute('checked', true);
        }
      } else if (
        el.type === 'radio' &&
        inputDataAttributeValue === 'phoenixNavbarVerticalStyle'
      ) {
        localStorageValue === 'darker' &&
          el.value === 'darker' &&
          el.setAttribute('checked', true);
        localStorageValue === 'default' &&
          el.value === 'default' &&
          el.setAttribute('checked', true);
      } else if (
        el.type === 'radio' &&
        inputDataAttributeValue === 'phoenixNavbarTopShape'
      ) {
        localStorageValue === 'slim' &&
          el.value === 'slim' &&
          el.setAttribute('checked', true);
        localStorageValue === 'default' &&
          el.value === 'default' &&
          el.setAttribute('checked', true);
      } else if (
        el.type === 'radio' &&
        inputDataAttributeValue === 'phoenixNavbarTopStyle'
      ) {
        localStorageValue === 'darker' &&
          el.value === 'darker' &&
          el.setAttribute('checked', true);
        localStorageValue === 'default' &&
          el.value === 'default' &&
          el.setAttribute('checked', true);
      } else if (
        el.type === 'radio' &&
        inputDataAttributeValue === 'phoenixTheme'
      ) {
        const isChecked = localStorageValue === el.value;
        isChecked && el.setAttribute('checked', true);
      } else if (
        el.type === 'radio' &&
        inputDataAttributeValue === 'phoenixNavbarPosition'
      ) {
        const isChecked = localStorageValue === el.value;
        isChecked && el.setAttribute('checked', true);
      } else {
        const isActive = localStorageValue === el.value;
        isActive && el.classList.add('active');
      }
    });
  };

  const changeTheme = element => {
    const { getData, getItemFromStore, getSystemTheme } = window.phoenix.utils;

    element
      .querySelectorAll('[data-theme-control = "phoenixTheme"]')
      .forEach(el => {
        const inputDataAttributeValue = getData(el, 'theme-control');
        const localStorageValue = getItemFromStore(inputDataAttributeValue);

        if (el.type === 'checkbox') {
          if (localStorageValue === 'auto') {
            getSystemTheme() === 'dark'
              ? (el.checked = true)
              : (el.checked = false);
          } else {
            localStorageValue === 'dark'
              ? (el.checked = true)
              : (el.checked = false);
          }
        } else if (el.type === 'radio') {
          localStorageValue === el.value
            ? (el.checked = true)
            : (el.checked = false);
        } else {
          localStorageValue === el.value
            ? el.classList.add('active')
            : el.classList.remove('active');
        }
      });
  };

  const handleThemeDropdownIcon = value => {
    document.querySelectorAll('[data-theme-dropdown-toggle-icon]').forEach(el => {
      el.classList.toggle(
        'd-none',
        value !== el.getAttribute('data-theme-dropdown-toggle-icon')
        // value !== getData(el, 'theme-dropdown-toggle-icon')
      );
    });
  };

  handleThemeDropdownIcon(localStorage.getItem('phoenixTheme'));

  const themeControl = () => {
    const { getData, getItemFromStore, getSystemTheme } = window.phoenix.utils;
    // handleThemeDropdownIcon(
    //   window.phoenix.utils.getItemFromStore('phoenixTheme'),
    //   getData
    // );

    const handlePageUrl = el => {
      const pageUrl = getData(el, 'page-url');
      if (pageUrl) {
        window.location.replace(pageUrl);
      } else {
        window.location.reload();
      }
    };

    const themeController = new DomNode(document.body);

    const navbarVertical = document.querySelector('.navbar-vertical');
    const navbarTop = document.querySelector('.navbar-top');
    const supportChat = document.querySelector('.support-chat-container');
    initialDomSetup(themeController.node);

    themeController.on('click', e => {
      const target = new DomNode(e.target);

      if (target.data('theme-control')) {
        const control = target.data('theme-control');

        let value = e.target[e.target.type === 'checkbox' ? 'checked' : 'value'];

        if (control === 'phoenixTheme') {
          typeof value === 'boolean' && (value = value ? 'dark' : 'light');
        }

        // config.hasOwnProperty(control) && setItemToStore(control, value);
        config.hasOwnProperty(control) &&
          window.config.set({
            [control]: value
          });

        const params = new URLSearchParams(window.location.search);
        const isThemeControlTrue = params.get('theme-control') === 'true';
        if (isThemeControlTrue) {
          window.history.replaceState(null, null, window.location.pathname);
        }

        switch (control) {
          case 'phoenixTheme': {
            document.documentElement.setAttribute(
              'data-bs-theme',
              value === 'auto' ? getSystemTheme() : value
            );
            // document.documentElement.classList[
            //   value === 'dark' ? 'add' : 'remove'
            // ]('dark');
            const clickControl = new CustomEvent('clickControl', {
              detail: { control, value }
            });
            e.currentTarget.dispatchEvent(clickControl);
            changeTheme(themeController.node);
            break;
          }
          case 'phoenixNavbarVerticalStyle': {
            navbarVertical.setAttribute('data-navbar-appearance', 'default');
            if (value !== 'default') {
              navbarVertical.setAttribute('data-navbar-appearance', 'darker');
            }
            break;
          }
          case 'phoenixNavbarTopStyle': {
            navbarTop.setAttribute('data-navbar-appearance', 'default');
            if (value !== 'default') {
              navbarTop.setAttribute('data-navbar-appearance', 'darker');
            }
            break;
          }
          case 'phoenixNavbarTopShape':
            {
              if (getItemFromStore('phoenixNavbarPosition') === 'dual-nav') {
                el.setAttribute('disabled', true);
                // document.documentElement.setAttribute("data-bs-theme", value);
              } else handlePageUrl(target.node);
            }
            break;
          case 'phoenixNavbarPosition':
            {
              handlePageUrl(target.node);
            }

            break;
          case 'phoenixIsRTL':
            {
              // localStorage.setItem('phoenixIsRTL', target.node.checked);
              window.config.set({
                phoenixIsRTL: target.node.checked
              });
              window.location.reload();
            }
            break;

          case 'phoenixSupportChat': {
            supportChat?.classList.remove('show');
            if (value) {
              supportChat?.classList.add('show');
            }
            break;
          }

          case 'reset': {
            window.config.reset();
            window.location.reload();
            break;
          }

          default: {
            window.location.reload();
          }
        }
      }
    });

    themeController.on('clickControl', ({ detail: { control, value } }) => {
      if (control === 'phoenixTheme') {
        handleThemeDropdownIcon(value);
      }
    });
  };

  const { merge } = window._;

  /* -------------------------------------------------------------------------- */
  /*                                   Tinymce                                  */
  /* -------------------------------------------------------------------------- */

  const tinymceInit = () => {
    const { getColor, getData, getItemFromStore } = window.phoenix.utils;

    const tinymces = document.querySelectorAll('[data-tinymce]');

    if (window.tinymce) {
      // const wrapper = document.querySelector('.tox-sidebar-wrap');
      tinymces.forEach(tinymceEl => {
        const userOptions = getData(tinymceEl, 'tinymce');
        const options = merge(
          {
            selector: '.tinymce',
            height: '50vh',
            skin: 'oxide',
            menubar: false,
            content_style: `
        .mce-content-body { 
          color: ${getColor('emphasis-color')};
          background-color: ${getColor('tinymce-bg')};
        }
        .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
          color: ${getColor('quaternary-color')};
          font-weight: 400;
          font-size: 12.8px;
        }
        `,
            // mobile: {
            //   theme: 'mobile',
            //   toolbar: ['undo', 'bold']
            // },
            statusbar: false,
            plugins: 'link,image,lists,table,media',
            theme_advanced_toolbar_align: 'center',
            directionality: getItemFromStore('phoenixIsRTL') ? 'rtl' : 'ltr',
            toolbar: [
              { name: 'history', items: ['undo', 'redo'] },
              {
                name: 'formatting',
                items: ['bold', 'italic', 'underline', 'strikethrough']
              },
              {
                name: 'alignment',
                items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify']
              },
              { name: 'list', items: ['numlist', 'bullist'] },
              { name: 'link', items: ['link'] }
            ],
            setup: editor => {
              editor.on('focus', () => {
                const wraper = document.querySelector('.tox-sidebar-wrap');
                wraper.classList.add('editor-focused');
              });
              editor.on('blur', () => {
                const wraper = document.querySelector('.tox-sidebar-wrap');
                wraper.classList.remove('editor-focused');
              });
            }
          },
          userOptions
        );
        window.tinymce.init(options);
      });

      const themeController = document.body;
      if (themeController) {
        themeController.addEventListener(
          'clickControl',
          ({ detail: { control } }) => {
            if (control === 'phoenixTheme') {
              tinymces.forEach(tinymceEl => {
                const instance = window.tinymce.get(tinymceEl.id);
                instance.dom.addStyle(
                  `.mce-content-body{
                  color: ${getColor('emphasis-color')} !important;
                  background-color: ${getColor('tinymce-bg')} !important;
                }`
                );
              });
            }
          }
        );
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    Toast                                   */
  /* -------------------------------------------------------------------------- */

  const toastInit = () => {
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.map(toastEl => new bootstrap.Toast(toastEl));

    const liveToastBtn = document.getElementById('liveToastBtn');

    if (liveToastBtn) {
      const liveToast = new bootstrap.Toast(document.getElementById('liveToast'));

      liveToastBtn.addEventListener('click', () => {
        liveToast && liveToast.show();
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    TODO Offacanvas                                   */
  /* -------------------------------------------------------------------------- */

  const todoOffcanvasInit = () => {
    const { getData } = window.phoenix.utils;

    const stopPropagationElements = document.querySelectorAll(
      '[data-event-propagation-prevent]'
    );

    if (stopPropagationElements) {
      stopPropagationElements.forEach(el => {
        el.addEventListener('click', e => {
          e.stopPropagation();
        });
      });
    }

    const todoList = document.querySelector('.todo-list');

    if (todoList) {
      const offcanvasToggles = todoList.querySelectorAll(
        '[data-todo-offcanvas-toogle]'
      );

      offcanvasToggles.forEach(toggle => {
        const target = getData(toggle, 'todo-offcanvas-target');
        const offcanvasEl = todoList.querySelector(`#${target}`);
        const todoOffcanvas = new window.bootstrap.Offcanvas(offcanvasEl, {
          backdrop: true
        });
        toggle.addEventListener('click', () => {
          todoOffcanvas.show();
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Tooltip                                  */
  /* -------------------------------------------------------------------------- */
  const tooltipInit = () => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.map(
      tooltipTriggerEl =>
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover'
        })
    );
  };

  /* eslint-disable no-restricted-syntax */
  /* -------------------------------------------------------------------------- */
  /*                                 step wizard                                */
  /* -------------------------------------------------------------------------- */
  const wizardInit = () => {
    const { getData } = window.phoenix.utils;

    const selectors = {
      WIZARDS: '[data-theme-wizard]',
      TOGGLE_BUTTON_EL: '[data-wizard-step]',
      FORMS: '[data-wizard-form]',
      PASSWORD_INPUT: '[data-wizard-password]',
      CONFIRM_PASSWORD_INPUT: '[data-wizard-confirm-password]',
      NEXT_BTN: '[data-wizard-next-btn]',
      PREV_BTN: '[data-wizard-prev-btn]',
      FOOTER: '[data-wizard-footer]'
    };

    const events = {
      SUBMIT: 'submit',
      SHOW: 'show.bs.tab',
      SHOWN: 'shown.bs.tab',
      CLICK: 'click'
    };

    const wizards = document.querySelectorAll(selectors.WIZARDS);

    wizards.forEach(wizard => {
      const tabToggleButtonEl = wizard.querySelectorAll(
        selectors.TOGGLE_BUTTON_EL
      );
      const forms = wizard.querySelectorAll(selectors.FORMS);
      const passwordInput = wizard.querySelector(selectors.PASSWORD_INPUT);
      const confirmPasswordInput = wizard.querySelector(
        selectors.CONFIRM_PASSWORD_INPUT
      );
      const nextButton = wizard.querySelector(selectors.NEXT_BTN);
      const prevButton = wizard.querySelector(selectors.PREV_BTN);
      const wizardFooter = wizard.querySelector(selectors.FOOTER);
      const submitEvent = new Event(events.SUBMIT, {
        bubbles: true,
        cancelable: true
      });
      const hasWizardModal = wizard.hasAttribute('data-wizard-modal-disabled');

      const tabs = Array.from(tabToggleButtonEl).map(item => {
        return window.bootstrap.Tab.getOrCreateInstance(item);
      });
      // console.log({ tabs });

      let count = 0;
      let showEvent = null;

      forms.forEach(form => {
        form.addEventListener(events.SUBMIT, e => {
          e.preventDefault();
          if (form.classList.contains('needs-validation')) {
            if (passwordInput && confirmPasswordInput) {
              if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Invalid field.');
              } else {
                confirmPasswordInput.setCustomValidity('');
              }
            }
            if (!form.checkValidity()) {
              showEvent.preventDefault();
              return false;
            }
          }
          count += 1;
          return null;
        });
      });

      nextButton.addEventListener(events.CLICK, () => {
        if (count + 1 < tabs.length) {
          tabs[count + 1].show();
        }
      });

      if (prevButton) {
        prevButton.addEventListener(events.CLICK, () => {
          count -= 1;
          tabs[count].show();
        });
      }

      if (tabToggleButtonEl.length) {
        tabToggleButtonEl.forEach((item, index) => {
          item.addEventListener(events.SHOW, e => {
            const step = getData(item, 'wizard-step');
            showEvent = e;
            if (step > count) {
              forms[count].dispatchEvent(submitEvent);
            }
          });
          item.addEventListener(events.SHOWN, () => {
            count = index;
            // can't go back tab
            if (count === tabToggleButtonEl.length - 1 && !hasWizardModal) {
              tabToggleButtonEl.forEach(tab => {
                tab.setAttribute('data-bs-toggle', 'modal');
                tab.setAttribute('data-bs-target', '#error-modal');
              });
            }
            // add done class
            for (let i = 0; i < count; i += 1) {
              tabToggleButtonEl[i].classList.add('done');
              if (i > 0) {
                tabToggleButtonEl[i - 1].classList.add('complete');
              }
            }
            // remove done class
            for (let j = count; j < tabToggleButtonEl.length; j += 1) {
              tabToggleButtonEl[j].classList.remove('done');
              if (j > 0) {
                tabToggleButtonEl[j - 1].classList.remove('complete');
              }
            }

            // card footer remove at last step
            if (count > tabToggleButtonEl.length - 2) {
              wizardFooter.classList.add('d-none');
            } else {
              wizardFooter.classList.remove('d-none');
            }
            // prev-button removing
            if (prevButton) {
              if (count > 0 && count !== tabToggleButtonEl.length - 1) {
                prevButton.classList.remove('d-none');
              } else {
                prevButton.classList.add('d-none');
              }
            }
          });
        });
      }
    });
  };

  const faqTabInit = () => {
    const triggerEls = document.querySelectorAll('[data-vertical-category-tab]');
    const offcanvasEle = document.querySelector(
      '[data-vertical-category-offcanvas]'
    );
    const filterEles = document.querySelectorAll('[data-category-filter]');
    const faqSubcategoryTabs = document.querySelectorAll(
      '.faq-subcategory-tab .nav-item'
    );

    if (offcanvasEle) {
      const offcanvas =
        window.bootstrap.Offcanvas?.getOrCreateInstance(offcanvasEle);

      triggerEls.forEach(el => {
        el.addEventListener('click', () => {
          offcanvas.hide();
        });
      });
    }

    if (filterEles) {
      filterEles.forEach(el => {
        if (el.classList.contains('active')) {
          faqSubcategoryTabs.forEach(item => {
            if (
              !item.classList.contains(el.getAttribute('data-category-filter')) &&
              el.getAttribute('data-category-filter') !== 'all'
            ) {
              item.classList.add('d-none');
            }
          });
        }
        el.addEventListener('click', () => {
          faqSubcategoryTabs.forEach(item => {
            if (el.getAttribute('data-category-filter') === 'all') {
              item.classList.remove('d-none');
            } else if (
              !item.classList.contains(el.getAttribute('data-category-filter'))
            ) {
              item.classList.add('d-none');
            }
          });
        });
      });
    }
  };

  const twoFAVerificarionInit = () => {
    const verificationForm = document.querySelector('[data-2fa-form]');
    const inputFields = verificationForm?.querySelectorAll('input[type=number]');
    const varificationBtn = verificationForm?.querySelector(
      'button[type=submit]'
    );

    if (verificationForm) {
      window.addEventListener('load', () => inputFields[0].focus());
      const totalInputLength = 6;
      inputFields.forEach((input, index) => {
        input.addEventListener('keyup', e => {
          const { value } = e.target;
          if (value) {
            [...value].slice(0, totalInputLength).forEach((char, charIndex) => {
              if (inputFields && inputFields[index + charIndex]) {
                inputFields[index + charIndex].value = char;
                inputFields[index + charIndex + 1]?.focus();
              }
            });
          } else {
            inputFields[index].value = '';
            inputFields[index - 1]?.focus();
          }
          const inputs = [...inputFields];
          const updatedOtp = inputs.reduce(
            (acc, inputData) => acc + (inputData?.value || ''),
            ''
          );
          if (totalInputLength === updatedOtp.length) {
            varificationBtn.removeAttribute('disabled');
          } else {
            varificationBtn.setAttribute('disabled', true);
          }
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               mapbox                                   */
  /* -------------------------------------------------------------------------- */

  const mapboxInit = () => {
    const { getData } = window.phoenix.utils;
    const mapboxContainers = document.querySelectorAll('.mapbox-container');
    const mapContainerTab = document.querySelectorAll('[data-tab-map-container]');
    if (mapboxContainers) {
      mapboxContainers.forEach(mapboxContainer => {
        window.mapboxgl.accessToken =
          'pk.eyJ1IjoidGhlbWV3YWdvbiIsImEiOiJjbGhmNW5ybzkxcmoxM2RvN2RmbW1nZW90In0.hGIvQ890TYkZ948MVrsMIQ';

        const mapbox = mapboxContainer.querySelector('[data-mapbox]');
        if (mapbox) {
          const options = getData(mapbox, 'mapbox');

          const zoomIn = document.querySelector('.zoomIn');
          const zoomOut = document.querySelector('.zoomOut');
          const fullScreen = document.querySelector('.fullScreen');

          const styles = {
            default: 'mapbox://styles/mapbox/light-v11',
            light: 'mapbox://styles/themewagon/clj57pads001701qo25756jtw',
            dark: 'mapbox://styles/themewagon/cljzg9juf007x01pk1bepfgew'
          };

          const map = new window.mapboxgl.Map({
            ...options,
            container: 'mapbox',
            style: styles[window.config.config.phoenixTheme]
          });

          if (options.center) {
            new window.mapboxgl.Marker({
              color: getColor('danger')
            })
              .setLngLat(options.center)
              .addTo(map);
          }

          if (zoomIn && zoomOut) {
            zoomIn.addEventListener('click', () => map.zoomIn());
            zoomOut.addEventListener('click', () => map.zoomOut());
          }
          if (fullScreen) {
            fullScreen.addEventListener('click', () =>
              map.getContainer().requestFullscreen()
            );
          }

          mapContainerTab.forEach(ele => {
            ele.addEventListener('shown.bs.tab', () => {
              map.resize();
            });
          });
        }
      });
    }
  };

  const themeController = document.body;
  if (themeController) {
    themeController.addEventListener('clickControl', () => {
      mapboxInit();
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Typed Text                                 */
  /* -------------------------------------------------------------------------- */

  const typedTextInit = () => {
    const typedTexts = document.querySelectorAll('.typed-text');
    if (typedTexts.length && window.Typed) {
      typedTexts.forEach(typedText => {
        return new window.Typed(typedText, {
          strings: getData(typedText, 'typedText'),
          typeSpeed: 70,
          backSpeed: 70,
          loop: true,
          backDelay: 1000
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               price tier form                                   */
  /* -------------------------------------------------------------------------- */

  const priceTierFormInit = () => {
    const priceTierForms = document.querySelectorAll('[data-form-price-tier]');
    if (priceTierForms) {
      priceTierForms.forEach(priceTierForm => {
        const priceToggler = priceTierForm.querySelector('[data-price-toggle]');
        const pricings = priceTierForm.querySelectorAll('[data-pricing]');
        const bottomOption = priceTierForm.querySelector(
          '[data-pricing-collapse]'
        );

        const pricingCollapse = new window.bootstrap.Collapse(bottomOption, {
          toggle: false
        });

        priceToggler.addEventListener('change', e => {
          pricings[0].checked = true;
          if (e.target.checked) {
            priceTierForm.classList.add('active');
          } else {
            priceTierForm.classList.remove('active');
            pricingCollapse.hide();
          }
        });
        pricings.forEach(pricing => {
          pricing.addEventListener('change', e => {
            if (e.target.value === 'paid') {
              pricingCollapse.show();
            } else {
              pricingCollapse.hide();
            }
          });
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               noUiSlider                                   */
  /* -------------------------------------------------------------------------- */
  const nouisliderInit = () => {
    const { getData } = window.phoenix.utils;
    if (window.noUiSlider) {
      const elements = document.querySelectorAll('[data-nouislider]');
      elements.forEach(item => {
        const userOptions = getData(item, 'nouislider');
        const sliderValues = getData(item, 'nouislider-values');
        let defaultOptions;
        if (sliderValues && sliderValues.length) {
          defaultOptions = {
            connect: true,
            step: 1,
            range: { min: 0, max: sliderValues.length - 1 },
            tooltips: true,
            format: {
              to(value) {
                return sliderValues[Math.round(value)];
              },
              from(value) {
                return sliderValues.indexOf(value);
              }
            }
          };
        } else {
          defaultOptions = {
            start: [10],
            connect: [true, false],
            step: 1,
            range: { min: [0], max: [100] },
            tooltips: true
          };
        }
        const options = window._.merge(defaultOptions, userOptions);
        window.noUiSlider.create(item, { ...options });
      });
    }
  };

  const collapseAllInit = () => {
    const collapseParent = document.querySelector('[data-collapse-all]');
    const collapseBtn = document.querySelector('[data-btn-collapse-all]');
    if (collapseParent) {
      const collapseElements = collapseParent.querySelectorAll('.collapse');
      collapseElements.forEach(ele => {
        const collapse = window.bootstrap.Collapse.getOrCreateInstance(ele, {
          toggle: false
        });
        collapseBtn.addEventListener('click', () => {
          collapse.hide();
        });
      });
    }
  };

  const playOnHoverInit = () => {
    const isPause = (playIcon, pauseIcon) => {
      if (!playIcon || !pauseIcon) return;
      playIcon.classList.add('d-block');
      pauseIcon.classList.add('d-none');
      playIcon.classList.remove('d-none');
      pauseIcon.classList.remove('d-block');
    };

    const isPlay = (playIcon, pauseIcon) => {
      if (!playIcon || !pauseIcon) return;
      playIcon.classList.add('d-none');
      pauseIcon.classList.add('d-block');
      playIcon.classList.remove('d-block');
      pauseIcon.classList.remove('d-none');
    };

    const playVideo = (video, playIcon, pauseIcon) => {
      video.play();
      isPlay(playIcon, pauseIcon);
    };

    const pauseVideo = (video, playIcon, pauseIcon) => {
      video.pause();
      isPause(playIcon, pauseIcon);
    };

    const controlIsContainer = (container, state) => {
      const video = container.querySelector('[data-play-on-hover]');
      const controller = container.querySelector('[data-video-controller]');
      if (controller) {
        const playIcon = controller.querySelector('.play-icon');
        const pauseIcon = controller.querySelector('.pause-icon');
        if (state === 'play') {
          playVideo(video, playIcon, pauseIcon);
        } else {
          pauseVideo(video, playIcon, pauseIcon);
        }
      }
    };

    document.addEventListener('mouseover', e => {
      if (e.target.closest('[data-play-on-hover]')) {
        const video = e.target.closest('[data-play-on-hover]');
        playVideo(video, null, null);
      } else if (e.target.closest('[data-play-on-container-hover]')) {
        const container = e.target.closest('[data-play-on-container-hover]');
        controlIsContainer(container, 'play');
      }
    });

    document.addEventListener('mouseout', e => {
      if (e.target.closest('[data-play-on-hover]')) {
        const video = e.target.closest('[data-play-on-hover]');
        pauseVideo(video, null, null);
      } else if (e.target.closest('[data-play-on-container-hover]')) {
        const container = e.target.closest('[data-play-on-container-hover]');
        controlIsContainer(container, 'pause');
      }
    });

    document.addEventListener('touchstart', e => {
      if (e.target.closest('[data-play-on-hover]')) {
        const video = e.target.closest('[data-play-on-hover]');
        playVideo(video, null, null);
      } else if (e.target.closest('[data-play-on-container-hover]')) {
        const container = e.target.closest('[data-play-on-container-hover]');
        controlIsContainer(container, 'play');
      }
    });

    document.addEventListener('touchend', e => {
      if (e.target.closest('[data-play-on-hover]')) {
        const video = e.target.closest('[data-play-on-hover]');
        pauseVideo(video, null, null);
      } else if (e.target.closest('[data-play-on-container-hover]')) {
        const container = e.target.closest('[data-play-on-container-hover]');
        controlIsContainer(container, 'pause');
      }
    });

    document.addEventListener('click', e => {
      if (e.target.closest('[data-video-controller]')) {
        const controller = e.target.closest('[data-video-controller]');
        const container = controller.closest('[data-play-on-container-hover]');
        const video = container.querySelector('[data-play-on-hover]');
        const playIcon = controller.querySelector('.play-icon');
        const pauseIcon = controller.querySelector('.pause-icon');

        if (video.paused) {
          playVideo(video, playIcon, pauseIcon);
        } else {
          pauseVideo(video, playIcon, pauseIcon);
        }
      }
    });

    const videoContainers = document.querySelectorAll(
      '[data-play-on-container-hover]'
    );
    videoContainers.forEach(container => {
      const video = container.querySelector('[data-play-on-hover]');
      const controller = container.querySelector('[data-video-controller]');
      if (controller) {
        const playIcon = controller.querySelector('.play-icon');
        const pauseIcon = controller.querySelector('.pause-icon');

        if (video.paused) {
          isPause(playIcon, pauseIcon);
        }
      }
    });
  };

  const passwordToggleInit = () => {
    const passwords = document.querySelectorAll('[data-password]');
    if (passwords) {
      passwords.forEach(password => {
        const passwordInput = password.querySelector('[data-password-input]');
        const passwordToggler = password.querySelector('[data-password-toggle]');
        passwordToggler.addEventListener('click', () => {
          if (passwordInput.type === 'password') {
            passwordInput.setAttribute('type', 'text');
            passwordToggler.classList.add('show-password');
          } else {
            passwordInput.setAttribute('type', 'password');
            passwordToggler.classList.remove('show-password');
          }
        });
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Treeview                                  */
  /* -------------------------------------------------------------------------- */
  const treeviewInit = () => {
    const Events = {
      CHANGE: 'change',
      SHOW_BS_COLLAPSE: 'show.bs.collapse',
      HIDE_BS_COLLAPSE: 'hide.bs.collapse'
    };

    const Selector = {
      TREEVIEW_ROW:
        '.treeview > li > .treeview-row,.treeview-list.collapse-show > li > .treeview-row',
      TREEVIEW: '.treeview',
      TREEVIEW_LIST: '.treeview-list',
      TOGGLE_ELEMENT: "[data-bs-toggle='collapse']",
      INPUT: 'input',
      TREEVIEW_LIST_ITEM: '.treeview-list-item',
      CHILD_SELECTOR: ':scope > li > .collapse.collapse-show'
    };

    const ClassName = {
      TREEVIEW: 'treeview',
      TREEVIEW_LIST: 'treeview-list',
      TREEVIEW_BORDER: 'treeview-border',
      TREEVIEW_BORDER_TRANSPARENT: 'treeview-border-transparent',
      COLLAPSE_SHOW: 'collapse-show',
      COLLAPSE_HIDDEN: 'collapse-hidden',
      TREEVIEW_ROW: 'treeview-row',
      TREEVIEW_ROW_ODD: 'treeview-row-odd',
      TREEVIEW_ROW_EVEN: 'treeview-row-even'
    };

    const treeviews = document.querySelectorAll(Selector.TREEVIEW);

    const makeStriped = treeview => {
      const tags = Array.from(treeview.querySelectorAll(Selector.TREEVIEW_ROW));

      const uTags = tags.filter(tag => {
        let result = true;
        while (tag.parentElement) {
          if (tag.parentElement.classList.contains(ClassName.COLLAPSE_HIDDEN)) {
            result = false;
            break;
          }
          tag = tag.parentElement;
        }
        return result;
      });
      uTags.forEach((tag, index) => {
        if (index % 2 === 0) {
          tag.classList.add(ClassName.TREEVIEW_ROW_EVEN);
          tag.classList.remove(ClassName.TREEVIEW_ROW_ODD);
        } else {
          tag.classList.add(ClassName.TREEVIEW_ROW_ODD);
          tag.classList.remove(ClassName.TREEVIEW_ROW_EVEN);
        }
      });
    };

    if (treeviews.length) {
      treeviews.forEach(treeview => {
        const options = getData(treeview, 'options');
        const striped = options?.striped;
        const select = options?.select;

        if (striped) {
          makeStriped(treeview);
        }

        const collapseElementList = Array.from(
          treeview.querySelectorAll(Selector.TREEVIEW_LIST)
        );
        const collapseListItem = Array.from(
          treeview.querySelectorAll(Selector.TREEVIEW_LIST_ITEM)
        );

        collapseListItem.forEach(item => {
          const wholeRow = document.createElement('div');
          wholeRow.setAttribute('class', ClassName.TREEVIEW_ROW);
          item.prepend(wholeRow);
        });
        collapseElementList.forEach(collapse => {
          const collapseId = collapse.id;
          if (!striped) {
            collapse.classList.add(ClassName.TREEVIEW_BORDER);
          }
          collapse.addEventListener(Events.SHOW_BS_COLLAPSE, e => {
            e.target.classList.remove(ClassName.COLLAPSE_HIDDEN);
            e.target.classList.add(ClassName.COLLAPSE_SHOW);
            if (striped) {
              makeStriped(treeview);
            }
          });

          collapse.addEventListener(Events.HIDE_BS_COLLAPSE, e => {
            e.target.classList.add(ClassName.COLLAPSE_HIDDEN);
            e.target.classList.remove(ClassName.COLLAPSE_SHOW);

            if (striped) {
              makeStriped(treeview);
            } else {
              const childs = e
                .composedPath()[2]
                .querySelectorAll(Selector.CHILD_SELECTOR);
              if (
                !e.composedPath()[2].classList.contains(ClassName.TREEVIEW) &&
                childs.length === 0
              ) {
                e.composedPath()[2].classList.remove(
                  ClassName.TREEVIEW_BORDER_TRANSPARENT
                );
              }
            }
          });

          if (collapse.dataset.show === 'true') {
            const parents = [collapse];
            while (collapse.parentElement) {
              if (
                collapse.parentElement.classList.contains(ClassName.TREEVIEW_LIST)
              ) {
                parents.unshift(collapse.parentElement);
              }
              collapse = collapse.parentElement;
            }
            parents.forEach(collapseEl => {
              // eslint-disable-next-line no-new
              new window.bootstrap.Collapse(collapseEl, {
                show: true
              });
            });
          }

          if (select) {
            const inputElement = treeview.querySelector(
              `input[data-target='#${collapseId}']`
            );
            inputElement.addEventListener(Events.CHANGE, e => {
              const childInputElements = Array.from(
                treeview
                  .querySelector(`#${collapseId}`)
                  .querySelectorAll(Selector.INPUT)
              );
              childInputElements.forEach(input => {
                input.checked = e.target.checked;
              });
            });
          }
        });
      });
    }
  };

  /* eslint-disable no-new */

  window.initMap = initMap;
  docReady(detectorInit);
  docReady(simplebarInit);
  docReady(toastInit);
  docReady(tooltipInit);
  docReady(featherIconsInit);
  docReady(basicEchartsInit);
  docReady(bulkSelectInit);
  docReady(listInit);
  docReady(anchorJSInit);
  docReady(popoverInit);
  docReady(formValidationInit);
  docReady(docComponentInit);
  docReady(swiperInit);
  docReady(productDetailsInit);
  docReady(ratingInit);
  docReady(quantityInit);
  docReady(dropzoneInit);
  docReady(choicesInit);
  docReady(tinymceInit);
  docReady(responsiveNavItemsInit);
  docReady(flatpickrInit);
  docReady(iconCopiedInit);
  docReady(isotopeInit);
  docReady(bigPictureInit);
  docReady(countupInit);
  docReady(phoenixOffcanvasInit);
  docReady(todoOffcanvasInit);
  docReady(wizardInit);
  docReady(glightboxInit);
  docReady(themeControl);
  docReady(searchInit);
  docReady(handleNavbarVerticalCollapsed);
  docReady(navbarInit);
  docReady(navbarComboInit);
  docReady(fullCalendarInit);
  docReady(picmoInit);

  docReady(modalInit);
  docReady(lottieInit);
  docReady(navbarShadowOnScrollInit);
  docReady(dropdownOnHover);
  docReady(supportChatInit);
  docReady(sortableInit);

  docReady(copyLink);
  docReady(randomColorInit);
  docReady(faqTabInit);
  docReady(twoFAVerificarionInit);
  docReady(mapboxInit);
  docReady(typedTextInit);
  docReady(priceTierFormInit);
  docReady(nouisliderInit);
  docReady(collapseAllInit);
  docReady(playOnHoverInit);
  docReady(passwordToggleInit);
  docReady(treeviewInit);

  docReady(() => {
    const selectedRowsBtn = document.querySelector('[data-selected-rows]');
    const selectedRows = document.getElementById('selectedRows');
    if (selectedRowsBtn) {
      const bulkSelectEl = document.getElementById('bulk-select-example');
      const bulkSelectInstance =
        window.phoenix.BulkSelect.getInstance(bulkSelectEl);
      selectedRowsBtn.addEventListener('click', () => {
        selectedRows.innerHTML = JSON.stringify(
          bulkSelectInstance.getSelectedRows(),
          undefined,
          2
        );
      });
    }
  });

  var phoenix = {
    utils,
    BulkSelect
  };

  return phoenix;

}));
//# sourceMappingURL=phoenix.js.map

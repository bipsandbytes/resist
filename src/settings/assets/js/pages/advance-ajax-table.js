(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /* eslint-disable */
  const orders = [
    {
      id: 1,
      dropdownId: 'order-dropdown-1',
      orderId: '#2181',
      mailLink: 'mailto:carry@example.com',
      customer: 'Carry Anna',
      date: '10/03/2023',
      address: 'Carry Anna, 2392 Main Avenue, Penasauka, New Jersey 02149',
      deliveryType: 'Cash on Delivery',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$99'
    },
    {
      id: 2,
      dropdownId: 'order-dropdown-2',
      orderId: '#2182',
      mailLink: 'mailto:milind@example.com',
      customer: 'Milind Mikuja',
      date: '10/03/2023',
      address: 'Milind Mikuja, 1 Hollywood Blvd,Beverly Hills, California 90210',
      deliveryType: 'Cash on Delivery',
      status: 'Processing',
      badge: { type: 'primary', icon: 'fas fa-redo' },
      amount: '$120'
    },
    {
      id: 3,
      dropdownId: 'order-dropdown-3',
      orderId: '#2183',
      mailLink: 'mailto:stanly@example.com',
      customer: 'Stanly Drinkwater',
      date: '30/04/2023',
      address: 'Stanly Drinkwater, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Local Delivery',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$70'
    },
    {
      id: 4,
      dropdownId: 'order-dropdown-4',
      orderId: '#2184',
      mailLink: 'mailto:bucky@example.com',
      customer: 'Bucky Robert',
      date: '30/04/2023',
      address: 'Bucky Robert, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Free Shipping',
      status: 'Pending',
      badge: { type: 'warning', icon: 'fas fa-stream' },
      amount: '$92'
    },
    {
      id: 5,
      dropdownId: 'order-dropdown-5',
      orderId: '#2185',
      mailLink: 'mailto:josef@example.com',
      customer: 'Josef Stravinsky',
      date: '30/04/2023',
      address: 'Josef Stravinsky, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Via Free Road',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$120'
    },
    {
      id: 6,
      dropdownId: 'order-dropdown-6',
      orderId: '#2186',
      mailLink: 'mailto:igor@example.com',
      customer: 'Igor Borvibson',
      date: '30/04/2023',
      address: 'Igor Borvibson, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Free Shipping',
      status: 'Processing',
      badge: { type: 'primary', icon: 'fas fa-redo' },
      amount: '$145'
    },
    {
      id: 7,
      dropdownId: 'order-dropdown-7',
      orderId: '#2187',
      mailLink: 'mailto:katerina@example.com',
      customer: 'Katerina Karenin',
      date: '30/04/2023',
      address: 'Katerina Karenin, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Flat Rate',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$55'
    },
    {
      id: 8,
      dropdownId: 'order-dropdown-8',
      orderId: '#2188',
      mailLink: 'mailto:roy@example.com',
      customer: 'Roy Anderson',
      date: '29/04/2023',
      address: 'Roy Anderson, 1 Infinite Loop, Cupertino, California 90210',
      deliveryType: 'Local Delivery',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$90'
    },
    {
      id: 9,
      dropdownId: 'order-dropdown-9',
      orderId: '#2189',
      mailLink: 'mailto:Stephenson@example.com',
      customer: 'Thomas Stephenson',
      date: '29/04/2023',
      address: 'Thomas Stephenson, 116 Ballifeary Road, Bamff',
      deliveryType: 'Flat Rate',
      status: 'Processing',
      badge: { type: 'primary', icon: 'fas fa-redo' },
      amount: '$52'
    },
    {
      id: 10,
      dropdownId: 'order-dropdown-10',
      orderId: '#2190',
      mailLink: 'mailto:eviewsing@example.com',
      customer: 'Evie Singh',
      date: '29/04/2023',
      address: 'Evie Singh, 54 Castledore Road, Tunstead',
      deliveryType: 'Flat Rate',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$90'
    },
    {
      id: 11,
      dropdownId: 'order-dropdown-11',
      orderId: '#2191',
      mailLink: 'mailto:peter@example.com',
      customer: 'David Peters',
      date: '29/04/2023',
      address: 'David Peters, Rhyd Y Groes, Rhosgoch, LL66 0AT',
      deliveryType: 'Local Delivery',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$69'
    },
    {
      id: 12,
      dropdownId: 'order-dropdown-12',
      orderId: '#2192',
      mailLink: 'mailto:jennifer@example.com',
      customer: 'Jennifer Johnson',
      date: '28/04/2023',
      address: 'Jennifer Johnson, Rhyd Y Groes, Rhosgoch, LL66 0AT',
      deliveryType: 'Flat Rate',
      status: 'Processing',
      badge: { type: 'primary', icon: 'fas fa-redo' },
      amount: '$112'
    },
    {
      id: 13,
      dropdownId: 'order-dropdown-13',
      orderId: '#2193',
      mailLink: 'mailto:okuneva@example.com',
      customer: 'Demarcus Okuneva',
      date: '28/04/2023',
      address: 'Demarcus Okuneva, 90555 Upton Drive Jeffreyview, UT 08771',
      deliveryType: 'Flat Rate',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$99'
    },
    {
      id: 14,
      dropdownId: 'order-dropdown-14',
      orderId: '#2194',
      mailLink: 'mailto:simeon@example.com',
      customer: 'Simeon Harber',
      date: '27/04/2023',
      address:
        'Simeon Harber, 702 Kunde Plain Apt. 634 East Bridgetview, HI 13134-1862',
      deliveryType: 'Free Shipping',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$129'
    },
    {
      id: 15,
      dropdownId: 'order-dropdown-15',
      orderId: '#2195',
      mailLink: 'mailto:lavon@example.com',
      customer: 'Lavon Haley',
      date: '27/04/2023',
      address: 'Lavon Haley, 30998 Adonis Locks McGlynnside, ID 27241',
      deliveryType: 'Free Shipping',
      status: 'Pending',
      badge: { type: 'warning', icon: 'fas fa-stream' },
      amount: '$70'
    },
    {
      id: 16,
      dropdownId: 'order-dropdown-16',
      orderId: '#2196',
      mailLink: 'mailto:ashley@example.com',
      customer: 'Ashley Kirlin',
      date: '26/04/2023',
      address:
        'Ashley Kirlin, 43304 Prosacco Shore South Dejuanfurt, MO 18623-0505',
      deliveryType: 'Local Delivery',
      status: 'Processing',
      badge: { type: 'primary', icon: 'fas fa-redo' },
      amount: '$39'
    },
    {
      id: 17,
      dropdownId: 'order-dropdown-17',
      orderId: '#2197',
      mailLink: 'mailto:johnnie@example.com',
      customer: 'Johnnie Considine',
      date: '26/04/2023',
      address:
        'Johnnie Considine, 6008 Hermann Points Suite 294 Hansenville, TN 14210',
      deliveryType: 'Flat Rate',
      status: 'Pending',
      badge: { type: 'warning', icon: 'fas fa-stream' },
      amount: '$70'
    },
    {
      id: 18,
      dropdownId: 'order-dropdown-18',
      orderId: '#2198',
      mailLink: 'mailto:trace@example.com',
      customer: 'Trace Farrell',
      date: '26/04/2023',
      address: 'Trace Farrell, 431 Steuber Mews Apt. 252 Germanland, AK 25882',
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$70'
    },
    {
      id: 19,
      dropdownId: 'order-dropdown-19',
      orderId: '#2199',
      mailLink: 'mailto:nienow@example.com',
      customer: 'Estell Nienow',
      date: '26/04/2023',
      address: 'Estell Nienow, 4167 Laverna Manor Marysemouth, NV 74590',
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$59'
    },
    {
      id: 20,
      dropdownId: 'order-dropdown-20',
      orderId: '#2200',
      mailLink: 'mailto:howe@example.com',
      customer: 'Daisha Howe',
      date: '25/04/2023',
      address:
        'Daisha Howe, 829 Lavonne Valley Apt. 074 Stehrfort, RI 77914-0379',
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$39'
    },
    {
      id: 21,
      dropdownId: 'order-dropdown-21',
      orderId: '#2201',
      mailLink: 'mailto:haley@example.com',
      customer: 'Miles Haley',
      date: '24/04/2023',
      address: 'Miles Haley, 53150 Thad Squares Apt. 263 Archibaldfort, MO 00837',
      deliveryType: 'Flat Rate',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$55'
    },
    {
      id: 22,
      dropdownId: 'order-dropdown-22',
      orderId: '#2202',
      mailLink: 'mailto:watsica@example.com',
      customer: 'Brenda Watsica',
      date: '24/04/2023',
      address: "Brenda Watsica, 9198 O'Kon Harbors Morarborough, IA 75409-7383",
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$89'
    },
    {
      id: 23,
      dropdownId: 'order-dropdown-23',
      orderId: '#2203',
      mailLink: 'mailto:ellie@example.com',
      customer: "Ellie O'Reilly",
      date: '24/04/2023',
      address:
        "Ellie O'Reilly, 1478 Kaitlin Haven Apt. 061 Lake Muhammadmouth, SC 35848",
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$47'
    },
    {
      id: 24,
      dropdownId: 'order-dropdown-24',
      orderId: '#2204',
      mailLink: 'mailto:garry@example.com',
      customer: 'Garry Brainstrow',
      date: '23/04/2023',
      address: 'Garry Brainstrow, 13572 Kurt Mews South Merritt, IA 52491',
      deliveryType: 'Free Shipping',
      status: 'Completed',
      badge: { type: 'success', icon: 'fas fa-check' },
      amount: '$139'
    },
    {
      id: 25,
      dropdownId: 'order-dropdown-25',
      orderId: '#2205',
      mailLink: 'mailto:estell@example.com',
      customer: 'Estell Pollich',
      date: '23/04/2023',
      address: 'Estell Pollich, 13572 Kurt Mews South Merritt, IA 52491',
      deliveryType: 'Free Shipping',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$49'
    },
    {
      id: 26,
      dropdownId: 'order-dropdown-26',
      orderId: '#2206',
      mailLink: 'mailto:ara@example.com',
      customer: 'Ara Mueller',
      date: '23/04/2023',
      address: 'Ara Mueller, 91979 Kohler Place Waelchiborough, CT 41291',
      deliveryType: 'Flat Rate',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$19'
    },
    {
      id: 27,
      dropdownId: 'order-dropdown-27',
      orderId: '#2207',
      mailLink: 'mailto:blick@example.com',
      customer: 'Lucienne Blick',
      date: '23/04/2023',
      address:
        'Lucienne Blick, 6757 Giuseppe Meadows Geraldinemouth, MO 48819-4970',
      deliveryType: 'Flat Rate',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$59'
    },
    {
      id: 28,
      dropdownId: 'order-dropdown-28',
      orderId: '#2208',
      mailLink: 'mailto:haag@example.com',
      customer: 'Laverne Haag',
      date: '22/04/2023',
      address: 'Laverne Haag, 2327 Kaylee Mill East Citlalli, AZ 89582-3143',
      deliveryType: 'Flat Rate',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$49'
    },
    {
      id: 29,
      dropdownId: 'order-dropdown-29',
      orderId: '#2209',
      mailLink: 'mailto:bednar@example.com',
      customer: 'Brandon Bednar',
      date: '22/04/2023',
      address:
        'Brandon Bednar, 25156 Isaac Crossing Apt. 810 Lonborough, CO 83774-5999',
      deliveryType: 'Flat Rate',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$39'
    },
    {
      id: 30,
      dropdownId: 'order-dropdown-30',
      orderId: '#2210',
      mailLink: 'mailto:dimitri@example.com',
      customer: 'Dimitri Boehm',
      date: '23/04/2023',
      address: 'Dimitri Boehm, 71603 Wolff Plains Apt. 885 Johnstonton, MI 01581',
      deliveryType: 'Flat Rate',
      status: 'On Hold',
      badge: { type: 'secondary', icon: 'fas fa-ban' },
      amount: '$111'
    }
  ];

  const advanceAjaxTableInit = () => {
    const togglePaginationButtonDisable = (button, disabled) => {
      button.disabled = disabled;
      button.classList[disabled ? 'add' : 'remove']('disabled');
    };
    // Selectors
    const table = document.getElementById('advanceAjaxTable');

    if (table) {
      const options = {
        page: 10,
        pagination: {
          item: "<li><button class='page' type='button'></button></li>"
        },
        item: values => {
          const {
            orderId,
            id,
            customer,
            date,
            address,
            deliveryType,
            status,
            badge,
            amount
          } = values;
          return `
          <tr class="btn-reveal-trigger">
            <td class="order py-2  ps-3 align-middle white-space-nowrap">
              <a class="fw-semibold" href="https://prium.github.io/phoenix/v1.12.0/apps/e-commerce/admin/order-details.html">
                ${orderId}
              </a>
            </td>
            <td class="py-2 align-middle fw-bold">
              <a class="fw-semibold text-body" href="#!">
                ${customer}
              </a>
            </td>
            <td class="py-2 align-middle">
              ${date}
            </td>
            <td class="py-2 align-middle white-space-nowrap">
              ${address}
            </td>
            <td class="py-2 align-middle white-space-nowrap">
              <p class="mb-0">${deliveryType}</p>
            </td>
            <td class="py-2 align-middle text-center fs-8 white-space-nowrap">
              <span class="badge fs-10 badge-phoenix badge-phoenix-${badge.type}">
                ${status}
                <span class="ms-1 ${badge.icon}" data-fa-transform="shrink-2"></span>
              </span>
            </td>
            <td class="py-2 align-middle text-end fs-8 fw-medium">
              ${amount}
            </td>
            <td class="py-2 align-middle white-space-nowrap text-end">
              <div class="dropstart position-static d-inline-block">
                <button class="btn btn-link text-body btn-sm dropdown-toggle btn-reveal" type='button' id="order-dropdown-${id}" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                  <span class="fas fa-ellipsis-h fs-9"></span>
                </button>
                <div class="dropdown-menu dropdown-menu-end border py-2" aria-labelledby="order-dropdown-${id}">
                  <a href="#!" class="dropdown-item">View</a>
                  <a href="#!" class="dropdown-item">Edit</a>
                  <div class"dropdown-divider"></div>
                  <a href="#!" class="dropdown-item text-warning">Archive</a>
                </div>
              </div>
            </td>
          </tr>
        `;
        }
      };
      const paginationButtonNext = table.querySelector(
        '[data-list-pagination="next"]'
      );
      const paginationButtonPrev = table.querySelector(
        '[data-list-pagination="prev"]'
      );
      const viewAll = table.querySelector('[data-list-view="*"]');
      const viewLess = table.querySelector('[data-list-view="less"]');
      const listInfo = table.querySelector('[data-list-info]');
      const listFilter = document.querySelector('[data-list-filter]');

      const orderList = new window.List(table, options, orders);

      // Fallback
      orderList.on('updated', item => {
        const fallback =
          table.querySelector('.fallback') ||
          document.getElementById(options.fallback);

        if (fallback) {
          if (item.matchingItems.length === 0) {
            fallback.classList.remove('d-none');
          } else {
            fallback.classList.add('d-none');
          }
        }
      });

      const totalItem = orderList.items.length;
      const itemsPerPage = orderList.page;
      const btnDropdownClose =
        orderList.listContainer.querySelector('.btn-close');
      let pageQuantity = Math.ceil(totalItem / itemsPerPage);
      let numberOfcurrentItems = orderList.visibleItems.length;
      let pageCount = 1;

      btnDropdownClose &&
        btnDropdownClose.addEventListener('search.close', () =>
          orderList.fuzzySearch('')
        );

      const updateListControls = () => {
        listInfo &&
          (listInfo.innerHTML = `${orderList.i} to ${numberOfcurrentItems} of ${totalItem}`);
        paginationButtonPrev &&
          togglePaginationButtonDisable(paginationButtonPrev, pageCount === 1);
        paginationButtonNext &&
          togglePaginationButtonDisable(
            paginationButtonNext,
            pageCount === pageQuantity
          );

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

          const nextInitialIndex = orderList.i + itemsPerPage;
          nextInitialIndex <= orderList.size() &&
            orderList.show(nextInitialIndex, itemsPerPage);
          numberOfcurrentItems += orderList.visibleItems.length;
          updateListControls();
        });
      }

      if (paginationButtonPrev) {
        paginationButtonPrev.addEventListener('click', e => {
          e.preventDefault();
          pageCount -= 1;

          numberOfcurrentItems -= orderList.visibleItems.length;
          const prevItem = orderList.i - itemsPerPage;
          prevItem > 0 && orderList.show(prevItem, itemsPerPage);
          updateListControls();
        });
      }

      const toggleViewBtn = () => {
        viewLess.classList.toggle('d-none');
        viewAll.classList.toggle('d-none');
      };

      if (viewAll) {
        viewAll.addEventListener('click', () => {
          orderList.show(1, totalItem);
          pageQuantity = 1;
          pageCount = 1;
          numberOfcurrentItems = totalItem;
          updateListControls();
          toggleViewBtn();
        });
      }
      if (viewLess) {
        viewLess.addEventListener('click', () => {
          orderList.show(1, itemsPerPage);
          pageQuantity = Math.ceil(totalItem / itemsPerPage);
          pageCount = 1;
          numberOfcurrentItems = orderList.visibleItems.length;
          updateListControls();
          toggleViewBtn();
        });
      }
      if (options.pagination) {
        table.querySelector('.pagination').addEventListener('click', e => {
          if (e.target.classList[0] === 'page') {
            pageCount = Number(e.target.innerText);
            updateListControls();
          }
        });
      }
      if (options.filter) {
        const { key } = options.filter;
        listFilter.addEventListener('change', e => {
          orderList.filter(item => {
            if (e.target.value === '') {
              return true;
            }
            return item
              .values()
              [key].toLowerCase()
              .includes(e.target.value.toLowerCase());
          });
        });
      }
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(advanceAjaxTableInit);

}));
//# sourceMappingURL=advance-ajax-table.js.map

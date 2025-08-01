(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const ganttData = {
    tasks: [
      {
        id: 11,
        text: 'Travel agency landing page design',
        progress: 0.6,
        open: true,
        priority: 'Urgent',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          }
        ]
      },
      {
        id: 12,
        text: 'Research',
        start_date: '03-04-2023',
        duration: 55,
        parent: 11,
        progress: 1,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          }
        ]
      },
      {
        id: 13,
        text: 'Planning',
        parent: 11,
        progress: 0.6,
        open: true,
        priority: 'Medium',
        assignee: [
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          }
        ]
      },
      {
        id: 14,
        text: 'Design',
        start_date: '25-04-2023',
        duration: 40,
        parent: 11,
        progress: 0.8,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          }
        ]
      },
      {
        id: 15,
        text: 'Development',
        start_date: '10-05-2023',
        duration: 40,
        parent: 11,
        progress: 0.8,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          }
        ]
      },
      {
        id: 16,
        text: 'Testing',
        start_date: '05-06-2023',
        duration: 23,
        type: 'milestone',
        parent: 11,
        progress: 0,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          }
        ]
      },
      {
        id: 17,
        text: 'Deployment',
        start_date: '03-04-2023',
        duration: 52,
        parent: 13,
        progress: 1,
        open: true,
        priority: 'Low',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          }
        ]
      },
      {
        id: 24,
        text: 'Design finance app for phoenix',
        progress: 0.5,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          }
        ]
      },
      {
        id: 25,
        text: 'Update figma file for phoenix',
        start_date: '04-04-2023',
        duration: 55,
        progress: 0,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          }
        ]
      },
      {
        id: 26,
        text: 'Falcon figma file update',
        start_date: '10-04-2023',
        duration: 47,
        progress: 0,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          }
        ]
      },
      {
        id: 27,
        text: 'Gantt chart design',
        start_date: '15-04-2023',
        duration: 45,
        progress: 0,
        open: true,
        priority: 'Medium',
        assignee: [
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          }
        ]
      },
      {
        id: 28,
        text: 'Design for new dashboard aurora',
        start_date: '25-06-2023',
        duration: 112,
        progress: 0,
        open: true,
        priority: 'High',
        assignee: [
          {
            name: 'Jerry Seinfield',
            img: '/team/9.webp'
          },
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          }
        ]
      },
      {
        id: 29,
        text: 'Research for new module',
        start_date: '28-04-2023',
        duration: 57,
        progress: 0,
        open: true,
        priority: 'Low',
        assignee: [
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          }
        ]
      },
      {
        id: 30,
        text: 'Research',
        start_date: '04-04-2023',
        duration: 60,
        progress: 0,
        open: true,
        priority: 'Low',
        parent: 24,
        assignee: [
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          }
        ]
      },
      {
        id: 31,
        text: 'Development',
        start_date: '16-04-2023',
        duration: 68,
        progress: 0,
        parent: 24,
        open: true,
        priority: 'Low',
        assignee: [
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          },
          {
            name: 'Emma Watson',
            img: '/team/4.webp'
          },
          {
            name: 'Igor Borvibson',
            img: '/team/1.webp'
          },
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          }
        ]
      },
      {
        id: 33,
        text: 'Deployment',
        start_date: '27-05-2023',
        duration: 32,
        progress: 0,
        parent: 24,
        open: true,
        priority: 'Low',
        assignee: [
          {
            name: 'Barbara Lucas',
            img: '/team/3.webp'
          },
          {
            name: 'Lina Burton',
            img: '/team/2.webp'
          }
        ]
      }
    ],
    links: [
      { id: 10, source: 11, target: 12, type: 1 },
      { id: 11, source: 11, target: 13, type: 1 },
      { id: 12, source: 11, target: 14, type: 1 },
      { id: 13, source: 11, target: 15, type: 1 },
      { id: 14, source: 23, target: 16, type: 0 },
      { id: 15, source: 13, target: 17, type: 1 },
      { id: 16, source: 17, target: 18, type: 0 },
      { id: 17, source: 18, target: 19, type: 0 },
      { id: 18, source: 19, target: 20, type: 0 },
      { id: 19, source: 15, target: 21, type: 2 },
      { id: 20, source: 15, target: 22, type: 2 },
      { id: 21, source: 15, target: 23, type: 0 },
      { id: 29, source: 24, target: 30, type: 1 },
      { id: 30, source: 24, target: 31, type: 1 },
      { id: 33, source: 24, target: 31, type: 1 }
    ]
  };

  const { gantt: gantt$1 } = window;

  const formatDate = date =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const ganttConfigColumnsData = [
    {
      name: 'text',
      label: 'PROJECT NAME',
      tree: true,
      width: 410,
      min_width: 80,
      template(task) {
        const subTasks = gantt$1.getChildren(task.id).length;
        return `<div class='gantt-task-title-wrapper'> 
          <span class='gantt-task-title'>${task.text} </span>
          ${
            subTasks
              ? `<span class="badge text-bg-primary">${subTasks}</span>`
              : ''
          }
          <button data-gantt-add-subtask id=${
            task.id
          } class='btn btn-subtle-info  gantt-task-title-btn'><span class='fa-solid fa-plus'/></button>
        </div>`;
      }
    },

    {
      name: 'assignee',
      label: 'ASSIGNEE',
      width: 160,
      template(task) {
        if (task.type === gantt$1.config.types.project) {
          return '';
        }
        const path = '../assets/img/';
        const owners = task.assignee || [];

        if (!owners.length) {
          return 'Unassigned';
        }

        const items = owners
          .map((assignee, idx) => {
            if (owners.length > 4 && idx === 3) {
              return `
                <a href='#!' data-bs-toggle='dropdown' aria-expanded='false' data-bs-auto-close='outside'
                  class='dropdown-toggle dropdown-caret-none avatar avatar-s'>
                  <div class='avatar-name rounded-circle border border-translucent'>
                    <span>+${owners.length - 3}</span>
                  </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-end py-2">
                  ${owners
                    .map(
                      owner =>
                        `<div class='dropdown-item py-2 px-3 d-flex gap-2 align-items-center'>
                          <div class='avatar avatar-s'>
                            <img class="rounded-circle" src="${path}${
                          owner.img
                        }" alt="${owner.name || 'assignee'}"
                              />
                          </div>
                          <a href="#" class='fw-bold text-body text-decoration-none lh-1'>${
                            owner.name
                          }</a>
                        </div>`
                    )
                    .join('')}
                </ul>   
              `;
            }

            if (idx <= 3) {
              return `
                 <div data-bs-toggle='dropdown' data-bs-auto-close='outside' class='avatar avatar-s dropdown-toggle dropdown-caret-none'>
                      <img class="rounded-circle" src="${path}${
              assignee.img
            }" alt="${assignee.name || 'assignee'}"
                        />
                </div>
                <ul class="dropdown-menu dropdown-menu-end py-0">
                  <div class='dropdown-item py-0 px-3 d-flex gap-3 align-items-center'>
                          <div class='avatar avatar-s'>
                            <img class="rounded-circle" src="${path}${
              assignee.img
            }" alt="${assignee.name || 'assignee'}"
                              />
                          </div>
                          <a href="#" class='fw-bold text-body text-decoration-none lh-1 py-3'>${
                            assignee.name
                          }</a>
                        </div>
                </ul>
              `;
            }
            return '';
          })
          .join('');
        const template = `<div class="d-flex align-items-center avatar-group">${items}</div>`;
        return template;
      },
      sort: false
    },
    {
      name: 'Priority',
      label: 'PRIORITY',
      width: 160,
      min_width: 50,
      template(task) {
        const label = task.priority?.toLowerCase();
        let color;
        switch (label) {
          case 'urgent':
            color = 'danger';
            break;
          case 'high':
            color = 'warning';
            break;
          case 'medium':
            color = 'success';
            break;
          default:
            color = 'info';
            break;
        }
        return `<div class='text-body'><span class='fa-solid fa-circle text-${color} me-1 fs-10'></span>${
        task.priority || 'Low'
      }</div>`;
      },
      sort(a, b) {
        const priorityA = a.priority.toLowerCase();
        const priorityB = b.priority.toLowerCase();

        if (priorityA < priorityB) return -1;
        if (priorityA > priorityB) return 1;
        return 0;
      }
    },
    {
      name: 'start_date',
      label: 'START DATE',
      align: 'start',
      width: 160,
      template(task) {
        return `
         <span class='uil uil-calendar-alt text-body-quaternary fs-8 me-1'></span> ${formatDate(
           task.start_date
         )} 
      `;
      }
    },
    {
      name: 'end_date',
      label: 'END DATE',
      align: 'start',
      width: 160,
      template(task) {
        return `
       <span class='uil uil-calendar-alt text-body-quaternary fs-8 me-1'></span> ${formatDate(
         task.end_date
       )} 
    `;
      }
    },
    {
      name: 'duration',
      label: 'DURATION',
      align: 'start',
      width: 160,
      template(task) {
        return `
        <span class='uil uil-clock me-1 fs-8 text-quaternary'></span>
        ${task.duration} days 
    `;
      }
    }
  ];

  const taskTextHandler = isRtl => {
    gantt$1.config.font_width_ratio = 7;

    const getTaskFitValue = task => {
      const position1 = gantt$1.posFromDate(task.start_date);
      const position2 = gantt$1.posFromDate(task.end_date);
      const taskStartPos = isRtl ? position2 : position1;
      const taskEndPos = isRtl ? position1 : position2;
      const width = taskEndPos - taskStartPos;
      const textWidth = (task.text || '').length * gantt$1.config.font_width_ratio;

      if (width < textWidth) {
        const ganttLastDate = gantt$1.getState().max_date;
        const ganttEndPos = gantt$1.posFromDate(ganttLastDate);
        if (ganttEndPos - taskEndPos < textWidth) {
          return 'left';
        }
        return 'right';
      }
      return 'center';
    };

    gantt$1.templates.leftside_text = (start, end, task) =>
      getTaskFitValue(task) === 'left' ? task.text : '';

    gantt$1.templates.rightside_text = (start, end, task) =>
      getTaskFitValue(task) === 'right' ? task.text : '';

    gantt$1.templates.task_text = (start, end, task) =>
      getTaskFitValue(task) === 'center' ? task.text : '';
  };

  /* -------------------------------------------------------------------------- */

  const { gantt } = window;

  const Selectors = {
    DATA_GANTT_SEARCH: '[data-gantt-search]',
    DATA_GANTT_SEARCH_DISMISS: '[data-gantt-search-dismiss]',
    DATA_GANTT_VIEW: '[data-gantt-view]',
    DATA_DELETE_LINK_MODAL: '#dataDeleteLinkModal',
    DATA_GANTT_ZOOM: 'data-gantt-zoom',
    DATA_GANTT_ADD_TASK: '[data-gantt-add-task]',
    DATA_GANTT_ADD_SUBTASK: '[data-gantt-add-subtask]',
    TASK_DETAILS_OFFCANVAS: '#taskDetailsOffcanvas',
    TASK_DETAILS_NAME: '#taskDetailsName',
    TASK_DETAILS_START_DATE: '#taskDetailsStartDate',
    TASK_DETAILS_END_DATE: '#taskDetailsEndDate',
    TASK_DETAILS_DURATION: '#taskDetailsDuration',
    GANTT_ADD_TASK_MODAL: '#ganttAddTaskModal',
    CREATE_TASK_NAME: 'createTaskName',
    CREATE_TASK_START_DATE: 'createTaskStartDate',
    CREATE_TASK_DURATION: 'createTaskDuration',
    CREATE_NEW_TASK: '#createNewTask',
    GANTT_UPDATE_TASK: 'ganttUpdateTask',
    GANTT_DELETE_TASK: '#ganttDeleteTask',
    GANTT_CONFIRM_DELETE_TASK: '#ganttConfirmDeleteTask',
    GANTT_DELETE_TASK_MODAL: '#ganttDeleteTaskModal',
    GANTT_DELETE_LINK_MODAL: '#ganttDeleteLinkModal',
    GANTT_DELETE_LINK_BTN: '#ganttDeleteLinkBtn',
    GANTT_ZOOM_TO_FIT: '#ganttZoomToFit'
  };

  const Views = {
    DAYS: 'days',
    WEEKS: 'weeks',
    MONTHS: 'months',
    YEARS: 'years'
  };
  const Events = {
    CLICK: 'click',
    INPUT: 'input',
    ON_TASK_DBL_CLICK: 'onTaskDblClick',
    ON_TASK_CREATED: 'onTaskCreated',
    ON_LINK_DBL_CLICK: 'onLinkDblClick',
    SHOWN_BS_MODAL: 'shown.bs.modal',
    HIDDEN_BS_OFFCANVAS: 'hidden.bs.offcanvas',
    ON_BEFORE_TASK_DISPLAY: 'onBeforeTaskDisplay'
  };

  const weekScaleTemplate = date => {
    const dateToStr = gantt.date.date_to_str('%M %d');
    const endDate = gantt.date.add(date, 7 - date.getDay(), 'day');
    return `${dateToStr(date)} - ${dateToStr(endDate)}`;
  };

  const scales = {
    days: [
      { unit: 'week', step: 1, format: '%W' },
      { unit: 'day', step: 1, format: '%d %M' }
    ],
    weeks: [
      { unit: 'month', step: 1, format: '%F' },
      { unit: 'week', step: 1, format: weekScaleTemplate }
    ],
    months: [
      { unit: 'year', step: 1, format: '%Y' },
      { unit: 'month', step: 1, format: '%F' }
    ],
    years: [
      {
        unit: 'year',
        step: 3,
        format(date) {
          const dateToStr = gantt.date.date_to_str('%Y');
          const endDate = gantt.date.add(date, 3, 'year');
          return `${dateToStr(date)} - ${dateToStr(endDate)}`;
        }
      },
      { unit: 'year', step: 1, format: '%Y' }
    ]
  };

  /* --------------Search Handler start ------------------*/
  const searchHandler = () => {
    let filterValue = '';
    const filterEl = document.querySelector(Selectors.DATA_GANTT_SEARCH);
    const searchDismissBtn = document.querySelector(
      Selectors.DATA_GANTT_SEARCH_DISMISS
    );
    searchDismissBtn?.addEventListener(Events.CLICK, () => {
      filterValue = '';
      filterEl.value = '';
      searchDismissBtn?.classList.remove('d-block');
      gantt.render();
    });
    filterEl?.addEventListener(Events.INPUT, () => {
      if (filterEl.value.length > 0) {
        searchDismissBtn?.classList.add('d-block');
      } else {
        searchDismissBtn?.classList.remove('d-block');
      }
      filterValue = filterEl.value;
      gantt.render();
    });
    const filterLogic = (task, match = false) => {
      gantt.eachTask(child => {
        if (filterLogic(child)) {
          match = true;
        }
      }, task.id);

      if (task.text.toLowerCase().includes(filterValue.toLowerCase())) {
        match = true;
      }

      return match;
    };

    gantt.attachEvent(Events.ON_BEFORE_TASK_DISPLAY, (id, task) => {
      if (!filterValue) {
        return true; // Show all tasks if no filter is applied
      }
      return filterLogic(task); // Filter tasks
    });
  };
  /* --------------Search Handler End ------------------*/

  /* -------------- Link Delete Handler Start   ---------------*/
  const linkDeleteHandler = () => {
    let currentLinkId;
    const linkDeleteModalEl = document.querySelector(
      Selectors.GANTT_DELETE_LINK_MODAL
    );
    const linkDeleteModal = new window.bootstrap.Modal(linkDeleteModalEl);
    gantt.attachEvent(Events.ON_LINK_DBL_CLICK, id => {
      currentLinkId = id;
      linkDeleteModal.show();
      return false;
    });

    // Confirm deletion of the link
    const deleteLinkBtn = document.querySelector(Selectors.GANTT_DELETE_LINK_BTN);
    deleteLinkBtn.addEventListener(Events.CLICK, () => {
      if (currentLinkId) {
        gantt.deleteLink(currentLinkId);
      }
      linkDeleteModal.hide();
    });
  };
  /* ---------- Link Delete Handler End -------------------------------*/

  /* ---------- Task Double-Click Handler Start ------------------------*/
  let currentTaskId;
  const taskDoubleClickHandler = () => {
    gantt.attachEvent(Events.ON_TASK_DBL_CLICK, id => {
      const task = gantt.getTask(id);
      currentTaskId = id;

      const offcanvasEl = document.querySelector(
        Selectors.TASK_DETAILS_OFFCANVAS
      );
      if (offcanvasEl) {
        const offcanvas = new window.bootstrap.Offcanvas(offcanvasEl);
        offcanvas.show();

        // update offcanvas taskname
        const taskNameEl = offcanvasEl.querySelector(Selectors.TASK_DETAILS_NAME);
        if (taskNameEl) taskNameEl.value = task.text;

        // update dates with flatpickr
        const ganttTaskStartPicker = window.flatpickr(
          Selectors.TASK_DETAILS_START_DATE,
          {
            dateFormat: 'M j, Y',
            disableMobile: true,
            defaultDate: 'Mar 1, 2022'
          }
        );
        const ganttTaskEndPicker = window.flatpickr(
          Selectors.TASK_DETAILS_END_DATE,
          {
            dateFormat: 'M j, Y',
            disableMobile: true,
            defaultDate: 'Mar 1, 2022'
          }
        );
        const taskStartDate = formatDate(task.start_date);
        const taskEndDate = formatDate(task.end_date);
        ganttTaskStartPicker.setDate(taskStartDate, true);
        ganttTaskEndPicker.setDate(taskEndDate, true);
        document.querySelector(Selectors.TASK_DETAILS_DURATION).value =
          task.duration;
      }

      return false; // Prevent default lightbox
    });
  };
  /* ---------- Task Double-Click Handler End ------------------------*/

  /* -------------Task Update Handler Start  ------------------*/
  const taskUpdateHandler = () => {
    document
      .getElementById(Selectors.GANTT_UPDATE_TASK)
      ?.addEventListener(Events.CLICK, () => {
        const offcanvasEl = document.querySelector(
          Selectors.TASK_DETAILS_OFFCANVAS
        );
        const updatedTaskName = offcanvasEl.querySelector(
          Selectors.TASK_DETAILS_NAME
        ).value;
        const task = gantt.getTask(currentTaskId);

        const updatedStartDate = new Date(
          document.querySelector(Selectors.TASK_DETAILS_START_DATE).value
        );

        const updatedDuration = document.querySelector(
          Selectors.TASK_DETAILS_DURATION
        ).value;

        const updatedEndDate = gantt.calculateEndDate({
          start_date: updatedStartDate,
          duration: updatedDuration,
          task: {}
        });

        if (
          updatedTaskName &&
          updatedStartDate &&
          updatedEndDate &&
          updatedDuration
        ) {
          task.text = updatedTaskName;
          task.start_date = updatedStartDate;
          task.duration = updatedDuration;
          task.end_date = updatedEndDate;
          gantt.updateTask(task.id, task);
          const offcanvasInstance =
            window.bootstrap.Offcanvas.getInstance(offcanvasEl);
          offcanvasInstance.hide();
        }
      });
  };
  /* -------------Task Update Handler End  ------------------*/

  /* ----------- Task delete Handler start --------------------*/
  const taskDeleteHandler = () => {
    const ganttDeleteTask = document.querySelector(Selectors.GANTT_DELETE_TASK);

    if (ganttDeleteTask) {
      let triggerDeleteModal = false; // Flag to determine whether to show the modal

      ganttDeleteTask.addEventListener('click', () => {
        triggerDeleteModal = true;
        const offcanvasEl = document.querySelector(
          Selectors.TASK_DETAILS_OFFCANVAS
        );

        const offcanvasInstance =
          window.bootstrap.Offcanvas.getInstance(offcanvasEl);

        offcanvasInstance.hide();
        const modalEl = document.querySelector(Selectors.GANTT_DELETE_TASK_MODAL);
        console.log(modalEl);

        const modal = new window.bootstrap.Modal(modalEl);
        offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
          if (triggerDeleteModal) {
            if (modalEl) {
              modal.show();
            }
            triggerDeleteModal = false;
          }
        });
        modalEl.addEventListener(Events.SHOWN_BS_MODAL, () => {
          const confirmDeleteTaskBtn = document.querySelector(
            Selectors.GANTT_CONFIRM_DELETE_TASK
          );
          if (confirmDeleteTaskBtn) {
            confirmDeleteTaskBtn.addEventListener(Events.CLICK, () => {
              if (currentTaskId) {
                gantt.deleteTask(currentTaskId);
                modal.hide();
              }
            });
          }
        });
      });
    }
  };
  /* ------------- Task delete Handler End --------------------*/

  /* ------------Task Create Handler Start ----------------------*/
  const taskCreateHandler = () => {
    gantt.attachEvent(Events.ON_TASK_CREATED, task => {
      const modalEl = document.querySelector(Selectors.GANTT_ADD_TASK_MODAL);
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
      document.getElementById(Selectors.CREATE_TASK_NAME).value = task.text || '';
      document.querySelector(Selectors.CREATE_NEW_TASK).onclick = () => {
        const taskName = document.getElementById(
          Selectors.CREATE_TASK_NAME
        ).value;
        const taskStart = new Date(
          document.getElementById(Selectors.CREATE_TASK_START_DATE).value
        );
        const duration =
          document.getElementById(Selectors.CREATE_TASK_DURATION).value || 2;
        const taskEnd = gantt.calculateEndDate({
          start_date: taskStart,
          duration,
          task: {}
        });
        if (taskName && taskStart && taskEnd) {
          task.text = taskName;
          task.start_date = taskStart;
          task.end_date = taskEnd;
          gantt.addTask(task);
          modal.hide();
        }
      };
      return false; // Prevent default task creation
    });
  };
  /* ------------Task Create Handler End ----------------------*/

  /* -------------- Gantt chart init start --------------*/
  const ganttChartInit = () => {
    const { getItemFromStore, breakpoints } = window.phoenix.utils;
    const ganttElement = document.querySelector('#gantt-app');
    if (!ganttElement) return;

    gantt.plugins({});
    gantt.config.scales = scales.months;
    gantt.config.row_height = 48; // Adjust task row height
    gantt.config.scale_height = 70;
    gantt.config.bar_height = 16;
    gantt.config.sort = true;
    gantt.config.grid_resizer = true;
    gantt.config.min_column_width = 130; // Increase the minimum width of each cell
    gantt.config.columns = ganttConfigColumnsData;
    const gridWidth = 518;
    // --------- configure layout start ----------
    const gridConfig = {
      width: gridWidth,
      rows: [
        {
          view: 'grid',
          scrollX: 'gridScroll',
          scrollable: true,
          scrollY: 'scrollVer'
        },
        { view: 'scrollbar', id: 'gridScroll' }
      ]
    };

    const timelineConfig = {
      rows: [
        { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
        { view: 'scrollbar', id: 'scrollHor' }
      ]
    };

    const scrollbarConfig = { view: 'scrollbar', id: 'scrollVer' };
    const resizerConfig = { resizer: true, width: 1 };

    gantt.config.layout = {
      css: 'gantt_container',
      cols: [gridConfig, resizerConfig, timelineConfig, scrollbarConfig]
    };

    // ---- Rtl
    const isRtl = getItemFromStore('phoenixIsRTL');
    if (isRtl) {
      gantt.config.rtl = true;
      gantt.config.layout = {
        css: 'gantt_container',
        cols: [scrollbarConfig, timelineConfig, resizerConfig, gridConfig]
      };
    }
    // --------- configure layout end ----------
    taskTextHandler(isRtl);
    gantt.config.scroll_size = 7;

    gantt.init('gantt-app');
    gantt.parse(ganttData);

    // ---------- add a custom class to header ------------------
    gantt.templates.grid_header_class = columnName => {
      if (columnName === 'assignee') {
        return 'sort-btn-none';
      }
      return '';
    };

    /* -------------Gantt view handler Start----------------*/
    const updateGanttView = label => {
      switch (label) {
        case Views.DAYS:
          gantt.config.scales = scales.days;
          break;
        case Views.WEEKS:
          gantt.config.scales = scales.weeks;
          break;
        case Views.MONTHS:
          gantt.config.scales = scales.months;
          break;
        case Views.YEARS:
          gantt.config.scales = scales.years;
          break;
        default:
          gantt.config.scales = scales.months;
          break;
      }
      gantt.render();
    };
    let setCurrentView = Views.DAYS;

    const ganttViewEl = document.querySelector('[data-gantt-view]');
    ganttViewEl?.addEventListener('change', event => {
      if (document.querySelector(Selectors.GANTT_ZOOM_TO_FIT).checked) {
        document.querySelector(Selectors.GANTT_ZOOM_TO_FIT).checked = false;
      }
      setCurrentView = event.target.value;
      updateGanttView(event.target.value);
    });

    /*----------------------------------------------------------------------
                  Click handler                                  
    ------------------------------------------------------------------------*/
    document.addEventListener(Events.CLICK, event => {
      const ganttZoomEl = event.target.hasAttribute(Selectors.DATA_GANTT_ZOOM)
        ? event.target
        : event.target.closest([Selectors.DATA_GANTT_ZOOM]);
      const ganttAddTaskEl = event.target.closest(Selectors.DATA_GANTT_ADD_TASK);
      const ganttAddSubtaskEl = event.target.closest(
        Selectors.DATA_GANTT_ADD_SUBTASK
      );

      if (ganttZoomEl) {
        let zoom;
        const isCheckBox = ganttZoomEl?.getAttribute('type') === 'checkbox';
        if (isCheckBox) {
          zoom = Views.MONTHS;
          const isChecked = ganttZoomEl.checked;
          updateGanttView(isChecked ? zoom : setCurrentView);
          document.querySelector(Selectors.DATA_GANTT_VIEW).value = isChecked
            ? zoom
            : setCurrentView;
        } else {
          if (document.querySelector(Selectors.GANTT_ZOOM_TO_FIT).checked) {
            document.querySelector(Selectors.GANTT_ZOOM_TO_FIT).checked = false;
          }
          // const zoomValue = ganttZoomEl.getAttribute(Selectors.DATA_GANTT_ZOOM);
          // zoom = zoomValue === 'zoomIn' ? Views.DAYS : Views.MONTHS;
          updateGanttView(zoom);
        }
      }
      // --------- crete a new task/subtask when click on add btn --------
      if (ganttAddTaskEl) {
        gantt.createTask({
          text: '',
          duration: 5
        });
      } else if (ganttAddSubtaskEl) {
        gantt.createTask({
          text: '',
          duration: 3,
          parent: ganttAddSubtaskEl.getAttribute('id')
        });
      }
    });

    // -------- gantt responsive start ---------
    const handleResize = () => {
      gantt.$root.style.width = '100%';
      const { cols } = gantt.config.layout;
      const gridBox = cols.find(item => item.rows?.[0]?.view === 'grid') || {};

      if (window.innerWidth <= breakpoints.sm) {
        gridBox.width = 200;
      } else if (window.innerWidth <= breakpoints.md) {
        gridBox.width = 280;
      } else if (window.innerWidth <= breakpoints.lg) {
        gridBox.width = 300;
      } else if (window.innerWidth <= breakpoints.xl) {
        gridBox.width = 420;
      } else {
        gridBox.width = gridWidth;
      }
      gantt.init('gantt-app');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    // -------- gantt responsive End ---------

    // -------- Attach event handlers---------
    taskDoubleClickHandler();
    taskCreateHandler();
    taskUpdateHandler();
    taskDeleteHandler();
    linkDeleteHandler();
    searchHandler();
  };

  const { docReady } = window.phoenix.utils;

  docReady(ganttChartInit);

}));
//# sourceMappingURL=gantt-chart.js.map

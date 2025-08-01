(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /* -------------------------------------------------------------------------- */
  /*                                    Kanban                                  */
  /* -------------------------------------------------------------------------- */

  const kanbanInit = () => {
    // kanbanContainer to controll collapse behavior in kanban board
    const kanbanContainer = document.querySelector('[data-kanban-container]');
    if (kanbanContainer) {
      kanbanContainer.addEventListener('click', e => {
        if (e.target.hasAttribute('data-kanban-collapse')) {
          e.target.closest('.kanban-column').classList.toggle('collapsed');
        }
      });

      const kanbanGroups = kanbanContainer.querySelectorAll('[data-sortable]');
      kanbanGroups.forEach(item => {
        const itemInstance = window.Sortable.get(item);
        itemInstance.option('onStart', e => {
          document.body.classList.add('sortable-dragging');
          window.Sortable.ghost
            .querySelector('.dropdown-menu')
            ?.classList.remove('show');
          const dropdownElement = e.item.querySelector(
            `[data-bs-toggle='dropdown']`
          );
          window.bootstrap.Dropdown.getInstance(dropdownElement)?.hide();
        });

        // return itemInstance;
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 step wizard                                */
  /* -------------------------------------------------------------------------- */
  const createBoardInit = () => {
    const { getData } = window.phoenix.utils;
    const selectors = {
      CREATE_BOARD: '[data-create-board]',
      TOGGLE_BUTTON_EL: '[data-wizard-step]',
      FORMS: '[data-wizard-form]',
      PASSWORD_INPUT: '[data-wizard-password]',
      CONFIRM_PASSWORD_INPUT: '[data-wizard-confirm-password]',
      NEXT_BTN: '[data-wizard-next-btn]',
      PREV_BTN: '[data-wizard-prev-btn]',
      FOOTER: '[data-wizard-footer]',
      KANBAN_STEP: '[data-kanban-step]',
      BOARD_PREV_BTN: '[data-board-prev-btn]',
      CUSTOM_COLOR: '[data-custom-color-radio]'
    };

    const events = {
      SUBMIT: 'submit',
      SHOW: 'show.bs.tab',
      SHOWN: 'shown.bs.tab',
      CLICK: 'click',
      CHANGE: 'change'
    };

    const createBoard = document.querySelector(selectors.CREATE_BOARD);
    if (createBoard) {
      const tabToggleButtonEl = createBoard.querySelectorAll(
        selectors.TOGGLE_BUTTON_EL
      );
      const tabs = Array.from(tabToggleButtonEl).map(item => {
        return window.bootstrap.Tab.getOrCreateInstance(item);
      });

      // previous button only for create board last step
      const boardPrevButton = document.querySelector(selectors.BOARD_PREV_BTN);
      boardPrevButton?.addEventListener(events.CLICK, () => {
        tabs[tabs.length - 2].show();
      });

      // update kanban step
      if (tabToggleButtonEl.length) {
        tabToggleButtonEl.forEach(item => {
          item.addEventListener(events.SHOW, () => {
            const step = getData(item, 'wizard-step');
            const kanbanStep = document.querySelector(selectors.KANBAN_STEP);
            if (kanbanStep) {
              kanbanStep.textContent = step;
            }
          });
        });
      }

      const forms = createBoard.querySelectorAll(selectors.FORMS);
      forms.forEach((form, index) => {
        form.addEventListener(events.SUBMIT, e => {
          e.preventDefault();
          const formData = new FormData(e.target);
          Object.fromEntries(formData.entries());
          if (index + 1 === forms.length) {
            window.location.reload();
          }
          return null;
        });
      });
      // custom color
      const colorPicker = document.querySelector('#customColorInput');
      colorPicker?.addEventListener(events.CHANGE, event => {
        const selectedColor = event.target.value;
        const customColorRadioBtn = document.querySelector(
          selectors.CUSTOM_COLOR
        );
        customColorRadioBtn.setAttribute('checked', 'checked');
        customColorRadioBtn.value = selectedColor;
      });
    }
  };

  const { docReady } = window.phoenix.utils;

  docReady(kanbanInit);
  docReady(createBoardInit);

}));
//# sourceMappingURL=kanban.js.map

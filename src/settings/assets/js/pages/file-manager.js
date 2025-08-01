(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const avatarTemplate = item => `
<a class="dropdown-toggle dropdown-caret-none d-inline-block" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
  <div class="avatar avatar-m rounded-circle border border-light-subtle">
    <img class="rounded-circle ${
      item.avatar === 'team/avatar.webp' ? 'avatar-placeholder' : ''
    }" src="../../assets/img/${item.avatar}" alt="" />
  </div>
</a>
<div class="dropdown-menu avatar-dropdown-menu p-0 overflow-hidden" style="width: 320px;">
  <div class="position-relative">
    <div class="bg-holder z-n1" style="background-image:url(../../assets/img/bg/bg-32.png);background-size: auto;">
    </div>
    <div class="p-3">
      <div class="text-end">
        <button class="btn p-0 me-2"><span class="fa-solid fa-user-plus text-white"></span></button>
        <button class="btn p-0"><span class="fa-solid fa-ellipsis text-white"></span></button>
      </div>
      <div class="text-center">
        <div class="avatar avatar-xl status-online position-relative me-2 me-sm-0 me-xl-2 mb-2"><img class="rounded-circle border border-light-subtle" src="../../assets/img/${
          item.avatar
        }" alt="" /></div>
        <h6 class="text-white">${item.name}</h6>
        <p class="text-light text-opacity-50 fw-semibold fs-10 mb-2">@tyrion222</p>
        <div class="d-flex flex-center mb-3">
          <h6 class="text-white mb-0">224 <span class="fw-normal text-light text-opacity-75">connections</span></h6><span class="fa-solid fa-circle text-body-tertiary mx-1" data-fa-transform="shrink-10 up-2"></span>
          <h6 class="text-white mb-0">23 <span class="fw-normal text-light text-opacity-75">mutual</span></h6>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-body-emphasis">
    <div class="p-3 border-bottom border-translucent">
      <div class="d-flex justify-content-between">
        <div class="d-flex">
          <button class="btn btn-phoenix-secondary btn-icon btn-icon-lg me-2"><span class="fa-solid fa-phone"></span></button>
          <button class="btn btn-phoenix-secondary btn-icon btn-icon-lg me-2"><span class="fa-solid fa-message"></span></button>
          <button class="btn btn-phoenix-secondary btn-icon btn-icon-lg"><span class="fa-solid fa-video"></span></button>
        </div>
        <button class="btn btn-phoenix-primary"><span class="fa-solid fa-envelope me-2"></span>Send Email</button>
      </div>
    </div>
    <ul class="nav d-flex flex-column py-3 border-bottom">
      <li class="nav-item"><a class="nav-link px-3 d-flex flex-between-center" href="#!"> <span class="me-2 text-body d-inline-block" data-feather="clipboard"></span><span class="text-body-highlight flex-1">Assigned Projects</span><span class="fa-solid fa-chevron-right fs-11"></span></a></li>
      <li class="nav-item"><a class="nav-link px-3 d-flex flex-between-center" href="#!"> <span class="me-2 text-body" data-feather="pie-chart"></span><span class="text-body-highlight flex-1">View activiy</span><span class="fa-solid fa-chevron-right fs-11"></span></a></li>
    </ul>
  </div>
  <div class="p-3 d-flex justify-content-between"><a class="btn btn-link p-0 text-decoration-none" href="#!">Details </a><a class="btn btn-link p-0 text-decoration-none text-danger" href="#!">Unassign </a></div>
</div>
`;

  const timelineTemplate = (item, index, data) => `
<div class="timeline-item">
  <div class="row g-3">
    <div class="col-auto">
      <div class="timeline-item-bar position-relative">
        <div class="icon-item icon-item-md rounded-7 border border-translucent">
          <span class="${item.icon} text-${item.iconColor} fs-9"></span>
        </div>
          ${
            index !== data.activities.length - 1
              ? '<span class="timeline-bar border-end border-dashed"></span>'
              : ''
          }
      </div>
    </div>
    <div class="col mb-5">
      <div class="d-flex justify-content-between">
        <div class="d-flex mb-2">
          <h6 class="lh-sm mb-0 me-2 text-body-secondary timeline-item-title">${
            item.title
          }</h6>
        </div>
        <p class="text-body-quaternary fs-9 mb-0 text-nowrap timeline-time"><span class="fa-regular fa-clock me-1"></span>${
          item.time
        }</p>
      </div>
      <h6 class="fs-10 fw-normal mb-3">by <a class="fw-semibold" href="#!">${
        item.tasker
      }</a></h6>
      <div class="avatar-group avatar-group-dense">
        ${
          item.assignees
            ? item.assignees.map(member => avatarTemplate(member)).join('')
            : ''
        }
        ${
          item.more
            ? `
          <div class="avatar avatar-m  rounded-circle">
            <div class="avatar-name rounded-circle "><span>+1</span></div>
          </div>`
            : ''
        }
      </div>
    </div>
  </div>
</div>
`;

  const detailsTemplate = item => `
<tr>
  <td class="py-1 align-middle">
    <h5 class="mb-0">${item.key}</h5>
  </td>
  <td class="py-1 align-middle">:</td>
  <td class="py-1 align-middle">
    ${item.value}
    ${
      item.modifiedBy
        ? 'by <a class="fs-9 fw-bolder" href="#!">John Doe</a></td>'
        : ''
    }
  </td>
</tr>
`;

  const getFileDetailsTemplate = data => {
    return `
  <div>
    <h3>${data.name}</h3>
    <ul class="nav nav-underline file-details-tab fs-9 flex-nowrap gap-0 mt-4 mb-5" id="fileDetailsTab" role="tablist">
      <li class="nav-item text-nowrap w-50 text-center" role="presentation"><a class="nav-link active" id="details-tab" data-bs-toggle="tab" href="#tab-details" role="tab" aria-controls="tab-details" aria-selected="false" tabindex="-1">File Details</a></li>
      <li class="nav-item text-nowrap w-50 text-center me-2" role="presentation"><a class="nav-link" id="activity-tab" data-bs-toggle="tab" href="#tab-activity" role="tab" aria-controls="tab-activity" aria-selected="false" tabindex="-1">File Activity</a></li>
    </ul>
    <div class="tab-content" id="fileDetailsTab">
      <div class="tab-pane fade active show" id="tab-details" role="tabpanel" aria-labelledby="details-tab">
        ${
          data.type === 'folder'
            ? `<span class="fa-solid fa-folder fs-1 mb-3 ${
                data.id === 3 ? 'text-info-light' : ''
              }"></span>`
            : ''
        }
        ${
          data.type === 'doc'
            ? '<span class="fa-solid fa-file-word fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'xls'
            ? '<span class="fa-solid fa-file-excel fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'source-code'
            ? '<span class="fa-solid fa-file-invoice fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'zip'
            ? '<span class="fa-solid fa-file-zipper fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'html'
            ? '<span class="fa-solid fa-file-code fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'pdf'
            ? '<span class="fa-solid fa-file-pdf fs-1 mb-3"></span>'
            : ''
        }
        ${
          data.type === 'image'
            ? `<img class="w-100 h-100 object-fit-cover rounded-2 mb-3" src="../../assets/${data.img}" alt="" style='aspect-ratio: 16/9' />`
            : ''
        }
        ${
          data.type === 'video'
            ? `
            <video class="d-block h-100 w-100 overflow-hidden rounded-2 object-fit-cover mb-3" muted="muted" controls poster="../../assets/${
              data.video.split('.')[0]
            }.png" style='aspect-ratio: 16/9'>
              <source src="../../assets/${data.video}" type="video/mp4" />
            </video>
            `
            : ''
        }
        <table class="table table-borderless">
          <tr>
            <th class="p-0" style="width: 110px"></th>
            <th class="p-0 text-center" style="width: 20px"></th>
            <th class="p-0"></th>
          </tr>
          ${data.details.map(item => detailsTemplate(item)).join('')}
        </table>
        <hr class="mb-4" />
        <h5 class="mb-3">Admin</h5>
        <div class="avatar avatar-m ">
          ${avatarTemplate(data.admin)}
        </div>
        <h5 class="mb-3 mt-5">Team members</h5>
        <div class="avatar-group avatar-group-dense">
        ${data.assignees.map(item => avatarTemplate(item)).join('')}
        </div>
        <a class="btn btn-link p-0" href="#!">Control Access<span class="fa-solid fa-chevron-right ms-2 mt-2"></span></a>
        <hr class="my-4" />
        <h5 class="mb-3 mb-3">File Link</h5>
        <h6 class="fw-normal text-body">${data.fileLink}</h6>
        <button class="btn btn-phoenix-primary mt-2"><span class="fa-solid fa-link me-2"></span>Copy link</button>
      </div>
      <div class="tab-pane fade" id="tab-activity" role="tabpanel" aria-labelledby="activity-tab">
        <h4 class="mb-3">Today</h4>
        <div class="timeline-basic">
          ${data.activities
            .map((item, index) => timelineTemplate(item, index, data))
            .join('')}
        </div>
      </div>
    </div>
  </div>
`;
  };

  const skeletonTemplate = `
<div aria-hidden="true">
  <h5 class="placeholder-glow mb-2">
    <span class="placeholder col-8 bg-body-secondary py-3"></span>
  </h5>
  <div class='placeholder-glow mb-2 d-flex gap-2'>
    <span class="placeholder col-6 py-3 bg-body-secondary"></span>
    <span class="placeholder col-6 py-3 bg-body-secondary"></span>
  </div>
  <span class="placeholder col-12 bg-body-secondary mb-3" style='height: 150px'></span>
  <p class="card-text placeholder-glow">
    <span class="placeholder col-12 py-2 mb-2 bg-body-secondary"></span>
    <span class="placeholder col-8 py-2 mb-2 bg-body-secondary"></span>
    <span class="placeholder col-12 py-2 mb-2 bg-body-secondary"></span>
    <span class="placeholder col-10 py-2 mb-2 bg-body-secondary"></span>
  </p>
</div>
`;

  const myFiles = [
    {
      id: 1,
      name: 'Illustrations',
      type: 'folder',
      itemCount: '20 Items',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Kristine Cadena',
        avatar: 'team/2.webp'
      },
      assignees: [
        {
          name: 'Kristine Cadena',
          avatar: 'team/2.webp'
        },
        {
          name: 'Adrian',
          avatar: 'team/4.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        },
        {
          name: 'Roy Anderson',
          avatar: 'team/r.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 2,
      name: 'Retro Ring.jpg',
      type: 'image',
      size: '980 KB',
      img: 'img/file-manager/9.png',
      modified: '10 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Raymond Mims',
        avatar: 'team/10.webp'
      },
      assignees: [
        {
          name: 'Raymond Mims',
          avatar: 'team/10.webp'
        },
        {
          name: 'Jonathan',
          avatar: 'team/11.webp'
        },
        {
          name: 'Jack',
          avatar: 'team/12.webp'
        },
        {
          name: 'Jessica',
          avatar: 'team/13.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 3,
      name: 'Brand Identity',
      type: 'folder',
      itemCount: '16 Items',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carl',
        avatar: 'team/7.webp'
      },
      assignees: [
        {
          name: 'Carl',
          avatar: 'team/7.webp'
        },
        {
          name: 'Robert Allan',
          avatar: 'team/21.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        },
        {
          name: 'Adrian',
          avatar: 'team/4.webp'
        },
        {
          name: 'Sarah Gill',
          avatar: 'team/28.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 4,
      name: 'World in Motion.mp4',
      type: 'video',
      video: 'video/2.mp4',
      size: '18 MB',
      modified: '15 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'William Grant',
        avatar: 'team/1.webp'
      },
      assignees: [
        {
          name: 'William Grant',
          avatar: 'team/1.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/2.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 5,
      name: 'UI Design',
      type: 'folder',
      itemCount: '10 Items',
      modified: '20 September, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Luke Davies',
        avatar: 'team/5.webp'
      },
      assignees: [
        {
          name: 'Luke Davies',
          avatar: 'team/5.webp'
        },
        {
          name: 'Sophie Grant',
          avatar: 'team/6.webp'
        },
        {
          name: 'Jack',
          avatar: 'team/12.webp'
        },
        {
          name: 'William Ellison',
          avatar: 'team/23.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 6,
      name: 'Classic Clicks.png',
      type: 'image',
      size: '564 KB',
      img: 'img/file-manager/11.png',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'William Grant',
        avatar: 'team/1.webp'
      },
      assignees: [
        {
          name: 'William Grant',
          avatar: 'team/1.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/2.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        }
      ],
      more: '+2',
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 7,
      name: 'Source Code',
      type: 'folder',
      itemCount: '21 Items',
      modified: '21 September, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Robert Allan',
        avatar: 'team/21.webp'
      },
      assignees: [
        {
          name: 'Robert Allan',
          avatar: 'team/21.webp'
        },
        {
          name: 'Molly William',
          avatar: 'team/27.webp'
        },
        {
          name: 'Sarah Gill',
          avatar: 'team/28.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 8,
      name: 'Code Backup',
      type: 'folder',
      itemCount: '19 Items',
      modified: '21 September, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Rose Berry',
        avatar: 'team/18.webp'
      },
      assignees: [
        {
          name: 'Rose Berry',
          avatar: 'team/18.webp'
        },
        {
          name: 'Tim Anderson',
          avatar: 'team/22.webp'
        },
        {
          name: 'William Ellison',
          avatar: 'team/23.webp'
        },
        {
          name: 'Jean Renoir',
          avatar: 'team/34.webp'
        },
        {
          name: 'Stanly Drinkwater',
          avatar: 'team/35.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 9,
      name: 'Trip List.xls',
      type: 'xls',
      size: '553 KB',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Warren',
        avatar: 'team/24.webp'
      },
      assignees: [
        {
          name: 'Warren',
          avatar: 'team/24.webp'
        },
        {
          name: 'William Ellison',
          avatar: 'team/23.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        }
      ],
      more: '+3',
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 10,
      name: 'Archive.zip',
      type: 'zip',
      size: '12 MB',
      modified: '10 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Nicola Allan',
        avatar: 'team/16.webp'
      },
      assignees: [
        {
          name: 'Nicola Allan',
          avatar: 'team/16.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/19.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/avatar.webp'
        }
      ],
      more: '+8',
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 11,
      name: 'Worldly Wonders.jpg',
      type: 'image',
      size: '990 KB',
      img: 'img/file-manager/12.png',
      modified: '10 September, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/1.webp'
      },
      assignees: [
        {
          name: 'William Grant',
          avatar: 'team/1.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/2.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 12,
      name: 'Phoenix Logs.csv',
      type: 'csv',
      size: '546 KB',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'William Grant',
        avatar: 'team/1.webp'
      },
      assignees: [
        {
          name: 'William Grant',
          avatar: 'team/1.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/2.webp'
        },
        {
          name: 'Charles',
          avatar: 'team/3.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 13,
      name: 'Notes.xlx',
      type: 'xlx',
      size: '698 KB',
      modified: '2 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Kristine Cadena',
        avatar: 'team/70.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/9.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/25.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/32.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/avatar.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 14,
      name: 'Moving Escapes.mp4',
      type: 'video',
      size: '12 MB',
      video: 'video/3.mp4',
      modified: '4 hours ago',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '800 MB'
        },
        {
          key: 'Storage used',
          value: '800 MB'
        },
        {
          key: 'Files',
          value: '20 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '30 Jun, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Kristine Cadena',
        avatar: 'team/70.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/9.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/25.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/32.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/avatar.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-share-nodes',
          iconColor: 'success',
          title: `You have shared this file.`,
          tasker: 'John N. Ward',
          assignees: [
            {
              name: 'Michael Jenkins',
              avatar: 'team/9.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/25.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/32.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/avatar.webp'
            }
          ],
          more: '+1'
        },
        {
          time: '12:30pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:33am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 15,
      name: 'API Documentation.pdf',
      type: 'pdf',
      size: '4 MB',
      modified: '10 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 16,
      name: 'Vintage Car.jpg',
      type: 'image',
      size: '980 KB',
      img: 'img/file-manager/13.png',
      modified: '15 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 17,
      name: 'Sleek Rides.png',
      type: 'image',
      size: '980 KB',
      img: 'img/file-manager/15.png',
      modified: '16 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 18,
      name: 'Notes.txt',
      type: 'zip',
      size: '29 MB',
      modified: '17 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 19,
      name: 'Mountain Majesty.jpg',
      type: 'image',
      size: '2 MB',
      img: 'img/file-manager/16.png',
      modified: '17 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        }
      ]
    },
    {
      id: 20,
      name: 'Job Confirmation.doc',
      type: 'doc',
      size: '129 KB',
      modified: '17 July, 2023',
      details: [
        {
          key: 'File type',
          value: 'Folder'
        },
        {
          key: 'File size',
          value: '520 MB'
        },
        {
          key: 'Storage used',
          value: '520 MB'
        },
        {
          key: 'Files',
          value: '16 items'
        },
        {
          key: 'File location',
          value: 'App Documentation'
        },
        {
          key: 'Last opened',
          value: '05 Jul, 2023'
        },
        {
          key: 'Last modified',
          value: '10 July, 2023',
          modifiedBy: 'John Doe'
        },
        {
          key: 'Created date',
          value: '12 Feb, 2023'
        }
      ],
      admin: {
        name: 'Carry Anna',
        avatar: 'team/71.webp'
      },
      assignees: [
        {
          name: 'Michael Jenkins',
          avatar: 'team/10.webp'
        },
        {
          name: 'Ansolo Lazinatov',
          avatar: 'team/26.webp'
        },
        {
          name: 'Jennifer Schramm',
          avatar: 'team/21.webp'
        },
        {
          name: 'Kristine Cadena',
          avatar: 'team/12.webp'
        }
      ],
      fileLink: 'http://sample.info/?insect=fireman&porter=attraction# cave',
      activities: [
        {
          time: '4:33pm',
          icon: 'fa-solid fa-swatchbook',
          iconColor: 'success',
          title: `Designing the dungeon`,
          tasker: 'Igor Borvibson',
          assignees: [
            {
              name: 'Roy Anderson',
              avatar: 'team/11.webp'
            },
            {
              name: 'Ansolo Lazinatov',
              avatar: 'team/35.webp'
            },
            {
              name: 'Jennifer Schramm',
              avatar: 'team/23.webp'
            },
            {
              name: 'Kristine Cadena',
              avatar: 'team/57.webp'
            }
          ],
          more: '+2'
        },
        {
          time: '03:00pm',
          icon: 'fa-solid fa-edit',
          iconColor: 'danger',
          title: 'You have edited this file.',
          tasker: 'John N. Ward'
        },
        {
          time: '9:00am',
          icon: 'fa-solid fa-cloud-arrow-up',
          iconColor: 'info',
          title: 'You have uploaded this file.',
          tasker: 'John N. Ward'
        }
      ]
    }
  ];

  const fileManagerInit = () => {
    const fileContainer = document.querySelector('[data-files-container]');
    const fileDetailsContainer = document.querySelector(
      '[data-details-container]'
    );
    const fileDetails = fileDetailsContainer.querySelector('[data-file-details]');
    const filesSelected = document.querySelector('[data-files-selected]');
    const fileManager = document.querySelector(
      '[data-collapse-filemanager-sidebar]'
    );
    const sidebarToggleBtn = document.querySelector('[data-toggle-sidebar]');
    const fileDetailsToggleBtns = document.querySelectorAll(
      '[data-toggle-file-details]'
    );
    const thumbnails = document.querySelectorAll('[data-file-thumbnail]');
    const removeBulkCheck = document.querySelector('[data-remove-bulk-check]');
    const bulkSelectReplaceEl = document.querySelector(
      '#file-manager-replace-element'
    );
    const bulkSelectActions = document.querySelector('#file-manager-actions');
    const bulkSelectEl = document.querySelector('[data-bulk-select]');
    const bulkSelectInstance =
      window.phoenix.BulkSelect.getInstance(bulkSelectEl);
    let count = 0;
    let selectedFiles = [];
    let clickTimer = null;
    const updateUI = () => {
      if (count > 0) {
        filesSelected.textContent = `${count} ${
        count === 1 ? 'item' : 'items'
      } selected`;
      }

      if (count === 1) {
        const template = getFileDetailsTemplate(selectedFiles[0]);
        fileDetails.innerHTML = template;
      } else {
        fileDetails.innerHTML = `
        <div class='text-center px-4'>
          ${count > 0 ? `<h5 class='mb-3'>${count} items selected</h5>` : ''}
          <img class='d-dark-none img-fluid' src='../../assets/img/spot-illustrations/46.png'>
          <img class='d-light-none img-fluid' src='../../assets/img/spot-illustrations/dark_46.png'>
          ${
            count === 0
              ? "<h5 class='mt-4'>Select an item to view more information</h5>"
              : ''
          }
        </div>
      `;
      }
    };

    const elements = [];
    thumbnails.forEach((thumbnail, index) => {
      const element = {};
      const src = thumbnail.getAttribute('data-file-thumbnail');
      element.href = `../../assets/${src}`;
      element.type = src.split('.')[1] === 'mp4' ? 'video' : 'image';
      elements.push(element);
      thumbnail.setAttribute('data-file-index', index);
    });

    fileContainer.addEventListener('click', e => {
      if (clickTimer !== null) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }

      if (e.target.tagName === 'INPUT') {
        const checkBox = e.target;
        if (checkBox.hasAttribute('data-bulk-select')) {
          count = bulkSelectInstance.getSelectedRows().length;
          selectedFiles = [...myFiles.slice(0, count)];
        } else {
          const currentData = myFiles.find(
            file => file.id === parseInt(checkBox.getAttribute('data-file'), 10)
          );
          if (checkBox.checked) {
            count += 1;
            selectedFiles.push(currentData);
          } else {
            selectedFiles = selectedFiles.filter(
              file => file.id !== currentData.id
            );
            count -= 1;
          }
        }
        if (count === 1) {
          fileDetails.innerHTML = skeletonTemplate;
        } else if (count > 1) {
          fileDetails.innerHTML = `
          <div class='text-center px-4'>
            <span class="placeholder col-6 bg-body-secondary mb-3"></span>
            <img class='d-dark-none img-fluid' src='../../assets/img/spot-illustrations/46.png'>
            <img class='d-light-none img-fluid' src='../../assets/img/spot-illustrations/dark_46.png'>
          </div>
        `;
        }
        filesSelected.innerHTML = `
        <div class='text-center'>
          <span class="placeholder bg-body-secondary" style='width: 97px'></span>
        </div>
      `;
        if (count === 0) {
          bulkSelectActions.classList.add('d-none');
          bulkSelectReplaceEl.classList.add('d-block');
          bulkSelectReplaceEl.classList.remove('d-none');
        } else {
          bulkSelectReplaceEl.classList.add('d-none');
          bulkSelectActions.classList.add('d-block');
          bulkSelectActions.classList.remove('d-none');
        }
        clickTimer = setTimeout(() => {
          clickTimer = null;
          updateUI();
        }, 300);
      }
    });

    fileContainer.addEventListener('dblclick', e => {
      const checkBox = e.target;
      if (checkBox.hasAttribute('data-file')) {
        bulkSelectInstance.deselectAll(bulkSelectReplaceEl, bulkSelectActions);
        selectedFiles = [];
        count = 1;
        const currentData = myFiles.find(
          file => file.id === parseInt(checkBox.getAttribute('data-file'), 10)
        );
        selectedFiles.push(currentData);
        e.target.previousElementSibling.checked = true;
        bulkSelectReplaceEl.classList.add('d-none');
        bulkSelectActions.classList.add('d-block');
        bulkSelectActions.classList.remove('d-none');
        updateUI();
      }
      if (checkBox.hasAttribute('data-file-thumbnail')) {
        window
          .GLightbox({
            elements,
            autoplayVideos: true,
            startAt: parseInt(checkBox.getAttribute('data-file-index'), 10)
          })
          .open();
      }
    });

    const updateViewDetailsTooltip = () => {
      fileDetailsToggleBtns.forEach(fileDetailsToggleBtn => {
        if (window.innerWidth > 1539) {
          if (fileDetailsContainer.classList.contains('d-xxl-none')) {
            fileDetailsToggleBtn.setAttribute('data-bs-title', 'Show details');
          } else {
            fileDetailsToggleBtn.setAttribute('data-bs-title', 'Hide details');
          }
        } else {
          fileDetailsToggleBtn.setAttribute('data-bs-title', 'Show details');
        }
        const tooltip =
          window.bootstrap.Tooltip.getInstance(fileDetailsToggleBtn);
        if (tooltip) {
          tooltip.setContent({
            '.tooltip-inner': fileDetailsToggleBtn.getAttribute('data-bs-title')
          });
        } else {
          window.bootstrap.Tooltip(fileDetailsToggleBtn);
        }
      });
    };
    fileDetailsToggleBtns.forEach(fileDetailsToggleBtn => {
      fileDetailsToggleBtn.addEventListener('click', () => {
        if (window.innerWidth > 1539) {
          if (fileDetailsContainer.classList.contains('d-xxl-none')) {
            fileDetailsContainer.classList.remove('d-xxl-none');
          } else {
            fileDetailsContainer.classList.add('d-xxl-none');
          }

          if (
            fileDetailsContainer.previousElementSibling.classList.contains(
              'w-xxl-100'
            )
          ) {
            fileDetailsContainer.previousElementSibling.classList.remove(
              'w-xxl-100'
            );
          } else {
            fileDetailsContainer.previousElementSibling.classList.add(
              'w-xxl-100'
            );
          }
        }
        updateViewDetailsTooltip();
      });
    });

    window.addEventListener('load', () => updateViewDetailsTooltip());
    window.addEventListener('resize', () => updateViewDetailsTooltip());

    removeBulkCheck.addEventListener('click', () => {
      if (bulkSelectInstance) {
        bulkSelectInstance.deselectAll(bulkSelectReplaceEl, bulkSelectActions);
        selectedFiles = [];
        count = 0;
        updateUI();
      }
    });

    sidebarToggleBtn.addEventListener('click', () => {
      fileManager.classList.toggle('show-sidebar');
    });
  };

  const { docReady } = window.phoenix.utils;

  docReady(fileManagerInit);

}));
//# sourceMappingURL=file-manager.js.map

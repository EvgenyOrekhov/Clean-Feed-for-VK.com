import { init } from "actus";
import defaultActions from "actus-default-actions";

import defaultSettings from "./defaultSettings.json";

function addClickHandlers(actions) {
  const map = {
    "is-disabled": actions["is-disabled"].toggle,
    groups: actions.toggleGroups,
    mygroups: actions.mygroups.toggle,
    people: actions.people.toggle,
    external_links: actions.toggleExternalLinks,
    links: actions.links.toggle,
    apps: actions.apps.toggle,
    instagram: actions.instagram.toggle,
    video: actions.video.toggle,
    group_share: actions.group_share.toggle,
    mem_link: actions.mem_link.toggle,
    event_share: actions.event_share.toggle,
    wall_post_more: actions.wall_post_more.toggle,
    likes: actions.likes.toggle,
    comments: actions.comments.toggle,
  };

  Object.entries(map).forEach(([name, action]) => {
    document.querySelector(`[name=${name}]`).addEventListener("click", action);
  });
}

const actions = {
  toggleGroups: (ignore, state) => ({
    ...state,
    groups: !state.groups,
    mygroups: false,
    people: false,
  }),
  toggleExternalLinks: (ignore, state) => ({
    ...state,
    external_links: !state.external_links,
    links: false,
  }),
};

/* eslint-disable fp/no-mutation, no-param-reassign */
function updatePage({ state: settings }) {
  const checkboxes = document.querySelectorAll("input");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = settings[checkbox.name];

    if (checkbox.name !== "is-disabled") {
      checkbox.disabled = settings["is-disabled"];
    }
  });

  document
    .querySelector("#mygroups-label")
    .classList.toggle("hidden", !settings.groups);
  document
    .querySelector("#people-label")
    .classList.toggle("hidden", !settings.groups);
  document
    .querySelector("#links-label")
    .classList.toggle("hidden", settings.external_links);
}
/* eslint-enable fp/no-mutation, no-param-reassign */

function saveSettings({ state: settings }) {
  chrome.storage.sync.set(settings);
}

function applySettings({ state: settings }) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function sendMessage([tab]) {
      chrome.runtime.sendMessage({
        tabId: tab.id,
        action: "execute",
        settings,
      });
    }
  );
}

chrome.storage.sync.get((settings) => {
  const boundActions = init([
    defaultActions(defaultSettings),
    {
      state: { ...defaultSettings, ...settings },
      actions,
      subscribers: [updatePage, saveSettings, applySettings],
    },
  ]);

  addClickHandlers(boundActions);
});

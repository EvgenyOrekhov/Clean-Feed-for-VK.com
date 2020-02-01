/* eslint-disable fp/no-mutation, no-param-reassign, camelcase */

import { init } from "actus";

function toggle(property) {
  return state => ({
    ...state,
    [property]: !state[property]
  });
}

function addClickHandlers({
  toggleIsDisabled,
  toggleGroups,
  toggleMyGroups,
  togglePeople,
  toggleExternalLinks,
  toggleLinks,
  toggleApps,
  toggleInstagram,
  toggleVideo,
  toggleGroupShare,
  toggleMemLink,
  toggleEventShare,
  toggleMore,
  toggleLikes,
  toggleComments
}) {
  const map = {
    "is-disabled": toggleIsDisabled,
    groups: toggleGroups,
    mygroups: toggleMyGroups,
    people: togglePeople,
    external_links: toggleExternalLinks,
    links: toggleLinks,
    apps: toggleApps,
    instagram: toggleInstagram,
    video: toggleVideo,
    group_share: toggleGroupShare,
    mem_link: toggleMemLink,
    event_share: toggleEventShare,
    wall_post_more: toggleMore,
    likes: toggleLikes,
    comments: toggleComments
  };

  Object.entries(map).forEach(([name, action]) => {
    document.querySelector(`[name=${name}]`).addEventListener("click", action);
  });
}

const actions = {
  toggleIsDisabled: toggle("is-disabled"),
  toggleGroups: state => ({
    ...toggle("groups")(state),
    mygroups: false,
    people: false
  }),
  toggleMyGroups: toggle("mygroups"),
  togglePeople: toggle("people"),
  toggleExternalLinks: state => ({
    ...toggle("external_links")(state),
    links: false
  }),
  toggleLinks: toggle("links"),
  toggleApps: toggle("apps"),
  toggleInstagram: toggle("instagram"),
  toggleVideo: toggle("video"),
  toggleGroupShare: toggle("group_share"),
  toggleMemLink: toggle("mem_link"),
  toggleEventShare: toggle("event_share"),
  toggleMore: toggle("wall_post_more"),
  toggleLikes: toggle("likes"),
  toggleComments: toggle("comments")
};

function updatePage({ state: settings }) {
  const checkboxes = document.querySelectorAll("input");

  checkboxes.forEach(checkbox => {
    checkbox.checked = settings[checkbox.name];

    if (checkbox.name !== "is-disabled") {
      checkbox.disabled = Boolean(settings["is-disabled"]);
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
    .classList.toggle("hidden", Boolean(settings.external_links));
}

function saveSettings({ state: settings }) {
  chrome.storage.sync.set(settings);
}

function applySettings({ state: settings }) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true
    },
    function sendMessage([tab]) {
      chrome.runtime.sendMessage({
        tabId: tab.id,
        action: "execute",
        settings
      });
    }
  );
}

chrome.storage.sync.get(settings => {
  const boundActions = init({
    state: settings,
    actions,
    subscribers: [updatePage, saveSettings, applySettings]
  });

  addClickHandlers(boundActions);
});

// eslint-disable-next-line max-statements
(function main() {
  "use strict";

  const defaultSettings = {
    "is-disabled": false,
    groups: true,
    mygroups: false,
    people: false,
    external_links: false,
    links: true,
    apps: true,
    instagram: false,
    video: false,
    group_share: true,
    mem_link: false,
    event_share: true,
    wall_post_more: false,
    likes: false,
    comments: false
  };

  const classNames = [
    "external_links",
    "links",
    "apps",
    "instagram",
    "video",
    "group_share",
    "mem_link",
    "event_share",
    "wall_post_more",
    "likes",
    "comments"
  ];

  const cffvkFiltersSelector = classNames
    .map(className => `.cffvk-${className}`)
    .join();

  const groupsSelector = "[id^='feed_repost-'], [id^='feed_reposts_']";
  const groupsAndPeopleSelector = "[id^='feed_repost']";
  const myGroupsSelector = "[id^='post-'].post_copy";

  const hide = "{ display: none; }";
  const show = "{ display: block; }";

  const showAll = `
    ${groupsSelector} ${show}
    ${myGroupsSelector} ${show}
    ${groupsAndPeopleSelector} ${show}
    ${cffvkFiltersSelector} ${show}
  `;

  const hideCffvkFilters = `
    ${groupsSelector} ${show}
    ${myGroupsSelector} ${show}
    ${groupsAndPeopleSelector} ${show}
    ${cffvkFiltersSelector} ${hide}
  `;

  const hideGroups = `
    ${myGroupsSelector} ${show}
    ${groupsAndPeopleSelector} ${show}
    ${groupsSelector} ${hide}
    ${cffvkFiltersSelector} ${hide}
  `;

  const hideGroupsAndMyGroups = `
    ${groupsAndPeopleSelector} ${show}
    ${groupsSelector} ${hide}
    ${myGroupsSelector} ${hide}
    ${cffvkFiltersSelector} ${hide}
  `;

  const hideGroupsAndPeople = `
    ${myGroupsSelector} ${show}
    ${groupsSelector} ${show}
    ${groupsAndPeopleSelector} ${hide}
    ${cffvkFiltersSelector} ${hide}
  `;

  const hideAll = `
    ${groupsSelector} ${hide}
    ${myGroupsSelector} ${hide}
    ${groupsAndPeopleSelector} ${hide}
    ${cffvkFiltersSelector} ${hide}
  `;

  // eslint-disable-next-line fp/no-let
  let settings = defaultSettings;

  function getCss() {
    if (settings.groups) {
      if (settings.mygroups) {
        if (settings.people) {
          return hideAll;
        }

        return hideGroupsAndMyGroups;
      }

      if (settings.people) {
        return hideGroupsAndPeople;
      }

      return hideGroups;
    }

    return hideCffvkFilters;
  }

  function disable(tabId) {
    chrome.pageAction.setIcon({ tabId, path: "disabled-icon16.png" });
    chrome.tabs.insertCSS(tabId, { code: showAll });
    chrome.tabs.sendMessage(tabId, { action: "disable" });
  }

  // The main function
  function execute(tabId) {
    if (settings["is-disabled"]) {
      return disable(tabId);
    }

    chrome.pageAction.setIcon({ tabId, path: "icon16.png" });
    chrome.tabs.insertCSS(tabId, { code: getCss() });
    chrome.tabs.sendMessage(tabId, { action: "clean", settings });
  }

  function activate(sender) {
    if (/\/feed\?[wz]=/u.test(sender.tab.url)) {
      return;
    }

    if (
      !sender.tab.url.includes("vk.com/feed") ||
      /photos|videos|articles|likes|notifications|comments|updates|replies/u.test(
        sender.tab.url
      )
    ) {
      chrome.pageAction.hide(sender.tab.id);

      return disable(sender.tab.id);
    }

    chrome.storage.sync.get(function applySettings(loadedSettings) {
      if (Object.keys(loadedSettings).length === 0) {
        chrome.storage.sync.set(defaultSettings);
      } else {
        // eslint-disable-next-line fp/no-mutation
        settings = { ...defaultSettings, ...loadedSettings };
      }

      execute(sender.tab.id);
    });

    chrome.pageAction.show(sender.tab.id);
  }

  chrome.runtime.onMessage.addListener(function handleMessage(message, sender) {
    if (message.action === "execute") {
      // eslint-disable-next-line fp/no-mutation
      settings = { ...defaultSettings, ...message.settings };

      return execute(message.tabId);
    }

    if (message.action === "activate") {
      activate(sender);
    }
  });
})();

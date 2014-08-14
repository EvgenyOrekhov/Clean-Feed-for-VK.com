/*global chrome */
/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  // For older versions: convert localStorage to chrome.storage.sync
  function upgradeStorage() {
    var newSettings = {},
      key,
      i;

    for (i = 0; i < localStorage.length; i += 1) {
      key = localStorage.key(i);
      newSettings[key] = localStorage[key];
    }

    if (Object.keys(newSettings).length > 0) {
      chrome.storage.sync.set(newSettings, function () {
        localStorage.clear();
      });
    }
  }

  // The main function
  function execute(tabId) {
    chrome.storage.sync.get(null, function (settings) {
      var cssCode = "";

      if (settings.groups === "checked") {

        if (settings.people === "checked") {
          cssCode += "div[class^='feed_repost'] {display: none;}";
        } else {
          cssCode +=
            "div[class^='feed_repost'] {display: block;}" +
            "div[class^='feed_repost-']," +
            "div[class^='feed_reposts_'] {display: none;}";
        }

        if (settings.mygroups === "checked") {
          cssCode += "div[id^=post-].post_copy {display: none;}";
        } else {
          cssCode += "div[id^=post-].post_copy {display: block;}";
        }

      } else {
        cssCode += "div[class^='feed_repost']," +
          "div[id^=post-].post_copy {display: block;}";
      }

      chrome.tabs.insertCSS(tabId, {code: cssCode});
      chrome.tabs.executeScript(tabId, {code:
        "CFFVK.clean(" + JSON.stringify(settings) + ");"
        });
    });
  }

  // Do things with the second and the third checkboxes:
  function secondAndThirdCheckboxes() {
    chrome.storage.sync.get(null, function (settings) {
      var form = document.settingsForm,
        newSettings = {},
        label,
        checkbox,
        i;

      for (i = 2; i < 4; i += 1) {
        label = form.children[i];

        // If the first checkbox ("groups") is unchecked then uncheck
        // the second and the third and reset their settings in storage:
        if (settings.groups !== "checked") {
          label.style.display = "none";
          checkbox = label.children[0];
          checkbox.checked = false;
          newSettings[checkbox.name] = "";
        } else {
          label.style.display = "block";
        }
      }

      if (Object.keys(newSettings).length > 0) {
        chrome.storage.sync.set(newSettings);
      }
    });
  }

  // Catch clicks on checkboxes and remember the values ("checked"),
  // reapply the main function:
  function clickHandler(event) {
    var key = event.target.name,
      value = event.target.value,
      newSettings = {};

    chrome.storage.sync.get(key, function (settings) {
      newSettings[key] = settings[key] === value ? "" : value;
      chrome.storage.sync.set(newSettings, function () {
        secondAndThirdCheckboxes();
        execute();
      });
    });
  }

  if (localStorage.length > 0) {
    upgradeStorage();
  }

  // If there is no saved settings then set them to defaults
  // (check only the first checkbox):
  chrome.storage.sync.get(null, function (settings) {
    if (Object.keys(settings).length === 0) {
      chrome.storage.sync.set({"groups": "checked"});
    }
  });

  return {

    // Launch the main function only on certain pages of VK:
    checkForValidUrl: function checkForValidUrl(tabId, changeInfo, tab) {
      if (changeInfo.status === "loading") {
        var url = tab.url;

        if (url.indexOf("vk.com/feed") > -1) {
          if (!/photos|articles|likes|notifications|comments|updates|replies/
              .test(url)) {
            if (!/\/feed\?[wz]=/.test(url)) {
              chrome.pageAction.show(tabId);

              // divs with these classes will be hidden:
              chrome.tabs.insertCSS(tabId, {code:
                ".cffvk-groups, .cffvk-people, .cffvk-mygroups, .cffvk-links, .cffvk-group_share, .cffvk-event_share, .cffvk-wall_post_source_default, .cffvk-wall_post_more, .cffvk-post_like_icon, .cffvk-reply_link {display: none;}"
                });

              chrome.tabs.executeScript(tabId, {file: "content_script.js"});
              execute(tabId);
            }
          } else {

            // Show all the divs that have been hidden, stop observing:
            chrome.tabs.insertCSS(tabId, {code:
              "div[class^='feed_repost'], div[id^=post-].post_copy, .cffvk-groups, .cffvk-people, .cffvk-mygroups, .cffvk-links, .cffvk-group_share, .cffvk-event_share, .cffvk-wall_post_source_default, .cffvk-wall_post_more, .cffvk-post_like_icon, .cffvk-reply_link {display: block;}"
              });
            chrome.tabs.executeScript(tabId, {code:
              "if (window.CFFVK && CFFVK.observer) {" +
              "  CFFVK.observer.disconnect();" +
              "  console.log('CFFVK: cleaning disabled');" +
              "};"
              });
          }
        }
      }
    },

    init: function init() {
      var form = document.settingsForm,
        checkbox,
        i;

      if (form) {
        secondAndThirdCheckboxes();

        form = form.getElementsByTagName("input");
        chrome.storage.sync.get(null, function (settings) {
          for (i = 0; i < form.length; i += 1) {
            checkbox = form[i];
            checkbox.addEventListener("click", clickHandler);
            if (settings[checkbox.name] === "checked") {
              checkbox.checked = true;
            }
          }
        });
      }
    }
  };
}());

CFFVK.init();

chrome.tabs.onUpdated.addListener(CFFVK.checkForValidUrl);

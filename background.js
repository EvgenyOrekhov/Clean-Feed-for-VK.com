/*global chrome */
/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  //For older versions: convert localStorage to chrome.storage.sync
  function upgradeStorage() {
    var dataObj = {},
      name,
      i;
    for (i = 0; i < localStorage.length; i += 1) {
      name = localStorage.key(i);
      dataObj[name] = localStorage[name];
    }
    if (Object.keys(dataObj).length !== 0) {
      chrome.storage.sync.set(dataObj, function () {
        localStorage.clear();
      });
    }
  }

  if (localStorage.length > 0) {
    upgradeStorage();
  }

  //If there is no saved settings then set them to defaults (check only the first checkbox):
  chrome.storage.sync.get(null, function (data) {
    if (Object.keys(data).length === 0) {
      chrome.storage.sync.set({"groups": "checked"});
    }
  });

  return {

    //The main function
    execute: function execute(tabId) {
      chrome.storage.sync.get(null, function (data) {
        var cssCode = "",
          scriptCode = "CFFVK.clean = function clean() { 'use strict';";

        if (data.groups === "checked") {

          if (data.people === "checked") {
            cssCode += "div[class^='feed_repost'] {display: none;}";
          } else {
            cssCode +=
              "div[class^='feed_repost'] {display: block;}" +
              "div[class^='feed_repost-'], div[class^='feed_reposts_'] {display: none;}";
          }

          if (data.mygroups === "checked") {
            cssCode += "div[id^=post-].post_copy {display: none;}";
          } else {
            cssCode += "div[id^=post-].post_copy {display: block;}";
          }

        } else {
          cssCode += "div[class^='feed_repost'], div[id^=post-].post_copy {display: block;}";
        }

        scriptCode +=
          "var els = CFFVK.feed.getElementsByTagName('a')," +
          "  l = els.length," +
          "  i," +
          "  el;" +
          "for (i = 0; i < l; i += 1) {" +
          "  el = els[i];" +
          "  if (/sprashivai\\.ru|spring\\.me|nekto\\.me|ask\\.fm/.test(el.href)) {" +
          "    CFFVK.processFeedItem(el, '" + data.links + "', ' cffvk-links');" +
          "  }" +
          "}" +
          "CFFVK.find('group_share', '" + data.group_share + "', 'cffvk-group_share');" +
          "CFFVK.find('event_share', '" + data.event_share + "', 'cffvk-event_share');" +
          "CFFVK.find('wall_post_source_default', '" + data.apps + "', 'cffvk-apps');" +
          "CFFVK.find('wall_post_more', '" + data.wall_post_more + "', 'cffvk-wall_post_more');" +
          "CFFVK.find('post_like_icon no_likes', '" + data.likes + "', 'cffvk-likes');" +
          "CFFVK.find('reply_link', '" + data.comments + "', 'cffvk-comments');" +
          "};" +
          "CFFVK.clean();" +
          "console.log('Clean Feed for VK.com: your feed has been cleaned');";

        chrome.tabs.insertCSS(tabId, {code: cssCode});
        chrome.tabs.executeScript(tabId, {code: scriptCode});
      });
    },

    //Do things with the second and the third checkboxes:
    checkboxes: function checkboxes() {
      var select = document.settingsForm,
        child;

      chrome.storage.sync.get(null, function (data) {
        var dataObj = {},
          i;

        for (i = 2; i < 4; i += 1) {
          child = select.children[i];

          //If the first checkbox ("groups") is unchecked then uncheck the second and the third and reset their settings in storage:
          if (data.groups !== "checked") {
            child.style.display = "none";
            child = child.children[0];
            child.checked = false;
            dataObj[child.name] = "";
          } else {
            child.style.display = "block";
          }
        }

        if (Object.keys(dataObj).length !== 0) {
          chrome.storage.sync.set(dataObj);
        }
      });
    },

    //Catch clicks on checkboxes and remember the values ("checked"), reapply the main function:
    clickHandler: function clickHandler() {
      var name = this.name,
        value = this.value,
        dataObj = {};

      chrome.storage.sync.get(name, function (data) {
        dataObj[name] = data[name] === value ? "" : value;
        chrome.storage.sync.set(dataObj, function () {
          CFFVK.checkboxes();
          CFFVK.execute();
        });
      });
    },

    //Launch the main function only on certain pages of VK:
    checkForValidUrl: function checkForValidUrl(tabId, changeInfo, tab) {
      if (changeInfo.status === "loading") {
        var url = tab.url;

        if (url.indexOf("vk.com/feed") !== -1) {
          if (!/photos|articles|likes|notifications|comments|updates|replies/.test(url)) {
            if (!/\/feed\?[wz]=/.test(url)) {
              chrome.pageAction.show(tabId);

              //divs with these classes will be hidden:
              chrome.tabs.insertCSS(tabId, {code:
                ".cffvk-groups, .cffvk-people, .cffvk-mygroups, .cffvk-links, .cffvk-group_share, .cffvk-event_share, .cffvk-apps, .cffvk-wall_post_more, .cffvk-likes, .cffvk-comments {display: none;}"
                });

              chrome.tabs.executeScript(tabId, {file: "content_script.js"});
              CFFVK.execute(tabId);
            }
          } else {

            //Show all the divs that have been hidden, stop observing:
            chrome.tabs.insertCSS(tabId, {code:
              "div[class^='feed_repost'], div[id^=post-].post_copy, .cffvk-groups, .cffvk-people, .cffvk-mygroups, .cffvk-links, .cffvk-group_share, .cffvk-event_share, .cffvk-apps, .cffvk-wall_post_more, .cffvk-likes, .cffvk-comments {display: block;}"
              });
            chrome.tabs.executeScript(tabId, {code:
              "if (window.CFFVK && CFFVK.observer) {" +
              "  CFFVK.observer.disconnect();" +
              "  console.log('Clean Feed for VK.com: cleaning disabled');" +
              "};"
              });
          }
        }
      }
    },

    init: function init() {
      var select = document.settingsForm,
        child,
        i;

      if (select) {
        CFFVK.checkboxes();
        select = select.getElementsByTagName("input");
        chrome.storage.sync.get(null, function (data) {
          for (i = 0; i < select.length; i += 1) {
            child = select[i];
            child.addEventListener("click", CFFVK.clickHandler);
            if (data[child.name] === "checked") {
              child.checked = true;
            }
          }
        });
      }
    }
  };
}());

CFFVK.init();

chrome.tabs.onUpdated.addListener(CFFVK.checkForValidUrl);

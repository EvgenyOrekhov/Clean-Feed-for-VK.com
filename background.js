/*global chrome */
/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  var settings;

  // The main function
  function execute(tabId) {
    var cssCode = "";

    if (settings.groups === "checked") {

      if (settings.people === "checked") {
        cssCode += "div[class^='feed_repost'] { display: none; }";
      } else {
        cssCode +=
          "div[class^='feed_repost'] { display: block; }" +
          "div[class^='feed_repost-']," +
          "div[class^='feed_reposts_'] { display: none; }";
      }

      if (settings.mygroups === "checked") {
        cssCode += "div[id^=post-].post_copy { display: none; }";
      } else {
        cssCode += "div[id^=post-].post_copy { display: block; }";
      }

    } else {
      cssCode += "div[class^='feed_repost']," +
        "div[id^=post-].post_copy { display: block; }";
    }

    chrome.tabs.insertCSS(tabId, {
      code: cssCode
    });
    chrome.tabs.executeScript(tabId, {
      code: "CFFVK.clean(" + JSON.stringify(settings) + ");"
    });
  }

  // Do things with the second and the third checkboxes:
  function hideOrShowCheckboxes2and3() {
    var form = document.settingsForm,
      newSettings = {},
      label,
      checkbox,
      i;

    for (i = 2; i < 4; i += 1) {
      label = form.children[i];

      // If the first checkbox ("groups") is unchecked
      // then uncheck the second and the third, hide them,
      // and reset their settings in storage:
      if (settings.groups !== "checked") {
        label.style.display = "none";
        checkbox = label.children[0];
        checkbox.checked = false;
        settings[checkbox.name] = newSettings[checkbox.name] = "";
      } else {
        label.style.display = "block";
      }
    }

    if (Object.keys(newSettings).length > 0) {
      chrome.storage.sync.set(settings);
    }
  }

  // Catch clicks on checkboxes and remember the values ("checked"),
  // reapply the main function:
  function handleClick(event) {
    var name = event.target.name,
      value = event.target.value;

    settings[name] = settings[name] === value ? "" : value;

    chrome.storage.sync.set(settings, function () {
      hideOrShowCheckboxes2and3();
      execute();
    });
  }

  function setUpTheSettingsPage() {
    if (document.settingsForm) {
      var checkboxes = document.settingsForm.getElementsByTagName("input"),
        checkbox,
        i;

      hideOrShowCheckboxes2and3();

      for (i = 0; i < checkboxes.length; i += 1) {
        checkbox = checkboxes[i];
        checkbox.addEventListener("click", handleClick);
        if (settings[checkbox.name] === "checked") {
          checkbox.checked = true;
        }
      }
    }
  }

  if (localStorage.length > 0) {

    // For older versions: convert localStorage to chrome.storage.sync
    (function upgradeStorage() {
      var convertedSettings = {},
        key,
        i;

      for (i = 0; i < localStorage.length; i += 1) {
        key = localStorage.key(i);
        convertedSettings[key] = localStorage[key];
      }

      settings = convertedSettings;
      setUpTheSettingsPage();
      chrome.storage.sync.set(settings, function () {
        localStorage.clear();
      });
    }());
  } else {

    // Load settings. If there are none, set them to defaults
    // (check only the first checkbox):
    chrome.storage.sync.get(null, function (loadedSettings) {
      if (Object.keys(loadedSettings).length === 0) {
        settings = {
          groups: "checked"
        };
        chrome.storage.sync.set(settings);
      } else {
        settings = loadedSettings;
      }

      setUpTheSettingsPage();
    });
  }

  return {

    // Launch the main function only on certain pages of VK:
    checkForValidUrl: function checkForValidUrl(tabId, changeInfo, tab) {
      if (changeInfo.status === "loading") {
        var url = tab.url,

          // divs with these classes will be hidden:
          cssCode =
            ".cffvk-groups," +
            ".cffvk-people," +
            ".cffvk-mygroups," +
            ".cffvk-links," +
            ".cffvk-group_share," +
            ".cffvk-event_share," +
            ".cffvk-wall_post_source_default," +
            ".cffvk-wall_post_more," +
            ".cffvk-post_like_icon," +
            ".cffvk-reply_link";

        if (url.indexOf("vk.com/feed") > -1) {
          if (!/photos|articles|likes|notifications|comments|updates|replies/
              .test(url)) {
            if (!/\/feed\?[wz]=/.test(url)) {

              // We have to get the settings on every page load because
              // `handleClick` works in a different context (popup) and it
              // doesn't update our `settings` variable
              chrome.storage.sync.get(null, function (loadedSettings) {
                settings = loadedSettings;
                chrome.tabs.executeScript(
                  tabId,
                  {
                    file: "content_script.js"
                  },
                  function () {
                    execute(tabId);
                  }
                );
              });

              chrome.pageAction.show(tabId);

              chrome.tabs.insertCSS(tabId, {
                code: cssCode + "{ display: none; }"
              });

            }
          } else {

            // Show all the divs that have been hidden, stop observing:
            chrome.tabs.insertCSS(tabId, {
              code:
                cssCode + "," +
                "div[class^='feed_repost']," +
                "div[id^=post-].post_copy { display: block; }"
            });
            chrome.tabs.executeScript(tabId, {
              code:
                "if (window.CFFVK && CFFVK.observer) {" +
                "  CFFVK.observer.disconnect();" +
                "  console.log('CFFVK: cleaning disabled');" +
                "};"
            });
          }
        }
      }
    }
  };
}());

chrome.tabs.onUpdated.addListener(CFFVK.checkForValidUrl);

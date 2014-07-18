//The main function
function apply(tabId) {
  "use strict";
  chrome.storage.sync.get(null, function (data) {
    var cssCode = "",
      scriptCode = "function nkchgApply() { 'use strict';";

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
      "var els = nkchgWall.getElementsByTagName('a')," +
      "  l = els.length," +
      "  i," +
      "  el;" +
      "for (i = 0; i < l; i += 1) {" +
      "  el = els[i];" +
      "  if (/sprashivai\\.ru|spring\\.me|nekto\\.me|ask\\.fm/.test(el.href)) {" +
      "    nkchgClosestEl(el, '" + data.links + "', ' nkchgLinks');" +
      "  }" +
      "}" +
      "nkchgFind('group_share', '" + data.group_share + "', 'nkchgGroup_share');" +
      "nkchgFind('event_share', '" + data.event_share + "', 'nkchgEvent_share');" +
      "nkchgFind('wall_post_source_default', '" + data.apps + "', 'nkchgApps');" +
      "nkchgFind('wall_post_more', '" + data.wall_post_more + "', 'nkchgWall_post_more');" +
      "nkchgFind('post_like_icon no_likes', '" + data.likes + "', 'nkchgLikes');" +
      "nkchgFind('reply_link', '" + data.comments + "', 'nkchgComments');" +
      "}";

    chrome.tabs.insertCSS(tabId, {code: cssCode});

    chrome.tabs.executeScript(tabId, {code:
      scriptCode +
      "nkchgApply();" +
      "console.log('Чистые новости для VK.com: your wall has been cleaned');"
      });
  });
}

//Do things with the second and the third checkbox:
function checkboxes() {
  "use strict";
  var select = document.settingsForm,
    child;
  chrome.storage.sync.get(null, function (data) {
    //Show/hide the second and the third checkbox depending on the state of the first checkbox ("groups"):
    var dataObj = {},
      i;
    for (i = 2; i < 4; i += 1) {
      child = select.children[i];
      //If the first checkbox ("groups") is unchecked then uncheck the second and the third and reset their settings in storage:
      if (data.groups !== "checked") {
        child.style.display = 'none';
        child = child.children[0];
        child.checked = false;
        dataObj[child.name] = "";
      } else {
        child.style.display = 'block';
      }
    }
    if (Object.keys(dataObj).length !== 0) {
      chrome.storage.sync.set(dataObj);
    }
  });
}

//Catch clicks on checkboxes and remember the values ("checked"), reapply the main function:
function clickHandler() {
  "use strict";
  var name = this.name,
    value = this.value,
    dataObj = {};
  chrome.storage.sync.get(name, function (data) {
    dataObj[name] = data[name] === value ? "" : value;
    chrome.storage.sync.set(dataObj, function () {
      checkboxes();
      apply();
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  "use strict";
  //For older versions: convert localStorage to chrome.storage.sync
  var dataObj = {},
    select = document.settingsForm,
    name,
    child,
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
  //If there is no saved settings then set them to defaults (check only the first checkbox):
  chrome.storage.sync.get(null, function (data) {
    if (Object.keys(data).length === 0) {
      chrome.storage.sync.set({"groups": "checked"});
    }
  });
  if (select) {
    checkboxes();
    select = select.getElementsByTagName("input");
    chrome.storage.sync.get(null, function (data) {
      for (i = 0; i < select.length; i += 1) {
        child = select[i];
        child.addEventListener('click', clickHandler);
        if (data[child.name] === "checked") {
          child.checked = true;
        }
      }
    });
  }
});

//Launch the main function only on certain pages of VK:
function checkForValidUrl(tabId, changeInfo, tab) {
  "use strict";
  if (changeInfo.status === "loading") {
    var url = tab.url;
    if (url.indexOf('vk.com/feed') !== -1) {
      if (!/photos|articles|likes|notifications|comments|updates|replies/.test(url)) {
        if (!/\/feed\?[wz]=/.test(url)) {
          chrome.pageAction.show(tabId);
          //<div>s with these classes will be hidden:
          chrome.tabs.insertCSS(tabId, {code:
            ".nkchgGroups, .nkchgPeople, .nkchgMygroups, .nkchgLinks, .nkchgGroup_share, .nkchgEvent_share, .nkchgApps, .nkchgWall_post_more, .nkchgLikes, .nkchgComments {display: none;}"
            });
          chrome.tabs.executeScript(tabId, {code:
            "var nkchgWall = document.getElementById('feed_rows');" +
            "if (!nkchgObserver) {" +
            "  var nkchgObserver = new window.MutationObserver(function (mutations) {" +
            "    'use strict';" +
            "    if (mutations[0].addedNodes.length !== 0) {" +
            "      nkchgApply();" +
            "      console.log('Чистые новости для VK.com: your wall has been cleaned by the MutationObserver');" +
            "    }" +
            "  });" +
            "}" +
            "nkchgObserver.observe(nkchgWall, {childList: true});" +
            "function nkchgClosestEl(elem, action, nkchgClass) {" +
            "  'use strict';" +
            "  var parent = elem.parentNode," +
            "    re = new RegExp(nkchgClass, 'g');" +
            "  while (parent !== nkchgWall) {" +
            "    if (parent.className.indexOf('feed_row') !== -1) {" +
            "      if (action === 'checked') {" +
            "        if (parent.className.indexOf(nkchgClass) === -1) {" +
            "          parent.className += nkchgClass;" +
            "        }" +
            "        return;" +
            "      } else {" +
            "        parent.className = parent.className.replace(re, '');" +
            "        return;" +
            "      }" +
            "    } else {" +
            "      parent = parent.parentNode;" +
            "    }" +
            "  }" +
            "}" +
            "function nkchgFind(className, action, newClassName) {" +
            "  'use strict';" +
            "  var els = nkchgWall.getElementsByClassName(className)," +
            "    l = els.length," +
            "    i," +
            "    el;" +
            "  for (i = 0; i < l; i += 1) {" +
            "    el = els[i];" +
            "    if (!(newClassName === 'nkchgApps' && el.href.indexOf('app3698024') !== -1)) {" +
            "      nkchgClosestEl(el, action, ' ' + newClassName);" +
            "    }" +
            "  }" +
            "}"
            });
          apply(tabId);
        }
      } else {
        //Show all the <div>s that have been hidden, stop observing:
        chrome.tabs.insertCSS(tabId, {code:
          "div[class^='feed_repost'], div[id^=post-].post_copy, .nkchgGroups, .nkchgPeople, .nkchgMygroups, .nkchgLinks, .nkchgGroup_share, .nkchgEvent_share, .nkchgApps, .nkchgWall_post_more, .nkchgLikes, .nkchgComments {display: block;}"
          });
        chrome.tabs.executeScript(tabId, {code:
          "if (nkchgObserver) nkchgObserver.disconnect();" +
          "console.log('Чистые новости для VK.com: cleaning disabled');"
          });
      }
    }
  }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

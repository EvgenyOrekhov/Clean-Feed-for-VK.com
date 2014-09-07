/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  var settings;

  function processFeedItem(elem, setting, newClassName) {
    var parent = elem.parentNode;

    while (parent !== CFFVK.feed) {
      if (parent.className.indexOf("feed_row") > -1) {
        if (setting === "checked") {
          if (parent.className.indexOf(newClassName) === -1) {
            parent.className += newClassName;
          }
          return;
        }
        newClassName = new RegExp(newClassName, "g");
        parent.className = parent.className.replace(newClassName, "");
        return;
      }
      parent = parent.parentNode;
    }
  }

  function find(className, setting) {
    var els = CFFVK.feed.getElementsByClassName(className),
      l = els.length,
      newClassName = "cffvk-" + className,
      i,
      el;

    for (i = 0; i < l; i += 1) {
      el = els[i];
      if (!(newClassName === "cffvk-wall_post_source_default" &&
          el.href.indexOf("app3698024") > -1)) {
        processFeedItem(el, setting, " " + newClassName);
      }
    }
  }

  return {
    clean: function clean(receivedSettings) {
      var els = CFFVK.feed.getElementsByTagName("a"),
        l = els.length,
        i,
        el;

      if (receivedSettings) {
        settings = receivedSettings;
      }

      for (i = 0; i < l; i += 1) {
        el = els[i];
        if (/sprashivai\.ru|spring\.me|nekto\.me|ask\.fm/.test(el.href)) {
          processFeedItem(el, settings.links, " cffvk-links");
        }
      }

      find("group_share", settings.group_share);
      find("event_share", settings.event_share);
      find("wall_post_source_default", settings.apps);
      find("wall_post_more", settings.wall_post_more);
      find("post_like_icon no_likes", settings.likes);
      find("reply_link", settings.comments);

      console.log("CFFVK: your feed has been cleaned");
    },

    observer: new window.MutationObserver(function (mutations) {
      if (mutations[0].addedNodes.length > 0) {
        CFFVK.clean();
        console.log("       by the MutationObserver");
      }
    })
  };
}());

CFFVK.feed = document.getElementById("feed_rows");

CFFVK.observer.observe(CFFVK.feed, {
  childList: true
});

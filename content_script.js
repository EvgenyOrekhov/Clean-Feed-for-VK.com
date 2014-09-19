/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  var settings;

  function processFeedItem(elem, setting, newClassName) {
    var parent = elem.parentNode;

    while (parent !== CFFVK.feed) {
      if (parent.classList.contains("feed_row")) {
        if (setting === "checked") {
          parent.classList.add(newClassName);
          return;
        }
        parent.classList.remove(newClassName);
        return;
      }
      parent = parent.parentNode;
    }
  }

  function find(className, setting) {
    var els = [].slice.call(CFFVK.feed.getElementsByClassName(className)),
      newClassName = "cffvk-" + className.replace(/\s/g, "-");

    els.forEach(function (el) {
      if (!(newClassName === "cffvk-wall_post_source_default" &&
          el.href.indexOf("app3698024") > -1)) {
        processFeedItem(el, setting, newClassName);
      }
    });
  }

  return {
    clean: function clean(receivedSettings) {
      var links = [].slice.call(CFFVK.feed.getElementsByTagName("a")),
        mentions = [].slice.call(CFFVK.feed.getElementsByClassName("mem_link"));

      if (receivedSettings) {
        settings = receivedSettings;
      }

      links.forEach(function (el) {
        if (/sprashivai\.ru|spring\.me|nekto\.me|ask\.fm/.test(el.href)) {
          processFeedItem(el, settings.links, "cffvk-links");
        }
      });

      mentions.forEach(function (el) {
        if (el.getAttribute("mention_id").indexOf("club") > -1) {
          processFeedItem(el, settings.mem_link, "cffvk-mem_link");
        }
      });

      find("wall_post_source_default", settings.apps);
      find("group_share", settings.group_share);
      find("event_share", settings.event_share);
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
    }),

    removeInlineStyles: function removeInlineStyles() {
      var posts = [].slice.call(
        CFFVK.feed.getElementsByClassName("feed_row")
      );

      posts.forEach(function (post) {
        post.removeAttribute("style");
      });
      window.scrollTo(0, 0);
    }
  };
}());

CFFVK.feed = document.getElementById("feed_rows");

CFFVK.observer.observe(CFFVK.feed, {
  childList: true
});

document.getElementById("feed_new_posts").
  addEventListener("click", CFFVK.removeInlineStyles);

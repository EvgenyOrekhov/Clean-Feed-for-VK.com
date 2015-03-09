/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  var classNamesToFind = {
      apps: "wall_post_source_default",
      group_share: "group_share",
      event_share: "event_share",
      wall_post_more: "wall_post_more",
      likes: "post_like_icon no_likes",
      comments: "reply_link"
    },
    settings;

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

  function find(settingName) {
    var className = classNamesToFind[settingName],
      els = Array.prototype.slice.call(
        CFFVK.feed.getElementsByClassName(className)
      ),
      newClassName = "cffvk-" + className.replace(/\s/g, "-");

    els.forEach(function (el) {
      processFeedItem(el, settings[settingName], newClassName);
    });
  }

  return {
    clean: function clean(receivedSettings) {
      var links = Array.prototype.slice.call(
          CFFVK.feed.getElementsByTagName("a")
        ),
        mentions = Array.prototype.slice.call(
          CFFVK.feed.getElementsByClassName("mem_link")
        );

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

      Object.keys(classNamesToFind).forEach(find);

      console.log("CFFVK: your feed has been cleaned");
    },

    observer: new window.MutationObserver(function (mutations) {
      if (mutations[0].addedNodes.length > 0) {
        CFFVK.clean();
        console.log("       by the MutationObserver");
      }
    }),

    removeInlineStyles: function removeInlineStyles() {
      var posts = Array.prototype.slice.call(
        CFFVK.feed.getElementsByClassName("feed_row")
      );

      posts.forEach(function (post) {
        post.removeAttribute("style");
      });

      window.scroll(0, 0);
    }
  };
}());

CFFVK.feed = document.getElementById("feed_rows");

CFFVK.observer.observe(CFFVK.feed, {childList: true});

document.getElementById("feed_new_posts").
  addEventListener("click", CFFVK.removeInlineStyles);

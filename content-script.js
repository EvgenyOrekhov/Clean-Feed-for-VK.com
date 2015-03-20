/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  "use strict";

  var qAndALinksSelectors = [
      "[href*='sprashivai.ru']",
      "[href*='spring.me']",
      "[href*='nekto.me']",
      "[href*='ask.fm']"
    ],
    selectorsToFind = {
      links: qAndALinksSelectors.join(","),
      apps: ".wall_post_source_default",
      group_share: ".group_share",
      mem_link: ".mem_link[mention_id^='club']",
      event_share: ".event_share",
      external_links: "a[href^='/away.php?to=']:not(.wall_post_source_icon)",
      wall_post_more: ".wall_post_more",
      likes: ".post_like_icon.no_likes",
      comments: ".reply_link"
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
    var selector = selectorsToFind[settingName],
      els = Array.prototype.slice.call(
        CFFVK.feed.querySelectorAll(selector)
      ),
      newClassName = "cffvk-" + settingName;

    els.forEach(function (el) {
      processFeedItem(el, settings[settingName], newClassName);
    });
  }

  return {
    clean: function clean(receivedSettings) {
      if (receivedSettings) {
        settings = receivedSettings;
      }
      Object.keys(selectorsToFind).forEach(find);
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

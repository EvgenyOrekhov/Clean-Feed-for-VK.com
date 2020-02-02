// eslint-disable-next-line max-statements
(function main() {
  "use strict";

  const qAndALinks = [
    "ask.fm",
    "askfm.im",
    "askfm.su",
    "askmes.ru",
    "nekto.me",
    "sprashivai.ru",
    "sprashivaii.ru",
    "sprashivalka.com",
    "sprosi.name"
  ];

  const selectors = {
    links: qAndALinks
      .map(qAndALink => `.wall_text [href*="${qAndALink}"]`)
      .join(),

    apps: ".wall_post_source_default",
    instagram: ".wall_post_source_instagram",
    video: ".wall_text .page_post_thumb_video",
    group_share: ".page_group_share",
    mem_link: ".mem_link[mention_id^='club']",
    event_share: ".event_share",
    external_links:
      ".wall_text [href^='/away.php?to=']:not(.wall_post_source_icon)",
    wall_post_more: ".wall_post_more,.wall_copy_more",
    likes: ".like.empty",
    comments: ".comment.empty"
  };

  // eslint-disable-next-line fp/no-let
  let feed = document.querySelector("#feed_rows");

  // eslint-disable-next-line fp/no-let, init-declarations
  let settings;

  function toggleCffvkClass([settingName, selector]) {
    feed
      .querySelectorAll(selector)
      .map(element => element.closest(".feed_row"))
      .filter(Boolean)
      .filter(function isNotAd(element) {
        return (
          element.querySelector(
            ".wall_text_name_explain_promoted_post, .ads_ads_news_wrap"
          ) === null
        );
      })
      .forEach(feedRow =>
        feedRow.classList.toggle(`cffvk-${settingName}`, settings[settingName])
      );
  }

  function clean() {
    Object.entries(selectors).forEach(toggleCffvkClass);
    console.log("CFFVK: your feed has been cleaned");
  }

  function removeInlineStyles() {
    const posts = feed.querySelectorAll(".feed_row");

    posts.forEach(post => post.removeAttribute("style"));

    scroll(0, 0);
  }

  function startUrlCheck() {
    // eslint-disable-next-line fp/no-let
    let url = location.href;

    const intervalDuration = 100;

    function checkUrl() {
      if (url !== location.href) {
        // eslint-disable-next-line fp/no-mutation
        url = location.href;
        chrome.runtime.sendMessage({ action: "activate" });
      }
    }

    setInterval(checkUrl, intervalDuration);
  }

  // eslint-disable-next-line fp/no-mutation
  NodeList.prototype.map = NodeList.prototype.map || Array.prototype.map;

  const observer = new MutationObserver(function processMutations(mutations) {
    if (mutations[0].addedNodes.length !== 0) {
      clean();
      console.log("             by the MutationObserver");
    }
  });

  chrome.runtime.onMessage.addListener(function handleMessage(message) {
    if (message.action === "clean") {
      // eslint-disable-next-line fp/no-mutation
      feed = document.querySelector("#feed_rows");
      observer.disconnect();
      observer.observe(feed, { childList: true, subtree: true });
      document
        .querySelector("#feed_new_posts")
        .addEventListener("click", removeInlineStyles);
      // eslint-disable-next-line fp/no-mutation, prefer-destructuring
      settings = message.settings;

      return clean();
    }

    if (message.action === "disable") {
      observer.disconnect();
      console.log("CFFVK: cleaning disabled");
    }
  });

  chrome.runtime.sendMessage({ action: "activate" });

  startUrlCheck();
})();

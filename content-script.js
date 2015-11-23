/*global chrome, MutationObserver, scroll, NodeList */
/*jslint browser: true, devel: true */

(function () {
    "use strict";

    var qAndALinks = [
            "ask.fm",
            "askbook.me",
            "askfm.im",
            "askfm.su",
            "askmes.ru",
            "askzone.su",
            "my-truth.ru",
            "nekto.me",
            "otvechayu.ru",
            "qroom.ru",
            "sprashivai.by",
            "sprashivai.ru",
            "sprashivaii.ru",
            "sprashivalka.com",
            "spring.me",
            "sprosimenya.com",
            "sprosi.name",
            "vopros.me",
            "voprosmne.ru"
        ],
        selectorsToFind = {

            links: qAndALinks
                .map(function (qAndALink) {
                    return ".wall_text [href*='" + qAndALink + "']";
                })
                .join(),

            apps: ".wall_post_source_default",
            instagram: ".wall_post_source_instagram",
            group_share: ".group_share",
            mem_link: ".mem_link[mention_id^='club']",
            event_share: ".event_share",
            external_links:
                    ".wall_text [href^='/away.php?to=']" +
                    ":not(.wall_post_source_icon)",
            wall_post_more: ".wall_post_more",
            likes: ".post_like_icon.no_likes",
            comments: ".reply_link"
        },
        feed = document.querySelector("#feed_rows"),
        url = location.href,
        observer,
        settings;

    function processFeedItem(elem, setting, newClassName) {
        if (elem === feed) {
            return;
        }

        if (!elem.classList.contains("feed_row")) {
            return processFeedItem(elem.parentNode, setting, newClassName);
        }

        if (setting) {
            return elem.classList.add(newClassName);
        }

        elem.classList.remove(newClassName);
    }

    function find(settingName) {
        var selector = selectorsToFind[settingName],
            els = feed.querySelectorAll(selector),
            newClassName = "cffvk-" + settingName;

        els.forEach(function (el) {
            processFeedItem(el, settings[settingName], newClassName);
        });
    }

    function clean(receivedSettings) {
        if (receivedSettings) {
            settings = receivedSettings;
        }
        Object.keys(selectorsToFind).forEach(find);
        console.log("CFFVK: your feed has been cleaned");
    }

    function removeInlineStyles() {
        var posts = feed.querySelectorAll(".feed_row");

        posts.forEach(function (post) {
            post.removeAttribute("style");
        });

        scroll(0, 0);
    }

    function checkUrl() {
        if (url !== location.href) {
            url = location.href;
            chrome.runtime.sendMessage({
                action: "activate"
            });
        }
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach ||
            Array.prototype.forEach;

    observer = new MutationObserver(function (mutations) {
        if (mutations[0].addedNodes.length > 0) {
            clean();
            console.log("             by the MutationObserver");
        }
    });

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.action === "clean") {
            feed = document.querySelector("#feed_rows");
            observer.disconnect();
            observer.observe(feed, {
                childList: true,
                subtree: true
            });
            document.querySelector("#feed_new_posts")
                .addEventListener("click", removeInlineStyles);

            return clean(message.settings);
        }

        if (message.action === "disable") {
            observer.disconnect();
            console.log("CFFVK: cleaning disabled");
        }
    });

    chrome.runtime.sendMessage({
        action: "activate"
    });
    setInterval(checkUrl, 100);
}());

/*global chrome, MutationObserver, scroll, NodeList */
/*jslint browser, devel, maxlen: 80 */
/*eslint camelcase: 0, max-statements: 0 */

(function main() {
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
    ];
    var selectors = {

        links: qAndALinks
            .map(function buildSelector(qAndALink) {
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
    };
    var feed = document.querySelector("#feed_rows");
    var settings;

    function find(settingName) {
        function processFeedRow(feedRow) {
            var newClassName = "cffvk-" + settingName;

            if (settings[settingName]) {
                return feedRow.classList.add(newClassName);
            }

            feedRow.classList.remove(newClassName);
        }

        var elements = feed.querySelectorAll(selectors[settingName]);

        elements
            .map(function getClosestFeedRow(element) {
                return element.closest(".feed_row");
            })
            .filter(function filterNulls(element) {
                return element;
            })
            .forEach(processFeedRow);
    }

    function clean() {
        Object.keys(selectors).forEach(find);
        console.log("CFFVK: your feed has been cleaned");
    }

    function removeInlineStyles() {
        var posts = feed.querySelectorAll(".feed_row");

        posts.forEach(function removeInlineStyle(post) {
            post.removeAttribute("style");
        });

        scroll(0, 0);
    }

    function startUrlCheck() {
        var url = location.href;
        var intervalDuration = 100;

        function checkUrl() {
            if (url !== location.href) {
                url = location.href;
                chrome.runtime.sendMessage({
                    action: "activate"
                });
            }
        }

        setInterval(checkUrl, intervalDuration);
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach ||
            Array.prototype.forEach;
    NodeList.prototype.map = NodeList.prototype.map ||
            Array.prototype.map;

    var observer = new MutationObserver(function processMutations(mutations) {
        if (mutations[0].addedNodes.length > 0) {
            clean();
            console.log("             by the MutationObserver");
        }
    });

    chrome.runtime.onMessage.addListener(function handleMessage(message) {
        if (message.action === "clean") {
            feed = document.querySelector("#feed_rows");
            observer.disconnect();
            observer.observe(feed, {
                childList: true,
                subtree: true
            });
            document.querySelector("#feed_new_posts")
                .addEventListener("click", removeInlineStyles);
            settings = message.settings;

            return clean();
        }

        if (message.action === "disable") {
            observer.disconnect();
            console.log("CFFVK: cleaning disabled");
        }
    });

    chrome.runtime.sendMessage({
        action: "activate"
    });
    startUrlCheck();
}());

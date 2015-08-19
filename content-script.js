/*global MutationObserver, scroll, chrome */
/*jslint browser: true, devel: true */

var CFFVK;

CFFVK = CFFVK || (function () {
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

            links: qAndALinks.map(function (qAndALink) {
                return "[href*='" + qAndALink + "']";
            }).join(),

            apps: ".wall_post_source_default",
            instagram: ".wall_post_source_instagram",
            group_share: ".group_share",
            mem_link: ".mem_link[mention_id^='club']",
            event_share: ".event_share",
            external_links:
                    "a[href^='/away.php?to=']:not(.wall_post_source_icon)",
            wall_post_more: ".wall_post_more",
            likes: ".post_like_icon.no_likes",
            comments: ".reply_link"
        },
        settings;

    function processFeedItem(elem, setting, newClassName) {
        if (elem === CFFVK.feed) {
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
            els = Array.prototype.slice.call(
                CFFVK.feed.querySelectorAll(selector)
            ),
            newClassName = "cffvk-" + settingName;

        els.forEach(function (el) {
            processFeedItem(el, settings[settingName], newClassName);
        });
    }

    chrome.runtime.onMessage.addListener(
        function (message) {
            if (message.action === "clean") {
                return CFFVK.clean(message.settings);
            }

            if (message.action === "disable") {
                CFFVK.observer.disconnect();
                console.log("CFFVK: cleaning disabled");
            }
        }
    );

    return {
        clean: function clean(receivedSettings) {
            if (receivedSettings) {
                settings = receivedSettings;
            }
            Object.keys(selectorsToFind).forEach(find);
            console.log("CFFVK: your feed has been cleaned");
        },

        observer: new MutationObserver(function (mutations) {
            if (mutations[0].addedNodes.length > 0) {
                CFFVK.clean();
                console.log("             by the MutationObserver");
            }
        }),

        removeInlineStyles: function removeInlineStyles() {
            var posts = Array.prototype.slice.call(
                CFFVK.feed.getElementsByClassName("feed_row")
            );

            posts.forEach(function (post) {
                post.removeAttribute("style");
            });

            scroll(0, 0);
        }
    };
}());

CFFVK.feed = document.getElementById("feed_rows");

CFFVK.observer.observe(CFFVK.feed, {childList: true});

document.getElementById("feed_new_posts")
    .addEventListener("click", CFFVK.removeInlineStyles);

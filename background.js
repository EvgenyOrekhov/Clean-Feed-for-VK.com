/*global chrome */
/*jslint browser: true */

(function () {
    "use strict";

    var classNames = [
            "external_links",
            "links",
            "apps",
            "instagram",
            "group_share",
            "mem_link",
            "event_share",
            "wall_post_more",
            "likes",
            "comments"
        ],
        css = {
            groups: "[id^='feed_repost-'], [id^='feed_reposts_'] " +
                    "{ display: none; }",
            myGroups: "[id^='post-'].post_copy { display: none; }",
            groupsAndPeople: "[id^='feed_repost'] { display: none; }",

            filters: classNames.map(function (className) {
                return ".cffvk-" + className;
            }).join() + "{ display: none; }",

            show: function show(rule) {
                return rule.replace(/none/g, "block");
            }
        },
        settings = {
            groups: true,
            links: true,
            apps: true,
            group_share: true,
            event_share: true
        };

    // The main function
    function execute(tabId) {
        var cssCode = "";

        if (settings.groups) {

            if (settings.people) {
                cssCode += css.groupsAndPeople;
            } else {
                cssCode += css.show(css.groupsAndPeople) + css.groups;
            }

            if (settings.mygroups) {
                cssCode += css.myGroups;
            } else {
                cssCode += css.show(css.myGroups);
            }

        } else {
            cssCode += css.show(css.groupsAndPeople + css.myGroups);
        }

        chrome.tabs.insertCSS(tabId, {code: cssCode});
        chrome.tabs.sendMessage(tabId, {
            action: "clean",
            settings: settings
        });
    }

    // Launch the main function only on certain pages of VK:
    function checkForValidUrl(tabId, changeInfo, tab) {
        var url;

        if (changeInfo.status !== "loading") {
            return;
        }

        url = tab.url;

        if (url.indexOf("vk.com/feed") === -1) {
            return chrome.pageAction.hide(tabId);
        }

        if (/photos|videos|articles|likes|notifications|comments|updates|replies/
            .test(url)) {
            chrome.pageAction.hide(tabId);

            // Show all the divs that have been hidden, stop observing:
            chrome.tabs.insertCSS(tabId, {
                code: css.show(
                    css.groupsAndPeople + css.myGroups + css.filters
                )
            });

            return chrome.tabs.sendMessage(tabId, {
                action: "disable"
            });
        }

        if (/\/feed\?[wz]=/.test(url)) {
            return;
        }

        chrome.storage.sync.get(function (loadedSettings) {
            if (Object.keys(loadedSettings).length) {
                settings = loadedSettings;
            } else {
                chrome.storage.sync.set(settings);
            }
            chrome.tabs.executeScript(
                tabId,
                {file: "content-script.js"},
                function () {
                    execute(tabId);
                }
            );
        });

        chrome.pageAction.show(tabId);

        chrome.tabs.insertCSS(tabId, {code: css.filters});
    }

    chrome.runtime.onMessage.addListener(
        function (message) {
            if (message.action === "execute") {
                settings = message.settings;
                execute(message.tabId);
            }
        }
    );

    chrome.tabs.onUpdated.addListener(checkForValidUrl);
}());

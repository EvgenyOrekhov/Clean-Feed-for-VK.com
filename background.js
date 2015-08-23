/*global chrome */

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

    function activate(sender) {
        if (/\/feed\?[wz]=/.test(sender.tab.url)) {
            return;
        }

        if (
            sender.tab.url.indexOf("vk.com/feed") === -1 ||
            (/photos|videos|articles|likes|notifications|comments|updates|replies/)
                .test(sender.tab.url)
        ) {
            chrome.pageAction.hide(sender.tab.id);

            // Show all the divs that have been hidden, stop observing:
            chrome.tabs.insertCSS(sender.tab.id, {
                code: css.show(
                    css.groupsAndPeople + css.myGroups + css.filters
                )
            });

            return chrome.tabs.sendMessage(sender.tab.id, {
                action: "disable"
            });
        }

        chrome.storage.sync.get(function (loadedSettings) {
            if (Object.keys(loadedSettings).length) {
                settings = loadedSettings;
            } else {
                chrome.storage.sync.set(settings);
            }
            execute(sender.tab.id);
        });

        chrome.pageAction.show(sender.tab.id);

        chrome.tabs.insertCSS(sender.tab.id, {code: css.filters});
    }

    chrome.runtime.onMessage.addListener(
        function (message, sender) {
            if (message.action === "execute") {
                settings = message.settings;
                execute(message.tabId);
            }
            if (message.action === "activate") {
                activate(sender);
            }
        }
    );
}());

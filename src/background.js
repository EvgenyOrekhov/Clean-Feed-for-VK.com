/*global chrome */
/*jslint browser, es6 */
/*eslint camelcase: "off", max-len: "off" */

(function main() {
    "use strict";

    const classNames = [
        "external_links",
        "links",
        "apps",
        "instagram",
        "video",
        "group_share",
        "mem_link",
        "event_share",
        "wall_post_more",
        "likes",
        "comments"
    ];
    const cffvkFiltersSelector = classNames
        .map(function buildSelector(className) {
            return `.cffvk-${className}`;
        })
        .join();
    const css = {
        groups: "[id^='feed_repost-'], [id^='feed_reposts_'] " +
                "{ display: none; }",
        myGroups: "[id^='post-'].post_copy { display: none; }",
        groupsAndPeople: "[id^='feed_repost'] { display: none; }",

        filters: `${cffvkFiltersSelector} { display: none; }`,

        show: function show(rule) {
            return rule.replace(/none/g, "block");
        }
    };
    let settings = {
        groups: true,
        links: true,
        apps: true,
        group_share: true,
        event_share: true
    };

    function disable(tabId) {
        chrome.pageAction.setIcon({
            tabId,
            path: "disabled-icon16.png"
        });

        // Show all the divs that have been hidden, stop observing:
        chrome.tabs.insertCSS(tabId, {
            code: css.show(css.groupsAndPeople + css.myGroups + css.filters)
        });

        chrome.tabs.sendMessage(tabId, {
            action: "disable"
        });
    }

    // The main function
    function execute(tabId) {
        if (settings["is-disabled"]) {
            return disable(tabId);
        }

        let cssCode = css.show(css.groupsAndPeople + css.myGroups);

        if (settings.groups) {
            const peopleCssCode = settings.people
                ? css.groupsAndPeople
                : css.show(css.groupsAndPeople) + css.groups;
            const myGroupsCssCode = settings.mygroups
                ? css.myGroups
                : css.show(css.myGroups);

            cssCode = peopleCssCode + myGroupsCssCode;
        }

        chrome.pageAction.setIcon({
            tabId,
            path: "icon16.png"
        });
        chrome.tabs.insertCSS(tabId, {code: cssCode + css.filters});
        chrome.tabs.sendMessage(tabId, {
            action: "clean",
            settings
        });
    }

    function activate(sender) {
        if (/\/feed\?[wz]=/.test(sender.tab.url)) {
            return;
        }

        if (
            !sender.tab.url.includes("vk.com/feed") ||
            (/photos|videos|articles|likes|notifications|comments|updates|replies/)
                .test(sender.tab.url)
        ) {
            chrome.pageAction.hide(sender.tab.id);

            return disable(sender.tab.id);
        }

        chrome.storage.sync.get(function applySettings(loadedSettings) {
            if (Object.keys(loadedSettings).length) {
                settings = loadedSettings;
            } else {
                chrome.storage.sync.set(settings);
            }

            execute(sender.tab.id);
        });

        chrome.pageAction.show(sender.tab.id);
    }

    chrome.runtime.onMessage.addListener(
        function handleMessage(message, sender) {
            if (message.action === "execute") {
                settings = message.settings;

                return execute(message.tabId);
            }

            if (message.action === "activate") {
                activate(sender);
            }
        }
    );
}());

/*global chrome */
/*jslint browser: true, devel: true */

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

    function setUpTheSettingsPage() {
        var checkboxes;

        function hideOrShowSomeCheckboxes() {
            var labels2and3 = [
                    document.getElementById("mygroups-label"),
                    document.getElementById("people-label")
                ],
                linksLabel = document.getElementById("links-label"),
                linksCheckbox = linksLabel.children[0];

            // If the first checkbox (`groups`) is unchecked
            // then uncheck the second and the third, hide them,
            // and reset their settings in storage:
            labels2and3.forEach(function (label) {
                var checkbox = label.children[0];

                if (settings.groups) {
                    label.style.display = "block";

                    return;
                }

                label.style.display = "none";
                checkbox.checked = false;
                settings[checkbox.name] = false;
            });

            // If the `external_links` checkbox is checked
            // then uncheck the `links` checkbox, hide it,
            // and reset its setting in storage:
            if (settings.external_links) {
                linksLabel.style.display = "none";
                linksCheckbox.checked = false;
                settings[linksCheckbox.name] = false;
            } else {
                linksLabel.style.display = "block";
            }

            chrome.storage.sync.set(settings);
        }

        // Catch clicks on checkboxes and update settings,
        // reapply the main function:
        function handleClick(event) {
            settings[event.target.name] = event.target.checked;
            hideOrShowSomeCheckboxes();
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                function (tabs) {
                    execute(tabs[0].id);
                }
            );
        }

        checkboxes = Array.prototype.slice.call(
            document.settingsForm.getElementsByTagName("input")
        );

        hideOrShowSomeCheckboxes();

        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener("click", handleClick);
            checkbox.checked = !!settings[checkbox.name];
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

        if (!(/\/feed\?[wz]=/).test(url)) {

            // We have to get the settings on every page load
            // because `handleClick` works in a different context
            // (popup) and it doesn't update our `settings` variable
            chrome.storage.sync.get(function (loadedSettings) {
                if (Object.keys(loadedSettings).length) {
                    settings = loadedSettings;
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
    }

    // Load settings:
    chrome.storage.sync.get(function (loadedSettings) {
        if (Object.keys(loadedSettings).length) {
            settings = loadedSettings;
        }
        if (document.settingsForm) {
            setUpTheSettingsPage();
        }
    });

    chrome.tabs.onUpdated.addListener(checkForValidUrl);
}());

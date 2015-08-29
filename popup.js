/*global chrome, NodeList */
/*jslint browser: true */

(function () {
    "use strict";

    function setUpTheSettingsPage(settings) {
        var checkboxes = document.querySelectorAll("input");

        function hideOrShowSomeCheckboxes() {
            var labels2and3 = [
                    document.querySelector("#mygroups-label"),
                    document.querySelector("#people-label")
                ],
                linksLabel = document.querySelector("#links-label"),
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

                return;
            }

            linksLabel.style.display = "block";
        }

        // Catch clicks on checkboxes and update settings,
        // reapply the main function:
        function handleClick(event) {
            settings[event.target.name] = event.target.checked;
            hideOrShowSomeCheckboxes();
            chrome.storage.sync.set(settings);
            chrome.tabs.query(
                {
                    currentWindow: true,
                    active: true
                },
                function (tabs) {
                    chrome.runtime.sendMessage({
                        tabId: tabs[0].id,
                        action: "execute",
                        settings: settings
                    });
                }
            );
        }

        hideOrShowSomeCheckboxes();

        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener("click", handleClick);
            checkbox.checked = !!settings[checkbox.name];
        });
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach ||
            Array.prototype.forEach;

    // Load settings:
    chrome.storage.sync.get(function (loadedSettings) {
        setUpTheSettingsPage(loadedSettings);
    });
}());

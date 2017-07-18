/*global chrome, NodeList */
/*jslint browser, es6, maxlen: 80 */

(function main() {
    "use strict";

    function setUpTheSettingsPage(settings) {
        const checkboxes = document.querySelectorAll("input");

        function hideLabel(label) {
            const checkbox = label.children[0];

            label.style.display = "none";
            checkbox.checked = false;
            settings[checkbox.name] = false;
        }

        function hideOrShowSomeCheckboxes() {
            const labels2and3 = [
                document.querySelector("#mygroups-label"),
                document.querySelector("#people-label")
            ];
            const linksLabel = document.querySelector("#links-label");

            checkboxes.forEach(function setDisabledState(checkbox) {
                if (checkbox.name !== "is-disabled") {
                    checkbox.disabled = Boolean(settings["is-disabled"]);
                }
            });

            // If the first checkbox (`groups`) is unchecked
            // then uncheck the second and the third, hide them,
            // and reset their settings in storage:
            labels2and3.forEach(function setLabels2and3(label) {
                if (settings.groups) {
                    label.style.display = "block";

                    return;
                }

                hideLabel(label);
            });

            // If the `external_links` checkbox is checked
            // then uncheck the `links` checkbox, hide it,
            // and reset its setting in storage:
            if (settings.external_links) {
                return hideLabel(linksLabel);
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
                function sendMessage(tabs) {
                    chrome.runtime.sendMessage({
                        tabId: tabs[0].id,
                        action: "execute",
                        settings
                    });
                }
            );
        }

        hideOrShowSomeCheckboxes();

        checkboxes.forEach(function setUpCheckbox(checkbox) {
            checkbox.addEventListener("click", handleClick);
            checkbox.checked = Boolean(settings[checkbox.name]);
        });
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach
            || Array.prototype.forEach;

    // Load settings:
    chrome.storage.sync.get(setUpTheSettingsPage);
}());

// Listen for requests from the content script.
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action) {
            if (request.action === "patterns") {
                getPatterns(sender.tab.id);
            } else if (request.action === "event") {
                sendEvent(request)
            }
        }
    }
);

// Lookup the available page identification patterns
// and return them to the content script.
function getPatterns(tab) {
    chrome.storage.sync.get('sidekick_server', function (item) {
        var endpoint = 'https://' + (item.sidekick_server || 'sizingtool.us') + '/patterns';

        fetch(endpoint, {
              "method" : 'GET',
              "headers" : {
                accept: 'application/json',
              }})
            .then((response) => {
                // This is exploded into a full function definition for debugging.
                return response.json();
            })
            .then((data) => {
                chrome.tabs.sendMessage(tab, {
                    "sender": "sidekick",
                    "message": "patterns",
                    "patterns": data
                });
            })
            .catch(err => {
                console.log(err)
            });
    });
}

function sendEvent(eventData, options) {
    chrome.storage.sync.get(['sidekick_server', 'sidekick_workmate'], function (items) {
        eventData.workmate = items.sidekick_workmate || 'first.last';;

        var endpoint = 'https://' + (items.sidekick_server || 'sizingtool.us') + '/event';

        fetch(endpoint, {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(eventData)
        }).catch(function (error) {
            console.log('Request failed', error);
        });
    });
}

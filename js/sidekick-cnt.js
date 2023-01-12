// Create a global to hold the returned patterns
var observer_patterns = undefined;

// Start listening for messages from the background service
// worker.  Any interaction with the remote repository is
// handled, in an async manner, through the messages.

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // listen for messages sent from background.js with our name...
        if (request.sender && request.sender === 'sidekick') {
            if (request.message && request.message === 'patterns') {
                // A patterns message is the reply from the get patterns
                // request sent when this content was first injected.

                observer_patterns = request.patterns;
            }
        }
    });

// Ask for the patterns we use to identify pages and elements on
// pages.  These patterns drive the messages generated as events.  We
// begin looking for matching patterns when the search patterns 
// global variable is set by our listener.

chrome.runtime.sendMessage({ "action": "patterns" });

// Utility function to wait for an element we want to observe
// that has not yet been rendered in the page.  The trick here
// is to observe the entire document until our target element
// exists - then stop observing.  Example: waiting for the
// username info in the upper right, e.g., logan mcneil, to
// be built into the current page.

function waitForElm(selector) {
    return new Promise(resolve => {
        // First check if the element is already here, i.e., no
        // reason to wait, just return the value.
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        // Establish an observer looking in each change
        // to the DOM for out selector.
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        // Start looking...
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

debugger;

// Utility function to locate a value from the page
// to insert into an event message.  Messages generated
// into the events use this to substitute #tags with
// actual values.

function gettokenValue(pattern, match) {
    // Did we actually get a pattern?
    // NOTE: separate checks to help developer identify problems.
    if (!pattern) {
        return "Invalid pattern in gettokenValue";
    }

    // Is there a format defined in the pattern?
    if (!pattern.contents) {
        return "Missing contents in gettokenValue";
    }

    // Do we have a format specification to build our return string?
    if (!pattern.contents.format) {
        return "Missing format specifier";
    }

    // Simplify the pattern lookup with easy to use variables.
    var format = pattern.contents.format;
    var tokens = pattern.contents.tokens; // List of token objects

    // If there are no subsitition tokens in the format, simply
    // return the format defintion string.
    // NOTE: There may be stray tags (#tag) in the string,
    // but we have no substitutions, so no reason to look.

    if (!tokens || typeof tokens !== "object") {
        return format;
    }

    // At this point, we have a format and some tokens,
    // start putting values into the tags.

    // Pull out the #tag (hashtag) strings from the format.
    var tagRE = /#(\w+)\b/gi;
    var tags = format.matchAll(tagRE);

    // Lookup the values for each tag.  If there are no
    // tags, this loop exits immediately.
    for(const tag of tags) {
        let token = tokens[tag[1]];
        let item;

        // Tokens can indicate if the entire DOM should be
        // searched or the value can be found local (subtree)
        // to the selector matched in the page.
        if (token.type === "document") {
            // The target value is NOT a child of the matched
            // element, search the entire page.
            item = document.querySelector(token.content)
        } else if (token.type === "local") {
            if (token.content) {
                // The target value is a child of the matched
                // element, search only from this token's
                // child elements.

                item = match.querySelector(token.content);
            } else {
                // Neither
                item = match;
            }
        }

        // We have the item in the page containing the value
        // to insert into the format string.  We now apply
        // the specified function to pull the actual value out
        // of the selected element.

        let tokenValue = "Missing eval function";

        if (token.eval === "value") {
            tokenValue = item.value;
        } else if (token.eval === "innerHTML") {
            tokenValue = item.innerHTML;
        }

        // Update the format string
        format = format.replaceAll(tag[0], tokenValue);
    };

    return format;
}

// Build and pass an event to the background service worker.

function generateEvent(pattern_name, pattern, tokenValue) {
    var data = {
        "pattern" : pattern_name,
        "action": "event",
        "user": null,
        "url": window.location.href,
        "page": tokenValue,
        "payload": { "stuff": "stuff value" }
    }

    if (pattern.anonymous) {
        // Some events will NOT have a logged-in user.
        chrome.runtime.sendMessage(data);
    } else {
        // We should always be able to get the currently logged-in user, as shown in the
        // upper right of the current page.  We may need to wait until the page finishes
        // loading, so we create a quick/temporary observer to wait.

        let userTag = 'button[data-automation-id="Current_User"] img';

        waitForElm(userTag).then((user) => {
            // The user name is in the "alt" attribute of the image tag.
            data.user = user.alt;

            // Send the message to the service worker.
            chrome.runtime.sendMessage(data);
        });
    }
}

// Handle all DOM changes looking for patterns we are observing.
const observer = new MutationObserver(mutations => {
    mutations.forEach((mutation) => {
        // It is possible that page mutations happen BEFORE we
        // get the patterns back from the server.  If we don't
        // have our patterns, simply skip this set of mutations.
        // NOTE: this may cause missed page events.

        if (observer_patterns !== undefined) {
            if (mutation.type === "childList") {
                // We are only looking for changes to the DOM - changes
                // to attributes are ignored.
                // NOTE: we shouldn't see this anyway because the observer
                //       looks only for subtree changes.

                for (let observer_pattern in observer_patterns) {
                    // Loop over the patterns retrieved from the server and
                    // see if any of the mutations match.

                    let pattern = observer_patterns[observer_pattern];

                    // Is the pattern present?
                    let match = mutation.target.querySelector(pattern.selector);

                    if (match) {
                        // Generate the message we need to send with the event.
                        let token = gettokenValue(pattern, match);

                        // Since a mutation may include our pattern multiple times,
                        // i.e., multiple mutations that include us, only send an
                        // event if the event message value changes.

                        if (pattern.lastValue !== token) {
                            pattern.lastValue = token;

                            // Fire-off the event to the background service worker.
                            generateEvent(observer_pattern, pattern, token);
                        }
                    }

                }
            }
        }
    });
});

// Start watching for mutations.  NOTE: we are watching the
// entire DOM for changes.

observer.observe(document, {
    childList: true,
    subtree: true
});
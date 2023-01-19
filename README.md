# <img src="img/sidekick-dub-128x128.png" width="30"/>  &nbsp;Sidekick Chrome Extension
This Chrome extension monitors specific Workday domains to  detect page elements indicating where a user has navigated.  For each identified pattern, an event is generated and passed to a backend database.

This extension is using the [Google Chrome Extension Manifest v3](https://developer.chrome.com/docs/extensions/mv3/intro/) to define the extension.  For this extension, the most important sections in the `manifest.json` file are `host_permissions` and `content_scripts`.  These two sections define when the extension activates to identify demo events.  The following domains (defined in `content_scripts` section) cause the extension to hunt for page elements:

```
"*://*.wd99.myworkday.net/*",
"*://app.staging-peakon.com/*",
"*://*.salessuvworkday.com/*"
```

## Installation Only video
The Sidekick extension is available in the Google Chrome Store. The following YouTube video demonstrates the installation process:

https://youtu.be/Pul0kAHVG0w

<hr>
## Overview video

TBD...This video is an overview of the entire extension from end-user experience to notes on how the extension was created.



## Lifecycle of the extension

**Note:** The extension and server processes use a highly-async approach to limit performance impacts to the Workday page rendering.

1. User [installs the extension](https://chrome.google.com/webstore/detail/sidekick/pppgplnjkkjpoajcaidcpmgfeeecckcb).
2. Hopefully, the user configures the extension with their workmate (first.last) name.
3. User navigates to a monitored domain (`content_scripts` entry) and Chrome injects the extension content script (`sidekick-cnt`) into the page.
4. The extension asks the server for the latest [`patterns.json`](https://sidekick.workday.tools/patterns).
5. The extension creates a [mutation observer](https://www.w3docs.com/learn-javascript/mutation-observer.html) to monitor the page contents.
6. When a pattern is matched, the extension extracts information from the page to build a message to include in the server payload.
7. The extension send an async message to the service worker (`sidekick-svw.js`) to send the event to the server.
<hr>

## Important links

The Chrome extension is available by searching in the Chrome Store or by navigating to the direct link.

[Chrome extension Link](https://chrome.google.com/webstore/detail/sidekick/pppgplnjkkjpoajcaidcpmgfeeecckcb)

The most current recorded events are available for review on the server.

[Event review page](https://sidekick.workday.tools)

The source code for the server components can be reviewed.  

[Server Github Location](https://github.com/wd-mgreynolds/sidekick-server)

<hr>

This extension is Chrome manifest V3 compliant.
<hr>
## Build notes

When publishing a new version of the exentsion we only want to include necessary files.  The "-x" flag filters out unnecessary files.

```
zip -r sidekick.zip-{date}-v{version}.zip \
./sidekick \
-x '*.git*' -x '*.DS_Store' -x '*.psd'
```

Example:

```
zip -r sidekick.zip-2023-01-13-v1.01.zip \
./sidekick \
-x '*.git*' -x '*.DS_Store' -x '*.psd'
```
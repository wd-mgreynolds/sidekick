# Sidekick Chrome Extension
This Chrome extension monitors specific Workday domains to  detect page elements indicating where a user has navigated.  For each identified pattern, an event is generated and passed to a backend database.
<br>
<hr>

## Important links

The Chrome extension is private so the URL is required for users to install into Chrome.

[Chrome extension Link](https://chrome.google.com/webstore/detail/sidekick/pppgplnjkkjpoajcaidcpmgfeeecckcb)

The most current events are available for review.

[Event review page](https://sidekick.workday.tools)

The source code for the extension (this page) contains the important components

[Extension Github Location](https://github.com/wd-mgreynolds/sidekick)

The source code for the server components can be reviewed.  

[Server Github Location](https://github.com/wd-mgreynolds/sidekick-server)

<hr>

## Overview video

This video is an overview of the entire extension from end-user experience to notes on how the extension was created.

## Installation Only video
<hr>
This extension is Chrome manifest V3 compliant.
<hr>
Notes:

zip -r sidekick.zip-{date}-v{version}.zip \\\
./sidekick \\\
-x '*.git*' -x '*.DS_Store' -x '*.psd'

Example:

zip -r sidekick.zip-2023-01-13-v1.01.zip \\\
./sidekick \\\
-x '*.git*' -x '*.DS_Store' -x '*.psd'
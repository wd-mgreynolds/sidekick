# Sidekick
This Chrome extension monitors specific Workday domains to  detect page elements indicating where a user has navigated.  For each identified pattern, an event is generated and passed to a backend database.
<br>
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
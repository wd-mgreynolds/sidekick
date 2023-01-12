// Saves options to chrome.storage

function save_options() {
    var endpoint = document.getElementById('sidekick_server').value;
    var workmate = document.getElementById('sidekick_workmate').value;
    var demoMode = document.getElementById('sidekick_mode').checked;

    chrome.storage.sync.set({
        sidekick_workmate : workmate,
        sidekick_server: endpoint,
        sidekick_mode: demoMode
    }, function() {
        var status = document.getElementById('sidekick_status');

        status.innerHTML = '<br/>Options Saved.';

        setTimeout(function() {
            status.innerHTML = '';
            window.close();
        }, 1200);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.

function restore_options() {
    chrome.storage.sync.get('sidekick_workmate', function(item) {
        document.getElementById('sidekick_workmate').value = item.sidekick_workmate || 'first.last';
    });

    chrome.storage.sync.get('sidekick_server', function(item) {
        document.getElementById('sidekick_server').value = item.sidekick_server || 'sizingtool.us';
    });

    chrome.storage.sync.get('sidekick_mode', function(mode) {
        document.getElementById('sidekick_mode').checked = mode.sidekick_mode;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('sidekick_save').addEventListener('click', save_options);

function get_callback(items) {
    chrome.storage.local.clear();
}

function clear_cache() {
    chrome.storage.local.get(null, get_callback);

    setTimeout(function() {
        chrome.storage.local.clear();
        chrome.storage.local.get(null, get_callback);
    }, 500);
}

document.getElementById('clear_cache').addEventListener('click', clear_cache);

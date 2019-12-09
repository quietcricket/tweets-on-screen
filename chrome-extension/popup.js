var settingKeys = ['project', 'api-key'];
document.querySelector('#save-btn').addEventListener('click', function (evt) {
    var data = {};
    for (var key of settingKeys) {
        var v = document.getElementById(key).value.trim();
        if (v.length == 0) {
            alert('Please enter Project ID and API Key');
            return
        }
        data[key] = v;
    }
    chrome.storage.local.set(data, function () {
        chrome.runtime.sendMessage({
            mode: 'settings-changed'
        }, function (resp) {
            if (resp == 'ok') {
                alert('Project setup successfully.');
                window.close();
            } else {
                alert(resp);
            }
        });
    });
});

chrome.storage.local.get(settingKeys, function (resp) {
    for (var key of settingKeys) {
        var v = resp[key];
        if (v) {
            document.getElementById(key).value = v;
        }
    }
});
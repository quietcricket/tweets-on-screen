for (const ele of document.querySelectorAll('input[type=text]')) {
    chrome.storage.sync.get(ele.getAttribute('name'), function (data) {
        for (const k in data) {
            console.log(k);
            ele.value = data[k];
        }
    });
}

document.querySelector('#save_btn').addEventListener('click', function (event) {
    var data = {};
    for (const ele of document.querySelectorAll('input[type=text]')) {
        data[ele.getAttribute('name')] = ele.value;
    }
    chrome.storage.sync.set(data, function () {
        document.querySelector('.feedback').innerHTML = 'Settings saved successfully';
    });

});

document.querySelector('#close_btn').addEventListener('click', function (event) {
    window.close();
});
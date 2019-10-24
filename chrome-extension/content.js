let SERVER_URL;
const LOCAL_URL = 'http://localhost:8080/extension-api/';
const DEV_URL = 'https://dooh.lonk/extension-api';
const LIVE_URL = 'https://dooh.lonk/extension-api';
fetch(LOCAL_URL + 'ping', {
    mode: 'cors'
}).then(_ => SERVER_URL = LOCAL_URL).catch(_ => SERVER_URL = DEV_URL);

console.log(SERVER_URL);

var tweets = {};

function addButtons() {
    for (var ele of document.querySelectorAll('[dooh]')) {
        if (ele.hasAttribute('dooh-btn')) continue;
        var btn = document.createElement('button');
        btn.classList.add('dooh-btn');
        btn.innerHTML = 'shortlist this';
        ele.firstChild.firstChild.append(btn);
        ele.setAttribute('dooh-btn', 1);
        btn.setAttribute('tweet-id', ele.getAttribute('dooh'));
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            e.currentTarget.innerHTML = 'pending';
            addTweet(e.currentTarget.getAttribute('tweet-id'));
        });
    }
    setTimeout(addButtons, 500);
}

function addTweet(tid) {
    fetch(SERVER_URL + 'add', {
        mode: 'cors',
        method: 'POST',
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify({
            'tid': tid,
            'key': 'f7b4a9bae07f47b9a0a70b7469e69ec7',
            'secret': '5e147075c9384fbb942e27a7e91255e8'
        })
    }).then(resp => console.log(resp));
}

function getStatus() {
    $.ajax({
        url: SERVER_URL + 'status',
        dataType: 'json',
        method: 'POST',
        mode: 'cors',
        data: {
            data: JSON.stringify(Object.keys(tweets))
        }
    }).then(function (data) {
        for (var h in data) {
            $(`[hash="${h}"`).html(data[h]);
        }
    });
}

/**
 * Inject CSS and JS into the page
 * content.js is sandboxed and cannot access certain information from the page
 * injection is much better
 */
// document.head.appendChild($(`<link rel="stylesheet" href="${chrome.runtime.getURL('injection.css')}">`)[0]);
var ele = document.createElement('link');
ele.rel = "stylesheet";
ele.href = chrome.extension.getURL('injection.css');
document.head.append(ele);

ele = document.createElement('script');
ele.src = chrome.extension.getURL('injection.js')
document.body.append(ele);


addButtons();
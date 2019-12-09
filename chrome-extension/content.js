var tweetDetails = {};
var moderationStatus = {};
/**
 * Inject CSS and JS into the page
 * content.js is sandboxed and cannot access certain information from the page
 * injection is much better
 */
var ele = document.createElement('link');
ele.rel = "stylesheet";
ele.href = chrome.extension.getURL('injection.css');
document.head.append(ele);

ele = document.createElement('script');
ele.src = chrome.extension.getURL('injection.js')
document.body.append(ele);
/**
 * Add a "shortlist this" button to all tweets
 */

function addButtons() {
    for (var ele of document.querySelectorAll('[dooh]')) {
        if (ele.hasAttribute('dooh-btn')) continue;
        var btn = document.createElement('button');
        var tid = ele.getAttribute('dooh');

        var status = moderationStatus[tid];
        if (status) {
            btn.className = 'dooh-btn ' + status;
        } else {
            btn.className = 'dooh-btn normal';
        }

        ele.firstChild.firstChild.append(btn);
        ele.setAttribute('dooh-btn', 1);
        btn.setAttribute('tweet-id', tid);
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!e.currentTarget.classList.contains('normal')) return;
            addTweet(e.currentTarget.getAttribute('tweet-id'));
        });
    }
    setTimeout(addButtons, 500);
}


function addTweet(tid) {
    var jsonDiv = document.querySelector('#json-data');
    if (jsonDiv.hasAttribute('dirty')) {
        jsonDiv.removeAttribute('dirty');
        tweetDetails = JSON.parse(decodeURIComponent(jsonDiv.innerHTML));
    }
    var t = tweetDetails.tweets[tid];
    /**
     * Place's bounding box is saved in some kind of array FireStore doesn't support
     * Delete place info for now. Not needed.
     */
    if (t.hasOwnProperty('place')) delete t.place;
    var u = tweetDetails.users[t.user_id_str];
    chrome.runtime.sendMessage({
        mode: 'add',
        tweet: t,
        user: u
    }, function (resp) {
        if (resp != 'ok') {
            alert('An error occurred for tweet: ' + resp);
        }
    });
}

chrome.runtime.onMessage.addListener(function (msg, _, callback) {
    console.log("Content JS Message: ", msg);
    switch (msg.mode) {
        case 'status':
            moderationStatus = msg.data;
            updateButtonStatus();
            break;
    }
});

function updateButtonStatus() {
    for (var ele of document.querySelectorAll('.dooh-btn')) {
        var status = moderationStatus[ele.getAttribute('tweet-id')];
        if (status) {
            ele.className = 'dooh-btn ' + status;
        } else {
            ele.className = 'dooh-btn normal';
        }
    }
}
chrome.runtime.sendMessage({
    mode: 'ready'
});
addButtons();
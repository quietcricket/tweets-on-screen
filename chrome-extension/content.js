var ajaxData = {};
var moderationStatus = {};
/**
 * Inject CSS and JS into the page
 * content.js is sandboxed and cannot access certain information from the page
 * injection is much better
 */
// var ele = document.createElement('link');
// ele.rel = "stylesheet";
// ele.href = chrome.extension.getURL('injection.css');
// document.head.append(ele);

var ele = document.createElement('script');
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
            e.currentTarget.className = "dooh-btn pending";
            addTweet(e.currentTarget.getAttribute('tweet-id'));
        });
    }

    var dataDiv = document.querySelector('#ajax-data');
    if (dataDiv && dataDiv.hasAttribute('dirty')) {
        dataDiv.removeAttribute('dirty');
        ajaxData = JSON.parse(decodeURIComponent(dataDiv.innerHTML));
        if (ajaxData.emoji_timestamp.length > 0) {
            chrome.runtime.sendMessage({
                mode: 'emoji',
                timestamp: ajaxData.emoji_timestamp,
                emojis: ajaxData.emojis
            });
        }
    }
    setTimeout(addButtons, 500);
}


function addTweet(tid) {
    const tweetFields = ['id_str', 'full_text', 'display_text_range', 'created_at', 'entities', 'extended_entities', 'user_id_str'];
    const userFields = ['verified', 'name', 'screen_name', 'profile_image_url_https'];
    var t = ajaxData.tweets[tid];
    var isRetweet = false;
    if (t.retweeted_status_id_str) {
        t = ajaxData.tweets[t.retweeted_status_id_str];
        isRetweet = true;
    }
    /**
     * Trim off unwanted data
     */
    let u = ajaxData.users[t.user_id_str];

    let data = {};
    tweetFields.map(f => data[f] = t[f]);
    userFields.map(f => data[f] = u[f]);
    data.status = 'pending';

    chrome.runtime.sendMessage({
        mode: 'add',
        data: data
    }, function (resp) {
        if (resp != 'ok') {
            alert('An error occurred for tweet: ' + resp);
        }
        if (isRetweet) {
            alert("This is a retweet. Original tweet shortlisted.")
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
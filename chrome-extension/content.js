var ajaxData = {};
var moderationStatus = {};
/**
 * Inject CSS and JS into the page
 * content.js is sandboxed and cannot access certain information from the page
 * injection is much better
 */

let ele = document.createElement('script');
ele.src = chrome.extension.getURL('injection.js')
document.body.append(ele);
/**
 * Add a "shortlist this" button to all tweets
 */
function addButtons() {
    for (let ele of document.querySelectorAll('article')) {
        // Add a marker to skip those already processed
        if (ele.hasAttribute('tos-processed')) continue;
        ele.setAttribute('tos-processed', 1);
        // There is an <a> link for the time element
        // Seems to be the most reliable way to find the tweet-id
        let timeEle = ele.querySelector('time');
        if (!timeEle) continue;
        // Using regular expression to strip off none digital characters
        // So far never seen any none digital chars, but just to be safe
        let tid = timeEle.parentNode.getAttribute('href').split('/').pop().replace(/\D+/g, '');

        // Creates the button
        var btn = document.createElement('button');
        var status = moderationStatus[tid];
        // Attach css class for different stage
        btn.className = 'tos-btn ' + (status ? status : 'normal')
        ele.append(btn);
        btn.setAttribute('tweet-id', tid);
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!e.currentTarget.classList.contains('normal')) return;
            e.currentTarget.className = "tos-btn pending";
            addTweet(e.currentTarget.getAttribute('tweet-id'));
        });
    }

    // Try to get the latest tweets data from the injection code
    var dataDiv = document.querySelector('#ajax-data');
    if (dataDiv && dataDiv.hasAttribute('dirty')) {
        dataDiv.removeAttribute('dirty');
        ajaxData = JSON.parse(decodeURIComponent(dataDiv.innerHTML));

        if (ajaxData.emoji_timestamp.length > 0) {
            chrome.runtime.sendMessage({
                command: 'emoji',
                timestamp: ajaxData.emoji_timestamp,
                emojis: ajaxData.emojis
            });
        }
    }
    setTimeout(addButtons, 200);
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
        command: 'add',
        data: data
    }, function(resp) {
        if (resp != 'ok') {
            alert(`An error occurred for tweet: ${resp}.\n Please try to logout and login the extension again.`);
        }
        if (isRetweet) {
            alert("This is a retweet. Original tweet shortlisted.")
        }
    });
}

chrome.runtime.onMessage.addListener(function(msg, _, callback) {
    switch (msg.command) {
        case 'status':
            moderationStatus = msg.data;
            updateButtonStatus();
            break;
    }
});

function updateButtonStatus() {
    for (var ele of document.querySelectorAll('.tos-btn')) {
        var status = moderationStatus[ele.getAttribute('tweet-id')];
        if (status) {
            ele.className = 'tos-btn ' + status;
        } else {
            ele.className = 'tos-btn normal';
        }
    }
}

chrome.runtime.sendMessage({
    command: 'init'
}, resp => {
    addButtons();
});
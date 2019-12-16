var db;
var app;

function initFirebase(callback, testKey = false) {
    if (app) {
        app.delete();
    }

    function initDb(callback) {
        db.enablePersistence({
            synchronizeTabs: true
        });
        db.collection('moderation').onSnapshot(snapshot => {
            sendStatus(snapshot);
            callback('ok');
        });
    }
    chrome.storage.local.get(['project', 'api-key'], function (data) {
        app = firebase.initializeApp({
            apiKey: data['api-key'],
            projectId: data.project
        });
        db = firebase.firestore(app)
        if (testKey) {
            db.collection('moderation').get().then(_ => initDb(callback)).catch(error => {
                callback('Invalid Project ID or API Key');
            });
        } else {
            initDb(callback);
        }

    });
}

chrome.runtime.onMessage.addListener(function (msg, _, callback) {
    switch (msg.mode) {
        case 'add':
            addTweet(msg.tweet, msg.user, callback);
            break;
        case 'ready':
            initFirebase(callback);
            break;
        case 'settings-changed':
            initFirebase(callback, false);
            break;
        case 'emoji':
            saveEmojis(msg.timestamp, msg.emojis);
            break;

    }
    return true;
});

function addTweet(tweet, user, callback) {
    if (!db) {
        alert('Please set the Project Id and API Key first');
        return;
    }
    try {
        db.collection('tweet').doc(tweet.id_str).set(tweet);
        db.collection('user').doc(user.id_str).set(user);
        let m = db.collection('moderation').doc(tweet.id_str);
        m.get().then(doc => {
            if (!doc.exists) m.set({
                status: 'pending'
            });
            callback('ok');
        });
        callback('ok');
    } catch (e) {
        callback(tweet.id_str);
    }
}

function saveEmojis(timestamp, emojis) {
    /**
     * Data too large, not using it at the moment
     */
    // return;
    let e = db.collection('emojis').doc(timestamp).set({});
    return;
    e.get().then(doc => {
        let records = {};
        for (let r of emojis) {
            if (r.hashtag.length == 0) continue;
            records[r.hashtag] = r.assetUrl;
        }
        if (!doc.exists) e.set(records);
    });
}


function sendStatus(snapshot) {
    console.log("Snapshot Changed: ", snapshot.docs.length);
    var msg = {
        mode: 'status',
        data: {}
    };
    for (var doc of snapshot.docs) {
        msg.data[doc.id.toString()] = doc.data().status;
    }
    chrome.tabs.query({
        url: 'https://twitter.com/*'
    }, function (tabs) {
        for (t of tabs) {
            chrome.tabs.sendMessage(t.id, msg);
        }
    });
}
let db = firebase.firestore();
db.enablePersistence({
    synchronizeTabs: true
});

var filter = 'pending';
let tweets;
let users;
let moderations;
let masonry = new Masonry('.container-fluid', {
    gutter: 20
});

db.collection('tweet').onSnapshot(tweetsChanged);
db.collection('user').onSnapshot(usersChanged);
db.collection('moderation').onSnapshot(moderationChanged);

function tweetsChanged(snap) {
    tweets = {};
    snap.docs.map(doc => tweets[doc.id] = doc.data());
    updateLayout();
}

function usersChanged(snap) {
    users = {};
    snap.docs.map(doc => users[doc.id] = doc.data());
    updateLayout();
}

function moderationChanged(snap) {
    moderations = {};
    snap.docs.map(doc => moderations[doc.id] = doc.data().status);
    updateLayout()
}

function genButtons(ele) {
    let holder = document.createElement('div');
    let btns = {
        'approved': '<button class="btn btn-success mod-btn" onclick="approve(event)">Approve</button>',
        'rejected': '<button class="btn btn-danger mod-btn" onclick="reject(event)">Reject</button>',
        'pending': '<button class="btn btn-danger mod-btn" onclick="pending(event)">Move to pending</button>'
    }
    var html = '';
    for (let k in btns) {
        if (k != filter) html += btns[k];
    }
    holder.innerHTML = html;
    holder.className = 'mod-btns-holder';
    ele.append(holder);
}

function updateLayout() {
    if (!(tweets && users && moderations)) {
        return;
    }
    let container = document.querySelector('.container-fluid');
    for (let tid in moderations) {
        let status = moderations[tid];
        if (status != filter) continue;
        var ele = document.createElement('div');
        var t = tweets[tid];
        var u = users[t.user_id_str];
        ele.setAttribute('tid', t.id_str);
        ele.className = 'tweet-card';
        ele.innerHTML = renderTweet(t, u);
        container.append(ele);
        genButtons(ele);
        ele.addEventListener('click', function (evt) {
            let t = tweets[evt.currentTarget.getAttribute('tid')];
            console.log(t);
            console.log(users[t.user_id_str]);
        });
        twemoji.parse(ele);
        masonry.appended(ele);
    }
}

function approve(evt) {
    let tid = evt.currentTarget.parentNode.parentNode.getAttribute('tid');
    db.collection('moderation').doc(tid).set({
        status: 'approved'
    });
}

function reject(evt) {
    let tid = evt.currentTarget.parentNode.parentNode.getAttribute('tid');
    db.collection('moderation').doc(tid).set({
        status: 'rejected'
    });

}

function pending(evt) {
    let tid = evt.currentTarget.parentNode.parentNode.getAttribute('tid');
    db.collection('moderation').doc(tid).set({
        status: 'pending'
    });
}

setInterval(() => masonry.layout(), 1000);
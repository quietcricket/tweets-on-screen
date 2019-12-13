let db = firebase.firestore();
db.enablePersistence({
    synchronizeTabs: true
});

var filter = 'pending';
let tweets;
let users;
let moderations;
let masonry = new Masonry('.container-fluid', {
    gutter: 10
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
        ele.innerHTML = makeCard(t, u);
        container.append(ele);
        masonry.appended(ele);
    }
    masonry.layout();
    new imagesLoaded(container, ()=>masonry.layout());
}
let db = firebase.firestore();
db.enablePersistence({
    synchronizeTabs: true
});

var filter = getParam('filter', 'pending');
let tweets;
let users;
let moderations;
var masonry;
var initialized = false;
var totalHeight = 0;
var currentIds = [];

var masonry;

db.collection('tweet').onSnapshot(tweetsChanged);
db.collection('user').onSnapshot(usersChanged);
db.collection('moderation').onSnapshot(moderationChanged);

function initMasonry() {
    if (masonry) masonry.destroy();
    masonry = new Masonry('.container-fluid', {
        gutter: 20,
        stagger: 30
    });
}

function tweetsChanged(snap) {
    tweets = {};
    snap.docs.map(doc => tweets[doc.id] = doc.data());
    if (!initialized) {
        updateLayout();
    }
}

function usersChanged(snap) {
    users = {};
    snap.docs.map(doc => users[doc.id] = doc.data());
    if (!initialized) {
        updateLayout();
    }
}

function moderationChanged(snap) {
    moderations = {};
    snap.docs.map(doc => moderations[doc.id] = doc.data().status);
    updateLayout()
}

function genButtons(ele) {
    let holder = document.createElement('div');
    let btns = {
        'approved': '<button class="btn btn-success mod-btn" onclick="updateStatus(event,\'approved\')">Approve</button>',
        'rejected': '<button class="btn btn-danger mod-btn" onclick="updateStatus(event,\'rejected\')">Reject</button>',
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
    initialized = true;
    let container = document.querySelector('.container-fluid');
    let sortedIds = Object.keys(moderations).filter(tid => moderations[tid] == filter).sort().reverse();
    let newIds = sortedIds.filter(_id => !currentIds.includes(_id));
    currentIds = sortedIds;

    for (let tid of newIds) {
        let ele = document.createElement('div');
        let t = tweets[tid];
        let u = users[t.user_id_str];
        ele.setAttribute('tid', t.id_str);
        ele.className = 'tweet-card';
        ele.innerHTML = renderTweet(t, u);

        container.prepend(ele);
        genButtons(ele);
        ele.addEventListener('click', function (evt) {
            let t = tweets[evt.currentTarget.getAttribute('tid')];
        });
        twemoji.parse(ele);
    }
    if (newIds.length > 0) {
        initMasonry();
    }
}

function updateStatus(evt, status) {
    let ele = evt.currentTarget.parentNode.parentNode;
    let tid = ele.getAttribute('tid');
    masonry.remove(ele);
    db.collection('moderation').doc(tid).set({
        status: status
    });
}

setInterval(function () {
    var h = 0;
    for (let ele of document.querySelectorAll('.tweet-card')) {
        h += ele.offsetHeight;
    }
    if (h != totalHeight) {
        totalHeight = h;
        masonry.layout();
    }
}, 200);

function getParam(key, fallback = undefined) {
    var v = new URLSearchParams(document.location.search).get(key);
    return v ? v : fallback
}

function updateNav() {
    for (let l of document.querySelectorAll('.nav-link')) {
        if (l.classList.contains(filter)) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    }
    history.replaceState({}, {}, '/?filter=' + filter);
}

function updateFilter(f) {
    filter = f;
    currentIds = [];
    for (let ele of document.querySelectorAll('.tweet-card')) {
        ele.parentNode.removeChild(ele);
    }
    updateLayout();
    updateNav();
}
updateNav();
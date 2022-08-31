var db;
var app;

var moderationStatus = {};

function initDb() {
	db = firebase.firestore(app);
	db.enablePersistence({
		synchronizeTabs: true
	});
	db.collection('entry').onSnapshot(snapshot => {
		moderationStatus = {};
		for (var doc of snapshot.docs) {
			moderationStatus[doc.id.toString()] = doc.data().status;
		}
		sendStatus();
	});
}

function init(callback) {
	if (app) {
		sendStatus();
		return callback('ok');
	}

	// chrome.storage.local.get(['api-key', 'project'], data => {
	app = firebase.initializeApp({
		apiKey: 'AIzaSyB2XCed08GSZ9CevFnOkJYrCHEDf9nIRZM',
		projectId: 'tweets-on-screen'
	});
	initDb();
	callback('ok');
}

async function login(callback, data) {
	if (app) await app.delete();
	app = firebase.initializeApp({
		apiKey: data['api-key'],
		projectId: data['project']
	});

	app.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
	try {
		let resp = await app.auth().signInWithEmailAndPassword(data['email'], data['password']).catch(error => { })
		if (!resp) return;
		delete data.password;
		chrome.storage.local.set(data);
		initDb();
		callback('ok');
	} catch (error) {
		if (error.message[0] == '{') error = JSON.parse(error.message).error;
		callback(error.message);
	}
	return true;
}

function logout() {
	chrome.storage.local.clear();
	app.auth().signOut();
}

chrome.runtime.onMessage.addListener((msg, _, callback) => {
	switch (msg.command) {
		case 'add':
			addTweet(msg.data, callback);
			break;
		case 'init':
			init(callback);
			break;
		case 'login':
			login(callback, msg);
			break;
		case 'logout':
			logout();
			break
		case 'status':
			callback(moderationStatus);
			break;
	}
	return true;
});

async function addTweet(data, callback) {
	try {
		console.log(db.collection('entry'));
		let entry = db.collection('entry').doc(data.tid);
		let doc = await entry.get();
		if (!doc.exists) {
			// data.log = [`${new Date().toISOString()}|S|${app.auth().currentUser.email}`];
			entry.set(data);
		}
		callback('ok');
	} catch (e) {
		callback(e.message);
	}
}

function sendStatus() {
	chrome.tabs.query({
		url: 'https://twitter.com/*'
	}, tabs => {
		for (t of tabs) chrome.tabs.sendMessage(t.id, { command: 'status', data: moderationStatus });
	});
}
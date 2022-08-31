var ajaxData = {};
var moderationStatus = {};
/**
 * Inject CSS for "shortlist" button
 */

let ele = document.createElement('link');
ele.rel = "stylesheet"
ele.href = chrome.extension.getURL('injection.css')
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

		// Check if it's a quote tweet
		if (ele.querySelectorAll('[data-testid=tweetText]').length > 1) continue;

		// Using regular expression to strip off none digital characters
		// So far never seen any none digital chars, but just to be safe
		let tid = timeEle.parentNode.getAttribute('href').split('/').pop().replace(/\D+/g, '');

		// Creates the button
		var btn = document.createElement('button');
		var status = moderationStatus[tid];
		// Attach css class for different stage
		btn.className = 'tos-btn ' + (status ? status : 'normal')


		ele.append(btn);
		btn.addEventListener('click', function (e) {
			console.log(e.currentTarget);
			e.stopPropagation();
			if (!e.currentTarget.classList.contains('normal')) return;
			e.currentTarget.className = "tos-btn pending";
			addTweet(e.currentTarget);
		});
	}

	setTimeout(addButtons, 200);
}

function addTweet(btn) {
	const tweetFields = ['tid', 'verified', 'name', 'screen_name', 'created_at', 'text', 'photos', 'avatar'];
	let data = {};
	let article = btn.parentNode;
	let userNames = article.querySelector('[data-testid=User-Names]').textContent;
	data.name = userNames.substring(0, userNames.indexOf('@'));
	data.screen_name = userNames.substring(userNames.indexOf('@') + 1, userNames.indexOf('·'));
	data.avatar = article.querySelector('[data-testid=Tweet-User-Avatar] img').getAttribute('src');
	data.created_at = article.querySelector('time').getAttribute('datetime').substring(0, 19).replace('T', ' ');
	data.verified = article.querySelector('svg[aria-label="Verified account"]') ? true : false;
	data.text = article.querySelector('[data-testid=tweetText]').innerHTML;
	data.photos = Array.from(article.querySelectorAll('[data-testid=tweetPhoto] img')).map(x => x.getAttribute('src'));
	data.tid = article.querySelector('time').parentNode.getAttribute('href').split('/').pop().replace(/\D+/g, '');
	data.status = 'pending';
	console.log(data);
	chrome.runtime.sendMessage({
		command: 'add',
		data: data
	}, function (resp) {
		if (resp != 'ok') {
			alert(`An error occurred for tweet: ${resp}.\n Please try to logout and login the extension again.`);
		}
	});
}

chrome.runtime.onMessage.addListener(function (msg, _, __) {
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
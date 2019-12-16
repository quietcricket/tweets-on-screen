var ajaxData = {
    tweets: {},
    users: {},
    emojis: [],
    emoji_timestamp: ''
};
/**
 * Add 2 invisible textareas to store the data 
 * content.js will grab data from there
 * a work around the pass data to content.js
 */
var dataDiv = document.createElement('div');
dataDiv.style.display = "none";
dataDiv.id = "ajax-data";
document.body.append(dataDiv);

/**
 * Add a listener to capture ajax calls for tweets and users' details
 */
(function () {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function (method, url) {
        this.url = url;
        return open.apply(this, arguments);
    }
    XHR.send = function () {
        this.addEventListener('load', function () {
            // console.log('================================');
            console.log(this.responseURL, this.responseURL.indexOf('https://pbs.twimg.com/hashflag/'));
            // console.log(this.response);
            var updated = false;
            if (this.response.indexOf('globalObjects') > -1) {
                var data = JSON.parse(this.response).globalObjects;
                for (var k in data.tweets) ajaxData.tweets[k] = data.tweets[k];
                for (var k in data.users) ajaxData.users[k] = data.users[k];
                updated = true;
            } else if (this.responseURL.indexOf('https://pbs.twimg.com/hashflag/') == 0) {
                /**
                 * Capture the custom emoji part
                 * Use the last segment as key to indicate if it has changed
                 */
                // let arr = this.responseURL.split('/');
                // ajaxData.emoji_timestamp = arr[arr.length - 1];
                // ajaxData.emojis = JSON.parse(this.response);
                // updated = true;
            }
            if (updated) {
                dataDiv.innerHTML = encodeURIComponent(JSON.stringify(ajaxData));
                dataDiv.setAttribute('dirty', 1);
                ajaxData = {
                    tweets: {},
                    users: {},
                    emojis: [],
                    emoji_timestamp: ''
                }
            }
        });
        return send.apply(this, arguments);
    };
})();

/**
 * Loop through elements to detect tweets and their IDs
 * Mark them for content.js to process
 */
function extractTweetId() {
    for (var ele of document.querySelectorAll('article')) {
        var node = ele.parentNode;
        if (node.hasAttribute('dooh')) continue;
        let key;
        for (var p of Object.keys(node)) {
            if (p.indexOf('__reactEventHandlers') == 0) {
                try {
                    var cont = node[p].children.props.entry.content;
                } catch (error) {
                    break
                }
                if (cont.displayType == 'Tweet') {
                    key = cont.id;
                }
                break;
            }
        }
        if (key) {
            node.setAttribute('dooh', key);
        }
    }
    setTimeout(extractTweetId, 1000);
}

extractTweetId();
var jsonData = {
    tweets: {},
    users: {}
}
/**
 * Add 2 invisible textareas to store the data 
 * content.js will grab data from there
 * a work around the pass data to content.js
 */
var jsonDiv = document.createElement('div');
jsonDiv.style.display = "none";
jsonDiv.id = "json-data";
document.body.append(jsonDiv);

/**
 * Add a listener to capture ajax calls for tweets and users' details
 */
(function () {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function (method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function () {
        this.addEventListener('load', function () {
            if (this.response.indexOf('globalObjects') > -1) {
                var data = JSON.parse(this.response).globalObjects;
                for (var k in data.tweets) jsonData.tweets[k] = data.tweets[k];
                for (var k in data.users) jsonData.users[k] = data.users[k];
                jsonDiv.innerHTML = encodeURIComponent(JSON.stringify(jsonData));
                jsonDiv.setAttribute('dirty', 1);
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
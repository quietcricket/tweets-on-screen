function extractTweetId() {
    for (var ele of document.querySelectorAll('article')) {
        var node = ele.parentNode.parentNode;
        if (node.hasAttribute('dooh')) continue;
        let key;
        for (var p of Object.keys(node)) {
            if (p.indexOf('__reactEventHandlers') == 0) {
                let arr = node[p].children._owner.key.split('tweet-');
                if (arr.length > 1) key = arr[arr.length - 1];
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
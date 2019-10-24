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
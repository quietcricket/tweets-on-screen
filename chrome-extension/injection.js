function extractTweetId() {
    for (var ele of document.querySelectorAll('article')) {
        var node = ele.parentNode;
        if (node.hasAttribute('dooh')) continue;
        let key;
        for (var p of Object.keys(node)) {
            if (p.indexOf('__reactEventHandlers') == 0) {
                console.log(node[p].children.props);
                if (!node[p].children.props.entry) {
                    break;
                }
                var cont = node[p].children.props.entry.content
                if (cont.displayType == 'Tweet')
                    key = cont.id;
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
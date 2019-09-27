if (!window.is_top) {
    chrome.storage.sync.get('tweet', function (data) {
        console.log(top.location.href, data['tweet']);
        if (top.document.location.href == data['tweet'])
            top.get_votes(document.querySelector('.CardContent'));
    });
}
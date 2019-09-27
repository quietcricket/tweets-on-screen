window.is_top = true;
var votes = [];
var total = 0;

function get_votes(holder) {
    for (const ele of holder.querySelectorAll('span')) {
        var text = ele.textContent.trim();
        if (!text) continue;
        if (text.indexOf('%') == text.length - 1) {
            votes.push(parseInt(text));
        } else if (text.indexOf('votes') > -1) {
            total = parseInt(text);
        }
    }
    if(holder.tagName=='ARTICLE'){
        for (const ele of holder.querySelectorAll('div')) {
            var text=ele.textContent.trim();
            console.log(text);
            if (text.indexOf('votes') > -1) {
                total=parseInt(text.substr(text.lastIndexOf('%')+1,text.indexOf('votes')));
                break;
            }
        }
    }
    chrome.storage.sync.get('server', function (data) {
        var url = data['server'];
        url += '&n=' + total;
        for (var i = 1; i < votes.length + 1; i++) {
            url += "&v" + i + "=" + votes[i - 1];
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
    });
}

chrome.storage.sync.get('tweet', function (data) {
    if (document.location.href == data['tweet'] && !document.querySelector('iframe'))
        wait_article();
});

function wait_article(){
    var art=document.querySelector('article');
    if(!art){
        setTimeout(wait_article,100);
    }else{
        get_votes(document.querySelector('article'));
    }
}

setTimeout(() => {
    document.location.reload()
}, 120000);

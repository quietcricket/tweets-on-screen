var tweets = [];
var currIndex = 0;

function show_tweet(tid) {
    var ele = document.createElement("div");
    ele.id = "selected-" + tid;
    ele.classList.add("tweet");
    $('.selected-tweets').prepend(ele);
    twttr.widgets.createTweet(tid, ele, {
        conversation: 'none'
    }).then(dom => {
        var shadow = dom.shadowRoot.children[1];
        shadow.querySelector('.EmbeddedTweet').style.backgroundColor = "rgba(255,255,255,0.8)"
    });
}

function slideIn(index) {
    var tweets = document.querySelectorAll('.tweet');
    var n = tweets.length;
    var arr = [tweets[index % n], tweets[(index + 1) % n], tweets[(index + 2) % n]];
    var wh = $(window).height();
    var ww = $(window).width();
    for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        t.style.left = ww * 0.3 * i + ww * 0.025 * (i + 1)
        t.style.top = (wh - t.offsetHeight) / 2 + 'px';
        t.style.marginTop = '20px';
        t.setAttribute('in', 1);
        $(t).delay(200 * (i + 1)).animate({
            marginTop: 0,
            opacity: 1
        }, {
            duration: 400,
        });
    }
    currIndex = index + 3;
}

function slideOut() {
    var arr = document.querySelectorAll('.tweet[in]');
    for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        t.removeAttribute('in');
        $(t).delay(100 * (arr.length - i - 1)).animate({
            marginTop: -20,
            opacity: 0
        }, {
            duration: 400,
        });
    }

}

function fetch_tweets() {
    $.get('/selected-tweets', function (data) {
        var new_tweets = data.split(",");
        var has_new = false;
        for (var t of new_tweets) {
            if (tweets.indexOf(t) > -1) {
                continue;
            }
            has_new = true;
            show_tweet(t);
        }

        for (var t of tweets) {
            if (new_tweets.indexOf(t) == -1) {
                $('#selected-' + t).detach();
            }
        }
        tweets = new_tweets;
        if (has_new) {
            currIndex = 0;
        }
    });
}
window.addEventListener('resize', function () {
    var vid = $('#bg-video');
    $(vid).css('width', $(window).width());
});

$('#bg-video').css('width', $(window).width());
setInterval(fetch_tweets, 2000);
setInterval(fetch_tweets, 100);
setTimeout(function () {
    slideIn(0)
}, 3000);

setInterval(function () {
    slideOut();
    slideIn(currIndex);
}, 8000);
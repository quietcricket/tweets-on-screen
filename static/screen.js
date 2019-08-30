const ROWS = 2;
const COLS = 2;
const MARGIN = 20;
const WIDTH = `calc(${100/COLS}% - ${MARGIN*(COLS-1)/COLS}px)`;

var tweet_ids = [];
var currIndex = 0;

function show_tweet(tid) {
    var ele = document.createElement("div");
    ele.id = "selected-" + tid;
    ele.style.opacity = 0;
    ele.style.position = 'absolute';
    ele.style.width = WIDTH
    ele.classList.add('tweet');

    $('.selected-tweets').prepend(ele);
    twttr.widgets.createTweet(tid, ele, {}).then(dom => {
        var shadow = dom.shadowRoot.children[1];
        shadow.querySelector('.EmbeddedTweet').style.backgroundColor = "rgba(255,255,255,0.8)"
    });
}

function slideIn(index) {
    var tweets = document.querySelectorAll('.tweet');
    var wh = $(window).height();
    var col_tops = [];
    for (var c = 0; c < COLS; c++) {
        var total_height = 0;
        for (var r = 0; r < ROWS; r++) {
            var n = c + r * COLS;
            var t = tweets[(index + n) % tweets.length];
            total_height += t.offsetHeight;
        }
        col_tops.push((wh - total_height) / 2);
    }
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var n = c + r * COLS;
            var t = tweets[(index + n) % tweets.length];
            t.style.left = `calc(${100/COLS*c}% + ${MARGIN*(COLS-1)/COLS*(c+1)}px)`
            t.style.top = col_tops[c] + 'px';
            t.style.marginTop = '-20px';
            t.style.opacity = 0;
            col_tops[c] += t.offsetHeight;
            t.setAttribute('in', 1);
            $(t).delay(200 * (n + 1)).animate({
                marginTop: 0,
                opacity: 1
            }, {
                duration: 400,
            });
        }
    }

    currIndex += ROWS * COLS;
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
        var new_ids = data.split(",");
        var has_new = false;
        for (var t of new_ids) {
            if (tweet_ids.indexOf(t) > -1) {
                continue;
            }
            has_new = true;
            show_tweet(t);
        }
        for (var t of tweet_ids) {
            if (new_ids.indexOf(t) == -1) {
                $('#selected-' + t).detach();
            }
        }
        tweet_ids = new_ids;
        if (has_new) {
            setTimeout(slideIn, 2000, 0);
        }
    });
}
window.addEventListener('resize', function () {

});

function waitWidget() {
    if (twttr.hasOwnProperty('widgets')) {
        fetch_tweets()
    } else {
        setTimeout(waitWidget, 100);
    }
}

setInterval(function () {
    slideOut();
    slideIn(currIndex);
}, 8000);

waitWidget();
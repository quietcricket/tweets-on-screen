var selected_tweets = [];
var tweets = [];

function add_tweet(tid) {
    $.get(`/add-tweet/${tid}`);
    synch_selected();
    document.querySelector('.selected-tweets').scrollTop = 0;
}

function remove_tweet(tid) {
    $.get(`/remove-tweet/${tid}`);
    synch_selected();
}


function show_tweet(tid, mode = 'search') {
    var ele = document.createElement("div");
    ele.id = `${mode}-${tid}`;
    ele.classList.add("col-6");
    $(`.${mode}-tweets`).prepend(ele);
    twttr.widgets.createTweet(tid, ele, {
        conversation: 'none'
    }).then(dom => {
        if (!dom) {
            return;
        }
        var shadow = dom.shadowRoot.children[1];
        var color = mode == 'search' ? 'rgb(43,123,185)' : '#dc3545';
        var func = mode == 'search' ? 'add_tweet' : 'remove_tweet';
        var text = mode == 'search' ? 'Feature Tweet' : 'Remove Tweet';
        var styles = `display:inline-block;margin:15px 0 15px 0;font-size:1.2em;padding:5px 15px;background:${color};border-radius:5px;color:white;`;
        $(shadow).append(`<div style="text-align:center"><a href="javascript:void(0)" style="${styles}" onclick="${func}(\'${tid}\')">${text}</a></div>`);
    });

}

function search_tweets() {
    $.post('/search-tweets', {
        term: $("#term").val()
    }, function (data) {
        var result = data.split(",");
        for (var t of result) {
            if (tweets.indexOf(t) > -1) {
                continue;
            }
            show_tweet(t);
        }

        for (var t of tweets) {
            if (result.indexOf(t) == -1) {
                $('#t-' + t).detach();
            }
        }
        tweets = result;
    });
}

function synch_selected() {
    $.get('/selected-tweets', function (data) {
        var result = data.split(",");
        for (var t of result) {
            if (selected_tweets.indexOf(t) > -1) {
                continue;
            }
            show_tweet(t, 'selected');
        }

        for (var t of selected_tweets) {
            if (result.indexOf(t) == -1) {
                $('#selected-' + t).detach();
            }
        }
        selected_tweets = result;

    });
}

setInterval(search_tweets, 10000);
setInterval(synch_selected, 5000);
setTimeout(synch_selected, 500);
setTimeout(search_tweets, 1000);
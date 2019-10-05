var SPEED = 250 / 60;
var url = `/admin-api/get-entries/approved`;
var tweets = [];
var newTweets = [];
var incommingTweets = [];
var index = 0;
var loaded = false;
var currentId = 'xxx';

function genHtml(e) {
    var img = '';
    if (e.image) {
        img = `<img src="${e.image}" />`;
    }

    return `
            <div class="entry" id="entry-${e.id}">
                <div class="entry-content">
                    <div class="tweet-handle d-flex align-items-center mb-3">
                        <img src="${e.profile}" class="profile mr-2" />
                        <div>
                            <div class="display">${e.display}</div>
                            <div class="handle">${e.handle}</div>
                        </div>
                    </div>
                    <div class="tweet-text"> ${e.text} </div>
                    <div class="tweet-image my-2">${img}</div>
                </div>
            </div>`;
}

function fetchData() {
    $.ajax({
        url: `${url}?random=${Math.random()}`,
        dataType: 'json',
    }).then(function (data) {
        for (d of data) {
            incommingTweets.push(d);
        }
        processIncoming();
    });
}

function processIncoming() {
    for (var t of incommingTweets) {
        newTweets.push(t.id);
        if (tweets.indexOf(t.id) == -1) {
            $('.preload').append(genHtml(t))
            index = newTweets.length - 1;
        }
    }

    // Remove deleted tweets
    for (var ct of tweets) {
        if (newTweets.indexOf(ct) == -1) {
            $(`#entry-${ct}`).detach();
        }
    }
    tweets = newTweets;
    if (!loaded) {
        loaded = true;
        requestAnimationFrame(animate);
    }
    incommingTweets = [];
}


function animate(timestamp) {
    var lastElement = $(`#entry-${currentId}`).last();
    if (lastElement.length == 0 || parseFloat(lastElement.attr('tx')) > lastElement.outerHeight()) {
        var newElement = $(`#entry-${tweets[index]}`).first();
        $('.mask').append(newElement)
        newElement.attr('tx', 0);
        newElement.css('top', $('.mask').height());
        currentId = tweets[index];
        index = (index + 1) % tweets.length;
    }
    $('.mask .entry').each(function () {
        var ele = $(this);
        var tx = parseFloat(ele.attr('tx'));
        tx = Math.round(tx + SPEED);
        ele.css('transform', `translate3d(0,-${tx}px,0)`);
        ele.attr('tx', tx);
    });
    requestAnimationFrame(animate);

}

setInterval(fetchData, 10000);
fetchData();
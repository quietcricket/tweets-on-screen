var BOARD_ID = "jkt2019";
var SPEED = localStorage.getItem("speed") ? parseInt(localStorage.getItem("speed")) : 200;
$('#speed').val(SPEED);
var PER_PAGE = 20;
var url = `https://spotify.api.shuttlerock.com/v2/boards/${BOARD_ID}/entries.json?per_page=${PER_PAGE}`;
var tweets = [];
var incommingTweets = [];
var index = 0;
var loaded = false;
var currentId = 'xxx';
var requestTime = 0;

function genHtml(id, html, name, username, picture, time, image) {
    return `
    <div class="article ${id}">
        <div class="article-container">
            <div class="article-author cf">
                <div class="article-author-img" style="background-image: url(${picture})"></div>
                    <div class="article-author-txt">
                    <p class="article-author-name">${name}</p>
                    <p class="article-author-id">@${username}</p>
                </div>
            </div>
            <div class="article-txt">${html}</div>
            ${image? '<div class="article-img"><img src="'+image+'"></div>':''}
            <p class="article-date">${time}</p>
        </div>
    </div>`;
}

function fetchData() {
    var page = Math.floor(incommingTweets.length / PER_PAGE) + 1;
    requestTime = new Date().getTime();
    $.ajax({
        url: `${url}&page=${page}&random=${new Date().getTime()}`,
        dataType: 'json',
    }).then(function (data) {
        var latency = new Date().getTime() - requestTime;
        $('#latency').val(latency);
        for (d of data) {
            incommingTweets.push(d);
        }

        if (latency > 2000) {
            $('#warning').html("NETWORK TOO SLOW,AUTO REFRESHING STOPPED!")
            return;
        }

        if (data.length == PER_PAGE) {
            fetchData();
        } else {

            setTimeout(fetchData, 5000);
            processIncoming();
        }
    }, function (error) {
        $('#latency').val(new Date().getTime() - requestTime);
        setTimeout(fetchData, 5000);
    });
}

function processIncoming() {
    var newTweets = [];
    var newIndex = -1;
    for (var t of incommingTweets) {
        newTweets.push(t.short_id);
        if (tweets.indexOf(t.short_id) == -1) {
            addTweet(t);
            if (newIndex == -1) {
                newIndex = newTweets.length - 1;
            }
        }
    }
    if (newIndex != -1) {
        index = newIndex;
    }

    // Remove deleted tweets
    for (var ct of tweets) {
        if (newTweets.indexOf(ct) == -1) {
            $(`.${ct}`).detach();
        }
    }
    tweets = newTweets;

    if (!loaded) {
        loaded = true;
        requestAnimationFrame(animate);
    }

    $('.article-img img').each(function () {
        if (this.height > this.width) {
            $(this).css('height', $('.l-wrap .article-img img').width());
        }
    });

    incommingTweets = [];
}

function addTweet(t) {
    var d = new Date(t.details.created_at);
    var mm = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"][d.getMonth()];
    var time = `${d.getHours()}:${d.getMinutes()} - ${d.getDate()} ${mm} ${d.getFullYear()}`;
    $('#hidden-items').append(genHtml(t.short_id, t.details.html_description, t.author.name, t.source.username, t.author.picture, time, t.images.show));
}

function animate(timestamp) {
    var lastElement = $(`#photoArea .${currentId}`).last();
    if (lastElement.length == 0 || parseFloat(lastElement.attr('tx')) > lastElement.outerHeight()) {
        var newElement = $(`.${tweets[index]}`).first();
        $('#photoArea').append(newElement)
        newElement.attr('tx', 0);
        newElement.css('top', $('.photo__wrap').height());
        currentId = tweets[index];
        index = (index + 1) % tweets.length;
    }
    $('#photoArea .article').each(function () {
        var ele = $(this);
        var tx = parseFloat(ele.attr('tx'));
        tx = Math.round(tx + SPEED / 60);
        ele.css('transform', `translate3d(0,-${tx}px,0)`);
        ele.attr('tx', tx);
    });
    requestAnimationFrame(animate);

}

function updateSpeed(ele) {
    ele.blur();
    SPEED = parseInt(ele.value);
    localStorage.setItem("speed", SPEED);

}

fetchData();
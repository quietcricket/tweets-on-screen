var url = "https://" + usr + ".api.shuttlerock.com/v2/boards/" + boardId + "/entries.json?page=0&per_page=20";
var tweets = [];
var index = 0;
var loaded = false;
var currentId = 'xxx';

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
    $.ajax({
        url: url + '&random=' + (new Date()),
        dataType: 'json',
        cache: 0
    }).then(function (data) {
        var newTweets = [];

        for (var t of data) {
            newTweets.push(t.id);
            // add new tweets
            if (tweets.indexOf(t.id) == -1) {
                addTweet(t);
                index = newTweets.length - 1;
            }
        }

        // Remove deleted tweets
        for (var ct of tweets) {
            if (newTweets.indexOf(ct) == -1) {
                $(`#hidden-items .${ct}`).detach();
            }
        }
        tweets = newTweets;

        if (!loaded) {
            loaded = true;
            requestAnimationFrame(animate);
        }
    });
}

function addTweet(t) {
    var d = new Date(t.details.created_at);
    var mm = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"][d.getMonth()];
    var time = `${d.getHours()}:${d.getMinutes()} - ${d.getDate()} ${mm} ${d.getFullYear()}`;
    $('#hidden-items').append(genHtml(t.id, t.details.html_description, t.author.name, t.source.username, t.author.picture, time, t.images.show));
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
        tx = Math.round(tx + speed);
        ele.css('transform', `translate3d(0,-${tx}px,0)`);
        ele.attr('tx', tx);
    });
    requestAnimationFrame(animate);

}

setInterval(fetchData, 5000);
fetchData();
// var SERVER_URL = 'https://dooh.link/extension-api/';
var SERVER_URL = 'http://localhost:8080/extension-api/';
var tweets = {};

function findTweets() {
    for (var ele of document.querySelectorAll('[data-testid=tweet]')) {
        if (ele.hasAttribute('dooh')) continue;
        ele.setAttribute('dooh', 1);
        addButton(ele);
    }
}

function addButton(entry) {
    var holder = entry.querySelector('[role=group]:last-child');
    var btn = document.createElement('span');
    btn.classList.add('dooh-btn');
    btn.innerHTML = 'shortlist';

    holder.prepend(btn);

    var data = extractAll(holder.parentNode.parentNode);
    tweets[data.hash_id] = data;
    btn.setAttribute('hash_id', data.hash_id);
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.currentTarget.innerHTML = 'pending';
        feature(e.currentTarget.getAttribute('hash_id'));
    });
}

function feature(hash) {
    $.ajax({
        url: SERVER_URL + 'add',
        dataType: 'json',
        method: 'POST',
        data: {
            data: JSON.stringify(tweets[hash])
        }
    }).then(function (data) {});
}

function getStatus() {
    $.ajax({
        url: SERVER_URL + 'status',
        dataType: 'json',
        method: 'POST',
        data: {
            data: JSON.stringify(Object.keys(tweets))
        }
    }).then(function (data) {
        for (var h in data) {
            $(`[hash="${h}"`).html(data[h]);
        }
    });
}

function extractAll(ele) {
    var data = {};
    data.profile = extractProfile(ele);
    data.text = extractText(ele);
    data.images = extractImage(ele);
    data.time_created = extractTime(ele);
    Object.assign(data, extractHandle(ele));
    data.hash_id = data.handle + data.time;
    return data;
}


function extractHandle(ele) {
    var node = ele.childNodes[1].childNodes[0];
    var displayName = cleanHtml(node.querySelector('a>div>div:first-child span'));
    var verified = node.querySelector('a svg');
    var handle = cleanHtml(node.querySelector('a>div>div:last-child'));
    return {
        display_name: displayName,
        handle: handle,
        verified: verified != null
    };
}

function extractTime(ele) {
    var node = ele.childNodes[1].childNodes[0];
    return node.querySelector('time').getAttribute('datetime');
}

function extractText(ele) {
    var node = ele.childNodes[1].childNodes[1];
    if (!node.hasAttribute('lang')) {
        node = ele.childNodes[1].childNodes[2];
    }
    return cleanHtml(node);
}

function extractImage(ele) {
    var imgs = [];
    var ignores = ['/profile_images/', '/emoji/', '/hashflags/'];
    for (img of ele.childNodes[1].querySelectorAll('img')) {
        var shouldIgnore = false;
        for (var ig of ignores) {
            if (img.src.indexOf(ig) > -1) {
                shouldIgnore = true;
                break;
            }
        }
        if (!shouldIgnore) {
            imgs.push(img.src);
        }
    }
    return imgs.join(',');
}

function extractProfile(ele) {
    var node = ele.childNodes[0];
    var img = node.querySelector('img');
    return img.src
}

function cleanImg(ele) {
    var img = ele.querySelector('img');
    return img ? `<img src="${img.src}"/>` : '';
}

function cleanHtml(ele) {
    var html = '';
    for (var s of ele.childNodes) {
        var a = s.querySelector('a');
        if (a) {
            html += `<a href=${a.href}>${a.textContent}${cleanImg(a)}</a>`;
        } else {
            html += s.textContent + cleanImg(s);
        }
    }
    html = html.replace(/(?:\r\n|\r|\n)/g, '<br>');
    return html;
}
/*
function isSelectable(ele) {
    var imgs = ele.querySelectorAll('img');
    var ignores = ['/profile_images/', '/amplify_video_thumb/', '/ext_tw_video_thumb/', '/ad_img/'];
    for (var img of imgs) {
        console.log(img.src);
        for (var ig of ignores) {
            if (img.src.indexOf(ig) > -1) return false;
        }
    }
    return true;
}
*/
var style = document.createElement('style');
style.innerHTML = `
.dooh-btn{
    color: #ccc;
    border: solid 1px #999;
    background: #666;
    font-family: system-ui;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 5px;
    margin-right: 10px;
    text-transform:capitalize;
}`;
document.body.appendChild(style);

setInterval(findTweets, 1000);
// setInterval(getStatus, 5000);
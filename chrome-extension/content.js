

function addButton(entry) {
    var holder = entry.querySelector('[role=group]:last-child');
    var btn = document.createElement('span');
    btn.innerHTML = 'DOOH';
    holder.appendChild(btn);
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        //  extractHandle(e.currentTarget);
        // extractHandle(e.currentTarget);
        // console.log(e.currentTarget.parentNode.parentNode.childNodes[1]);
        // console.log(e.currentTarget.parentNode.parentNode.childNodes[2]);
    });
}


function cleanHtml(ele) {
    var html = '';
    for (var s of ele.querySelectorAll('span')) {
        var img = s.querySelector('img');
        if (img) {
            html += img.outerHTML;
        } else {
            html += s.textContent;
        }
    }
    html=html.replace(/(?:\r\n|\r|\n)/g, '<br>');
    console.log(html);
    return html;
}


function findTweets() {
    for (var ele of document.querySelectorAll('[data-testid=tweet]')) {
        if (ele.hasAttribute('dooh')) continue;
        ele.setAttribute('dooh', 1);
        // addButton(ele);
        // extractHandle(ele.childNodes[1].childNodes[0]);
        extractText(ele.childNodes[1].childNodes[1]);
    }
}

function extractHandle(ele) {
    var displayName = cleanHtml(ele.querySelector('a>div>div:first-child span'));
    var handle = cleanHtml(ele.querySelector('a>div>div:last-child'));
}

function extractText(ele) {
    cleanHtml(ele);
}
function extractImage(ele) {

}

function extractProfile(ele) {
    return ele.querySelector('img').src;
}

setInterval(findTweets, 1000);
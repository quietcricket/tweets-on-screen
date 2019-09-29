function findTweets() {
    for (var ele of document.querySelectorAll('[data-testid=tweet]')) {
        if (ele.hasAttribute('dooh')) continue;
        console.log(ele.querySelectorAll('[lang]'));
        ele.setAttribute('dooh', 1);
    }
}

function extractProfile(ele) {
    return ele.querySelector('img').src;
}

setInterval(findTweets, 1000);
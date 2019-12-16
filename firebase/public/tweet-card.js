function renderTweet(tweet, user) {
    let verified = user.verified ? '<svg viewBox="0 0 24 24"><g ><path fill="rgba(29,161,242,1.00)"  d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>' : '';
    var text = trimText(tweet);
    text = hilightHashtags(tweet.entities, text);
    text = hilightLinks(tweet.entities, text);

    let media = expendMedia(tweet.entities, tweet.extended_entities);
    // console.log(user.name);
    // console.log(tweet);

    return `<div class="tweet-header">
                <img class="profile" src="${user.profile_image_url_https}">
                <h5>${user.name}</h5>
                ${verified}
                <h6>@${user.screen_name}</h6>
            </div>
            <div class="tweet-body">${text}</div>
            <div class="tweet-medias"> ${media}</div>`;
}

function expendMedia(entities, extended_entities) {
    /**
     * Only display the first media if there are mutiple ones
     * So far only see multiple images
     */
    if (!entities || !entities.media) return '';
    for (let m of entities.media) {
        let video = expendVideo(extended_entities, m.id_str);
        if (video) {
            return `<video class="media" src="${video}" loop autoplay></video>`;
        } else {
            return `<img class="media" src="${m.media_url_https}">`;
        }
    }

    return '';
}

function expendVideo(extended_entities, media_id) {
    if (!extended_entities || !extended_entities.media) return null;
    for (let m of extended_entities.media) {
        if (m.id_str == media_id && m.video_info) {
            return m.video_info.variants[0].url
        }
    }
}

/**
 * Quite frequently the tweet ends with an emoji, which is double character
 * Need to manually check when the display text should end
 * Cannot rely on display_text_range
 */
function trimText(tweet) {
    var text = tweet.full_text;
    var startIndex = tweet.display_text_range[0];
    var endIndex = tweet.display_text_range[1];
    while (true) {
        if (endIndex == text.length || text[endIndex] == ' ') break;
        endIndex++;
    }
    return text.substring(startIndex, endIndex);
}

function hilightLinks(entities, text) {
    if (!entities || !entities.urls) return text;
    for (let url of entities.urls) {
        text = text.replace(url.url, `<blue>${url.display_url}</blue>`);
    }
    return text;
}

function hilightHashtags(entities, text) {

    if (!entities || !entities.hashtags) return text;
    for (let h of entities.hashtags) {
        text = text.replace(`#${h.text}`, `<blue>#${h.text}</blue>`);
    }
    return text;
}
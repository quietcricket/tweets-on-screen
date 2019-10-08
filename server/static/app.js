function initList() {
    window.entriesHolder = $('.entries-holder');
    var uri = document.location.search;
    window.currStatus = 'pending';
    if (uri.indexOf('=approved') > -1) {
        currStatus = 'approved';
    } else if (uri.indexOf('=rejected') > -1) {
        currStatus = 'rejected';
    }
    entriesHolder.masonry({
        gutter: 20,
        transitionDuration: 100
    });
    getEntries(currStatus);
}

function getEntries(status) {
    history.replaceState(null, 'Moderation - ' + status[0].toUpperCase() + status.substr(1), '?status=' + status);
    $.get(`/admin-api/get-entries/${status}?random=${Math.random()}`).then(function (data) {
        entriesHolder.empty();
        for (var e of data) {
            if (e.image) {
                e.image = `<img src="${e.image}" />`;
            } else {
                e.image = ''
            }

            var html = `
                <div class="entry" id="entry-${e.id}">
                    <div class="tweet-handle d-flex align-items-center">
                        <img src="${e.profile}" class="profile mr-2" />
                        <div>
                            <span class="display_name">${e.display_name}</span>
                            <span class="handle">${e.handle}</span>
                        </div>
                    </div>
                    <div class="tweet-text mt-2"> ${e.text} </div>
                    <div class="tweet-image my-2">${e.image}</div>
                    <div>
                        <button class="btn btn-primary btn-sm btn-approved" onclick="updateStatus('${e.id}','approved')">Approve</button>
                        <button class="btn btn-secondary btn-sm btn-pending" onclick="updateStatus('${e.id}','pending')">Pending</button>
                        <button class="btn btn-danger btn-sm btn-rejected" onclick="updateStatus('${e.id}','rejected')">Reject</button>
                    </div>
                </div>`;

            entriesHolder.append(html);
        }
        entriesHolder.imagesLoaded().progress(function () {
            entriesHolder.masonry('layout');
        });

        entriesHolder.masonry('reloadItems');
        entriesHolder.removeClass(currStatus);
        entriesHolder.addClass(status);
        currStatus = status;
    });

}

function updateStatus(id, status) {
    $.post('/admin-api/change-status', {
        id: id,
        status: status
    }, function (data) {
        entriesHolder.masonry('remove', $('#entry-' + id));
        $('#entry-' + id).detach();
        entriesHolder.masonry('layout');
    });
}
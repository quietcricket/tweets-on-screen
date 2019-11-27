function getParam(key, fallback = undefined) {
    var v = new URLSearchParams(document.location.search).get(key);
    return v ? v : fallback
}

function initModeration() {
    window.entriesHolder = $('.entries-holder');
    var uri = document.location.search;
    window.currStatus = getParam('status', 'pending');
    entriesHolder.masonry({
        gutter: 20,
        transitionDuration: 100
    });
    getEntries(currStatus);
}

function getEntries(status) {
    var pid = getParam('pid');
    history.replaceState(null, `Moderation - ${status.toUpperCase()}`, `?pid=${pid}&status=${status}`);
    $.get(`/admin-api/get-entries?pid=${pid}&status=${status}&random=${Math.random()}`).then(function (data) {
        entriesHolder.empty();
        for (var e of data) {
            if (e.photo) {
                e.photo = `<img src="${e.photo}" />`;
            } else {
                e.photo = ''
            }

            var html = `
                <div class="entry jumbotron" id="entry-${e.id}">
                    <div class="tweet-handle d-flex align-items-center">
                        <img src="${e.profile_image_url}" class="profile mr-2" />
                        <div>
                            <span class="name">${e.name}</span>
                            <br/>
                            <span class="username">${e.username}</span>
                        </div>
                    </div>
                    <div class="tweet-text mt-2"> ${e.text} </div>
                    <div class="tweet-image my-2">${e.photo}</div>
                    <hr/>
                    <div class="buttons d-flex justify-content-between">
                        <button class="btn btn-primary btn-approved" onclick="updateStatus('${e.id}','approved')">Approve</button>
                        <button class="btn btn-danger btn-rejected" onclick="updateStatus('${e.id}','rejected')">Reject</button>
                        <button class="btn btn-outline-secondary btn-pending"  onclick="updateStatus('${e.id}','pending')">Put Back to Pending</button>
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

/*****************************************************************
 * Login Page
 */
function login() {
    $('.alert').removeClass('d-block');
    var email = $('[name=email]').val().trim();
    var password = $('[name=password]').val().trim();
    $.post('/login', {
        email: email,
        password: password
    }, function (resp) {
        if (resp != 'ok') {
            $(`.${resp}`).addClass('d-block');
        } else {
            document.location.href = '/dashboard';
        }
    });
    return false;
}

function register() {
    $('.alert').removeClass('d-block');
    var email = $('#register-form [name=email]').val().trim();
    var password = $('#register-form [name=password]').val();
    var confirm_password = $('#register-form [name="confirm-password"]').val();
    if (password != confirm_password) {
        $('.mismatch').addClass('d-block');
        return false;
    }
    $.post('/register', {
        email: email,
        password: password
    }, function (resp) {
        if (resp != 'ok') {
            $('.alert').removeClass('d-block');
            $(`.${resp}`).addClass('d-block');
        } else {
            document.location.href = '/dashboard';
        }
    });
    return false;

}

/*****************************************************************
 * Program page
 */

function showNewProgramForm(btn) {

    $(btn).addClass('d-none').removeClass('d-block');
    $('#new-program').removeClass('d-none');
}

function createProgram() {
    $.post('/admin-api/create-program', {
        'program-name': $('#program-name').val().trim()
    }, function (resp) {
        document.location.href = resp;
    });
    return false;
}

function saveProgramSettings() {
    var data = {};
    for (let f of ['name', 'html', 'js', 'css', 'max_active']) {
        data[f] = $('#' + f).val();
    }
    data.auto_approve = $('#auto_approve').prop('checked') ? 1 : '';
    $.post(`/admin-api/program-settings?pid=${getParam('pid')}`, data, function (resp) {});
    return false;
}
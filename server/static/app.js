$('.container').masonry({
    gutter: 20
});

$('.container').imagesLoaded().progress(function () {
    $('.container').masonry('layout');
});

function approve(id) {
    $.post('/change-status', {
        id: id,
        status: 'approved'
    }, function (data) {
        $('#entry-' + id).detach();
        $('.container').masonry('layout');
    });
}

function reject(id) {
    $.post('/change-status', {
        id: id,
        status: 'rejected'
    }, function (data) {
        $('#entry-' + id).detach();
        $('.container').masonry('layout');
    });
}
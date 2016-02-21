function showError(input, messageBar) {
    $(input).addClass('error');
    messageBar.animate({
        left: 'toggle'
    }, 400);
}

function hideError(input) {
    $(input).removeClass('error');
    $(input).siblings('div.error').animate({
        left: 'toggle'
    }, 200, function () {
        $(this).remove();
    });
}

window.onload = function () {
    $('.form:has(.error)').each(function () {
        showError($(this).find('.textfield'), $(this).find('.error').hide());
    });
    $('.textfield').each(function () {
        $(this).blur(function() {
            hideError(this);
        });
    });
}
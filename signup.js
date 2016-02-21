var timer = {};
function delayTillLast(id, fn, wait) {
    if (timer[id]) {
        window.clearTimeout(timer[id]);
        delete timer[id];
    }
    return timer[id] = window.setTimeout(function () {
        fn();
        delete timer[id];
    }, wait);
}

function inputCheck(input) {
    for (var checkCase in checkCases[input.name]) {
        if (!checkCases[input.name][checkCase](input.value)) {
            showError(input, checkCase);
            return;
        }
    }
    // post to check database here
    if (input.name != 'pwd' && input.name != 'rpwd') {
        $.post('/dataCheck', input.name + '=' + input.value, function (data) {
            if (data) {
                showError(input, data);
            } else {
                showPass(input);
                checkAllValid();
            }
        });
    } else {
        showPass(input);
        checkAllValid();
    }
}

function showError(input, message) {
    var messageBar;
    $(input).removeClass("pass").addClass('error');
    $(input).after(messageBar = $('<div />', {
        class: "error"
    }).text(message).hide());
    messageBar.animate({
        left: 'toggle'
    }, 400)
}

function showPass(input) {
    $(input).removeClass('error').addClass("pass");
}

function hideAllMessage(input) {
    $(input).removeClass('error pass');
    $(input).siblings('div.error').animate({
        left: 'toggle'
    }, 200, function () {
        $(this).remove();
    });
}

// 700ms后检查输入是否合法
// 如果在时间内再次改变会覆盖之前的定时
function setTimerTocheck(input) {
    hideAllMessage(input);
    delayTillLast(input.name, function () {
        if (input.value) {
            inputCheck(input);
        }
    }, 700);
}

function checkAllValid() {
    var flag = true;
    $('.textfield').each(function () {
        if (!$(this).hasClass('pass')) flag = false;
    });
    if (flag) {
        $('#submit').removeAttr("disabled");
    } else {
        $('#submit').attr("disabled", "disabled");
    }
}

window.onload = function () {
    $('.textfield').each(function () {
        var that = this;
        this.oninput = function () {
            setTimerTocheck(this);
        };
    });
    $('#reset').click(function () {
        $('.textfield').each(function () {
            hideAllMessage(this);
        })
    });
}
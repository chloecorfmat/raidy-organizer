// Code of each color picker is added automatically.
// This file is used to set the background of each buttons.

window.addEventListener('load', function() {
    var colorBtns = document.getElementsByClassName('btn-color');

    for (var btn of colorBtns) {
        btn.style.backgroundColor = btn.dataset.color;
    }
});

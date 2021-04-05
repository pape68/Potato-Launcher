const fs = require('fs');

function createOverlay(content, onConfirm, ...onConfirmArgs){
    if (!document.getElementById('overlayStyle')) document.head.innerHTML += '<style id="overlayStyle">' + fs.readFileSync(__dirname+'/../../assets/style/overlay.css').toString() + '</style>';
    document.body.innerHTML += '<div id="overlay">'+content
        +'<img id="overlayConfirm" style="cursor: pointer" src="../../assets/img/emojis/white_check_mark.png" alt="confirm">'
        +'<img id="overlayDeny" style="cursor: pointer" src="../../assets/img/emojis/x.png" onclick="document.getElementById(\'overlay\').remove()" alt="deny">'
        +'</div>';
    document.getElementById('overlayConfirm').onclick = () => {
        onConfirm(...onConfirmArgs);
        document.getElementById('overlay').remove();
    };
}

function createInfoOverlay(content){
    if (!document.getElementById('overlayStyle')) document.head.innerHTML += '<style id="overlayStyle">' + fs.readFileSync(__dirname+'/../../assets/style/overlay.css').toString() + '</style>';
    document.body.innerHTML += '<div id="overlay">'+content
        +'<img id="overlayClose" style="cursor: pointer" src="../../assets/img/emojis/x.png" onclick="document.getElementById(\'overlay\').remove()" alt="deny">'
        +'</div>';
}

window.createOverlay = createOverlay;
window.createInfoOverlay = createInfoOverlay;
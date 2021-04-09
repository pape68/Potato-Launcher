const fs = require('fs');

document.head.innerHTML += '<style id="overlayStyle">' + fs.readFileSync(__dirname+'/../../assets/style/overlay.css').toString() + '</style>';

function createOverlay(content, onConfirm, ...onConfirmArgs){
    document.body.innerHTML += '<div id="overlay">'+content
        +'<img id="overlayConfirm" style="cursor: pointer" src="../../assets/img/emojis/white_check_mark.png" alt="confirm">'
        +'<img id="overlayDeny" style="cursor: pointer" src="../../assets/img/emojis/x.png" onclick="document.getElementById(\'overlay\').remove()" alt="deny">'
        +'</div>';
    document.getElementById('overlayConfirm').onclick = () => {
        //idc im done with it not working :KEKW:
        //for br shop only
        if (document.getElementById('giftTo')) window.giftTo = document.getElementById('giftTo').value;
        if (document.getElementById('message')) window.message = document.getElementById('message').value;

        //for manage heroes
        if (document.getElementById('tier')) window.tier = document.getElementById('tier').value;
        if (document.getElementById('level')) window.level = document.getElementById('level').value;

        onConfirm(...onConfirmArgs);
        document.getElementById('overlay').remove();
    };
}

function createInfoOverlay(content){
    document.body.innerHTML += '<div id="overlay">'+content
        +'<img id="overlayClose" style="cursor: pointer" src="../../assets/img/emojis/x.png" onclick="document.getElementById(\'overlay\').remove()" alt="deny">'
        +'</div>';
}

window.createOverlay = createOverlay;
window.createInfoOverlay = createInfoOverlay;
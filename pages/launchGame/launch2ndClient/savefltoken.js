const fs = require('fs');


window.onload = () => {
    if (fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/fltoken.txt')) document.getElementById('input').value = fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/fltoken.txt').toString();
}

function setfltoken(){
    const input = document.getElementById('input').value;
    fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/fltoken.txt', input);
    document.getElementById('output').innerHTML = 'fltoken successfully set.';
}

window.setfltoken = setfltoken;
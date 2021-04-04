const fs = require('fs');

window.onload = () => {
    if (fs.existsSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt')) document.getElementById('input').value = fs.readFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt').toString();
}

function setFnPath(){
    const input = document.getElementById('input').value;
    if (!fs.existsSync(input)) return document.getElementById('output').innerHTML = 'Could not find that path.';
    fs.writeFileSync(process.env.appdata+'/a.bakedpotato/fnappv2/path.txt', input);
    document.getElementById('output').innerHTML = 'Path successfully set.';
}

window.setFnPath = setFnPath;
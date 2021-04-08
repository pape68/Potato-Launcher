import { axios } from './requests.js';

const thisTag = '2.1.0'.split('.').map(i => parseInt(i));

function output(text){
    document.getElementById('update').innerHTML = text;
}

axios.get('https://api.github.com/repos/a-bakedpotato/Potato-Launcher-Dist/releases').then(versions => {
    let latestTag = versions[0]?.tag_name?.substr(1).split('.').map(i => parseInt(i)) ?? thisTag;
    console.log(latestTag);
    if (thisTag === latestTag || !latestTag) return null;

    let i = -1;
    if (thisTag[0] < latestTag[0]) i += 1;
    else if (thisTag[0] === latestTag[0] && thisTag[1] < latestTag[1]) i += 2;
    else if (thisTag[0] === latestTag[0] && thisTag[1] === latestTag[1] && thisTag[2] < latestTag[2]) i += 3;

    switch(i){
        case 0:
            output('New major version available. You can download the new version at <a href="'+versions[0].assets[0].browser_download_url+'">this link</a>.');
            break;
        case 1:
            output('New minor version available. You can download the new version at <a href="'+versions[0].assets[0].browser_download_url+'">this link</a>.');
            break;
        case 2:
            output('New bug fixes available. You can download the new version at <a href="'+versions[0].assets[0].browser_download_url+'">this link</a>.');
            break;
    }
});
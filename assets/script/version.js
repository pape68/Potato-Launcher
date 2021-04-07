import { axios } from './requests.js';

const thisTag = '2.0.0'.split('.');

function output(text){
    document.getElementById('update').innerHTML = text;
}

axios.get('https://api.github.com/repos/a-bakedpotato/Potato-Launcher-Dist/releases').then(versions => {
    let latestTag = versions[0]?.tag_name?.split('.') ?? thisTag;
    if (thisTag === latestTag || !latestTag) return null;

    let i = 0;
    for (i; thisTag[i] !== latestTag[i]; i++){}

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
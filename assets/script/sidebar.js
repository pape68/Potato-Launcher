window.onload = () => {
    const fs = require('fs');

    const pages = fs.readdirSync('./pages');

    document.head.innerHTML += '<style>' + fs.readFileSync('./assets/style/sidebar.css').toString() + '</style>';

    document.body.innerHTML = '<div id="left">' + pages.map(page => {
        let info = JSON.parse(fs.readFileSync('./pages/' + page + '/info.json').toString());

        let path = window.location.pathname;
        let thisPage = path.split('/').pop().split('.')[0];

        if (page === thisPage) return '<a id="selected">'+info.title+'</a>';
        let relPath = '../';
        if (thisPage === 'index') relPath = 'pages/';
        return '<a href="' + relPath + page + '/' + page + '.html">' + info.title + '</a>';
    }).join('') + '</div><div id="right">' + document.body.innerHTML + '</div>';
}
window.onload = () => {
    const fs = require('fs');

	let path = window.location.pathname;
	let thisPage = path.split('/').pop().split('.')[0];
	let relPath = __dirname+'/../../pages/';
	if (thisPage === 'index') relPath = __dirname+'/pages/';

    const pages = fs.readdirSync(relPath);

    document.head.innerHTML += '<style>' + fs.readFileSync(relPath+'../assets/style/sidebar.css').toString() + '</style>';

    document.body.innerHTML = '<div id="left">' + pages.map(page => {
        let info = JSON.parse(fs.readFileSync(relPath + page + '/info.json').toString());

        if (page === thisPage) return '<a id="selected">'+info.title+'</a>';
        return '<a href="' + relPath + page + '/' + page + '.html">' + info.title + '</a>';
    }).join('') + '</div><div id="right">' + document.body.innerHTML + '</div>';
}
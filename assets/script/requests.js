function request(options){
    return new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open((options.method || 'GET'), options.url);

        for (const [header, value] of Object.entries(options.headers)){
            request.setRequestHeader(header, value.toString());
        }

        request.send(options.body ? options.body:'{}');
        request.onreadystatechange = () => {
            if (request.readyState !== 4) return;
            resolve(JSON.parse(request.response));
        }
    });
}

function get(url, headers) {
    return new Promise(async resolve => {
        let r = await request({
            url: url,
            headers: headers,
            method: 'GET'
        });
        resolve(r);
    });
}

function post(url, payload = '{}', headers = {}){
    return new Promise(async resolve => {
        let r = await request({
            url: url,
            headers: headers,
            body: payload,
            method: 'POST'
        });
        resolve(r);
    });
}

export const axios = {
    get: get,
    post: post
};
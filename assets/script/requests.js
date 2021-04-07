function request(options){
    return new Promise(async resolve => {
        let request = new XMLHttpRequest();
        request.open((options.method || 'GET'), options.url);

        for (const [header, value] of Object.entries(options.headers)){
            request.setRequestHeader(header, value.toString());
        }

        request.send(options.body ? options.body:'{}');
        request.onreadystatechange = () => {
            if (request.readyState !== 4) return;
            if (request.response) return resolve(JSON.parse(request.response));
            resolve();
        }
    });
}

function deleteRequest(url, headers){
    return new Promise(async resolve => {
        let r = await request({
            url: url,
            headers: headers,
            method: 'DELETE'
        });
        resolve(r);
    });
}

function get(url, headers) {
    return new Promise(async resolve => {
        let r = await request({
            url: url,
            headers: headers || {},
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
    delete: deleteRequest,
    get: get,
    post: post
};

export const iosBasic = 'MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=';
export const switchBasic = 'NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3=';
var date_request_format = "YYYY[-]MM[-]DD";

function loadData(from, to, limit) {
    f = from.format(date_request_format);
    t = to.format(date_request_format);

    return new Promise(function(resolve, reject) {

        d3.request("https://bardiff.com/api/data?from=" + f + "&to=" + t + "&limit=" + limit, function(data) {
            resolve(JSON.parse(data.response));
        });
    });
}

function cache_data(from, to, limit, data) {
    localStorage.setItem(from + to + limit, JSON.stringify(data));
}

function checkStorage(from, to, limit) {
    return new Promise(function(resolve, reject) {
        if (localStorage.getItem(from + to + limit)) {
            resolve(JSON.parse(localStorage.getItem(from + to + limit)));
        };
    });
}

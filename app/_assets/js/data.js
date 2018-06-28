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
    try {
        localStorage.setItem(from + to + limit, JSON.stringify(data));
    } catch (e) {
        if (isQuotaExceeded(e)) {
            localStorage.clear();
        }
    }
}

function checkStorage(from, to, limit) {
    return new Promise(function(resolve, reject) {
        if (localStorage.getItem(from + to + limit)) {
            resolve(JSON.parse(localStorage.getItem(from + to + limit)));
        };
    });
}

function isQuotaExceeded(e) {
    var quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014:
                    // Firefox
                    if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        quotaExceeded = true;
                    }
                    break;
            }
        }
    }
    return quotaExceeded;
}

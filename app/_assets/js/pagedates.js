function PageDates() {

    const MIN_DATE = moment.utc('2015-04-07');
    const TODAY = moment.utc();

    var from_date = moment.utc()
        .startOf('week')
    var to_date = moment.utc()
        .startOf('week')
        .add(6, 'd');

    var small_format = "YYYY-MM-DD";
    var large_format = "ddd Do MMM YYYY";

    var updateDates = function() {};

    var listeners = [];

    function page() {

        var params = new URLSearchParams(location.search);
        if (params.has('to')) {
            to_date = moment.utc(params.get('to'));
        }
        if (params.has('from')) {
            from_date = moment.utc(params.get('from'));
        }

        updateDates = function() {

            var params = new URLSearchParams(location.search);

            d3.select('.dates')
                .select('#from-date')
                .html(from_date.format(large_format) + "<br>");

            d3.select('.dates')
                .select('#to-date')
                .html("<br>" + to_date.format(large_format));

            params.set('from', from_date.format(small_format));
            params.set('to', to_date.format(small_format));
            window.history.replaceState({}, '', location.pathname + '?' + params.toString());

            listeners.forEach(function(l) {
                l(from_date, to_date);
            })
        }

        updateDates();
    }

    page.addDateChangeListener = function(listener) {
        if (typeof listener === 'function') {
            listeners.push(listener);
        }
    }

    page.canGoBack = function() {
        return from_date.isAfter(MIN_DATE, 'day');
    }

    page.canGoForward = function() {
        return to_date.isBefore(TODAY, 'day');
    }

    page.back = function() {
        if (!from_date.isSame(MIN_DATE, 'day')) {
            to_date.subtract(7, 'd');
            from_date = moment(to_date)
                .subtract(7, 'd');
            if (from_date.isBefore(MIN_DATE, 'day')) {
                from_date = moment(MIN_DATE);
            }
        }
        if (typeof updateDates === 'function') updateDates();
        return page;
    }

    page.forward = function() {
        if (!to_date.isSame(TODAY, 'day')) {
            from_date.add(7, 'd');
            to_date = moment(from_date)
                .add(7, 'd');
            if (to_date.isAfter(TODAY, 'day')) {
                to_date = moment(TODAY);
            }
        }
        if (typeof updateDates === 'function') updateDates();
        return page;
    }

    page.thisweek = function() {
        to_date = moment(TODAY);
        from_date = moment(TODAY)
            .subtract(7, 'd');
        if (typeof updateDates === 'function') updateDates();
    }

    page.from = function(_) {
        if (!arguments.length) return from_date;
        from_date = _;
        if (typeof updateDates === 'function') updateDates();
        return page;
    }

    page.to = function(_) {
        if (!arguments.length) return to_date;
        to_date = _;
        if (typeof updateDates === 'function') updateDates();
        return page;
    }

    return page;

}

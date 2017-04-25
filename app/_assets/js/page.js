var page = function() {
    var page = PageDates();

    page.hideLoader = function() {
        d3.select('.overlay')
            .style('display', 'none');
    }

    page.showLoader = function() {
        d3.select('.overlay')
            .style('position', 'fixed')
            .style('top', (window.pageYOffset || document.documentElement.scrollTop) - 16)
            .style('left', 0)
            .style('display', null);
    }

    page.setInputState = function() {
        var prev_button = d3.select('#previous');
        var next_button = d3.select('#next');
        if (page.canGoBack()) {
            prev_button.property('disabled', false);
        } else {
            prev_button.property('disabled', true);
        }
        if (page.canGoForward()) {
            next_button.property('disabled', false);
        } else {
            next_button.property('disabled', true);
        }
    }

    d3.select('#previous')
        .on('click', function(d) {
            page.back();
            page.setInputState();
        });

    d3.select('#next')
        .on('click', function(d) {
            page.forward();
            page.setInputState();
        });

    return page;
}();

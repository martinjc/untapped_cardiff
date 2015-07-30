(function(){

    function WeekHandler() {
        this.earliest_date = new Date("2015-04-04");

        this.current_week = {
            start: new Date(),
            today: new Date(),
            end: new Date()
        };

        this.current_week.start = new Date();
        this.current_week.start.setDate(this.current_week.today.getDate() - this.current_week.today.getDay());
        this.current_week.end = new Date(this.current_week.start);
        this.current_week.end.setDate(this.current_week.start.getDate() + 7);
    }

    WeekHandler.prototype.can_page_back = function() {
        var new_end = new Date(this.current_week.start);
        var new_start = new Date(new_end);
        new_start.setDate(new_end.getDate() - 7);
        if(new_start > this.earliest_date) {
            return true;
        } else {
            return false;
        }
    };

    WeekHandler.prototype.page_back = function(){
        if(this.can_page_back()) {
            var new_end = new Date(this.current_week.start);
            var new_start = new Date(new_end);
            new_start.setDate(new_end.getDate() - 7);
            this.current_week.end = new_end;
            this.current_week.start = new_start;           
        }
    };

    WeekHandler.prototype.can_page_forward = function() {
        if(this.current_week.end < this.current_week.today) {
            return true;
        } else {
            return false;
        }
    };

    WeekHandler.prototype.page_forward = function() {
        if(this.can_page_forward()) {
            var new_start = new Date(this.current_week.end);
            var new_end = new Date(new_start);
            new_end.setDate(new_start.getDate() + 7);
            this.current_week.end = new_end;
            this.current_week.start = new_start;            
        }
    };

    WeekHandler.prototype.get_query_string = function() {
        var start = this.current_week.start;
        var end = this.current_week.end;
        var start_string = "" + start.getFullYear() + "-" + (start.getMonth()+1) + "-" + start.getDate();
        var end_string = "" + end.getFullYear() + "-" + (end.getMonth()+1) + "-" + end.getDate();
        var query_string = "?from=" + start_string + "&to=" + end_string;
        return query_string;
    };

    this.WeekHandler = WeekHandler;

}());
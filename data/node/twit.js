var Twitter = require("twitter");

var chart = require('./chart');
var credentials = require('./_credentials');

var url = "http://bardiff.martinjc.com/";

var client = new Twitter({
  consumer_key: credentials.twitter.client_id,
  consumer_secret: credentials.twitter.client_secret,
  access_token_key: credentials.twitter.access_token,
  access_token_secret: credentials.twitter.access_secret
});

this_week = chart.get_week();
var chart_url = url + this_week.get_query_string()

var do_chart_tweets = function(){

    chart.do_chart("venue", this_week.start, this_week.end, function(err, data){
        for(var i in data) {
            if(data[i].contact.twitter) {
                var twitter_handle = '';
                if(data[i].contact.twitter.indexOf('@') === -1) {
                    twitter_handle = '@' + data[i].contact.twitter;
                } else {
                    twitter_handle = data[i].contact.twitter;
                }
                tweet_string = "congrats " + twitter_handle + " - you were the #" + (+i+1) + " venue in/near Cardiff last week according to untappd users! " + chart_url;
                console.log(tweet_string);
                params = {status: tweet_string}
                client.post('statuses/update', params, function(error, tweet, response){
                    if(error) {
                        console.error(error);
                    }
                });
            }
        }
    });

    chart.do_chart("brewery", this_week.start, this_week.end, function(err, data){
        for(var i in data) {
            if(data[i].contact.twitter) {
                var twitter_handle = '';
                if(data[i].contact.twitter.indexOf('@') === -1) {
                    twitter_handle = '@' + data[i].contact.twitter;
                } else {
                    twitter_handle = data[i].contact.twitter;
                }
                tweet_string = "congrats " + twitter_handle + " - you were the #" + (+i+1) + " brewery in/near Cardiff last week according to untappd users! " + chart_url;
                console.log(tweet_string);
                params = {status: tweet_string}
                client.post('statuses/update', params, function(error, tweet, response){
                    if(error) {
                        console.error(error);
                    }
                });
            }
        }
    });
}

module.exports.do_chart_tweets = do_chart_tweets;





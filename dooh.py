from flask import Flask, render_template, request
import twitter
import uuid
import os
import json

flapp = Flask('twitter-dooh')
flapp.jinja_env.globals['random'] = lambda: uuid.uuid4().hex

selected_tweets = []
api = twitter.Api(**json.load(open('secrets.json')))


def load_selected_tweets():
    if not os.path.exists('tweets.json'):
        with open('tweets.json', 'w') as fh:
            fh.write('')
    else:
        with open('tweets.json') as fh:
            global selected_tweets
            selected_tweets = [tid for tid in fh.read().split(',') if len(tid) > 5]


def save_selected_tweets():
    with open('tweets.json', 'w') as fh:
        fh.write(','.join(selected_tweets))


@flapp.route('/search-tweets', methods=["POST"])
def search_tweets():
    data = api.GetSearch(request.form["term"], count=20)
    return ','.join([e.id_str for e in data])


@flapp.route('/selected-tweets')
def get_selected_tweets():
    load_selected_tweets()
    return ','.join(selected_tweets)


@flapp.route('/add-tweet/<tid>')
def add_tweet(tid):
    try:
        selected_tweets.remove(tid)
    except ValueError:
        pass
    selected_tweets.append(tid)
    save_selected_tweets()
    return 'ok'


@flapp.route('/remove-tweet/<tid>')
def remove_tweet(tid):
    try:
        selected_tweets.remove(tid)
    except ValueError:
        pass
    save_selected_tweets()
    return 'ok'


@flapp.route('/pick')
def pick_tweets():
    load_selected_tweets()
    return render_template('pick.html')


@flapp.route('/')
def screen():
    return render_template('screen.html')


if __name__ == '__main__':
    flapp.run(port=8080, debug=True)

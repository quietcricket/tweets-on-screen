from models import Tweet, init_db
import time
import json
import base64
import requests
import dooh_utils

credentials = json.load(open('.credentials'))


def get_token():
    endpoint = 'https://api.twitter.com/oauth2/token'
    req = requests.post(endpoint, data={'grant_type': 'client_credentials'}, auth=(credentials['key'], credentials['secret']))
    credentials['token'] = req.json()['access_token']
    json.dump(credentials, open('.credentials', 'w'), indent=2)


def fetch_tweet():
    """
    Returns rate limit so the program decides when to call again
    """
    tweets = {str(t.id): t for t in Tweet.select().where(Tweet.raw.is_null()).limit(50)}
    # tweets = {str(t.id): t for t in Tweet.select().limit(50)}
    if not tweets:
        return (900, 0)
    req = requests.get('https://api.twitter.com/labs/1/tweets',
                       params={'ids': ','.join(tweets.keys()), 'expansions': 'author_id,attachments.media_keys', 'format': 'detailed'},
                       headers={'Authorization': 'Bearer '+credentials['token']})
    resp = req.json()
    print(json.dumps(resp, indent=2))
    if resp.get('data'):
        users = {user['id']: user for user in resp['includes']['users']}
        medias = {media['media_key']: media for media in resp['includes'].get('media', [])}
        for data in resp.get('data', []):
            t = tweets[data['id']]
            t.parse_json(data, users, medias)
            t.save()

    return int(req.headers['x-rate-limit-remaining']), int(req.headers['x-rate-limit-reset'])


if __name__ == "__main__":
    init_db()

    if credentials.get('token') is not None:
        get_token()
    while True:
        fetch_tweet()
        time.sleep(1)

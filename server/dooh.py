import json
from uuid import uuid4
from flask import Flask, request, jsonify, render_template
from models import init_db, TweetEntry
import pprint
app = Flask('dooh-app')
app.jinja_env.globals['random'] = lambda: uuid4().hex
app.jinja_env.autoreload = True


@app.route('/spotify')
def spotify():
    return render_template('spotify.html', entries=TweetEntry.select())


@app.route('/feature', methods=['GET', 'POST'])
def ajax_feature():
    obj = json.loads(request.form['data'])
    if obj.get('images'):
        obj['image'] = obj['images'][0]
        obj['images'] = ','.join(obj['images'])
    resp = jsonify({'id': TweetEntry.replace(**obj).execute()})
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@app.route('/status', methods=['POST'])
def ajax_status():
    results = {}
    for t in TweetEntry.select(TweetEntry.hash, TweetEntry.status).where(TweetEntry.hash.in_(json.loads(request.form['data']))):
        results[t.hash] = t.status
    resp = jsonify(results)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@app.route('/list/<string:status>')
def list_entries(status):
    return render_template('list-entries.html', entries=TweetEntry.select().where(TweetEntry.status == status).order_by(TweetEntry.id.desc()))


@app.route('/change-status', methods=['POST'])
def change_status():
    entry = TweetEntry.get_by_id(int(request.form['id']))
    print(entry)
    if not entry:
        return jsonify(result='not found')
    entry.status = request.form['status']
    entry.save()
    return jsonify(result='ok')


if __name__ == "__main__":
    init_db()
    app.run(port=8080, debug=True)

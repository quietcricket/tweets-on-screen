import json
from uuid import uuid4
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_assets import Environment
from models import *
import pprint
app = Flask('dooh-app')
app.jinja_env.autoreload = True
Environment(app)


@app.route('/spotify')
def spotify():
    return render_template('spotify.html')


@app.route('/')
def list_entries():
    return render_template('list-entries.html')


@app.route('/admin-api/get-entries/<string:status>')
def get_entries(status):
    entries = TweetEntry.select().where(
        TweetEntry.status == getattr(TweetStatus, status.upper())).order_by(TweetEntry.position.desc(), TweetEntry.id.desc())
    resp = jsonify([e.to_dict() for e in entries])
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@app.route('/admin-api/change-status', methods=['POST'])
def change_status():
    entry = TweetEntry.get_by_id(request.form['id'])
    if not entry:
        return jsonify(result='not found')
    entry.status = request.form['status']
    entry.save()
    return jsonify(result='ok')


@app.route('/extension-api/add', methods=['POST'])
def extension_ad_pending():
    obj = json.loads(request.form['data'])
    if obj.get('images'):
        obj['images'] = ','.join(obj['images'])
    print(obj)
    resp = jsonify({'id': TweetEntry.replace(**obj).execute()})
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@app.route('/extension-api/status', methods=['POST'])
def extension_get_status():
    results = {}
    for t in TweetEntry.select(TweetEntry.hash_id, TweetEntry.status).where(TweetEntry.hash_id.in_(json.loads(request.form['data']))):
        results[t.hash_id] = t.status
    resp = jsonify(results)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


if __name__ == "__main__":
    init_db()
    app.run(port=8080, debug=True)

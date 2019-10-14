import json
from uuid import uuid4
from datetime import datetime
from flask import Flask, request, jsonify, render_template, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_required, login_user, current_user
from flask_assets import Environment
from models import *
import pprint
app = Flask('dooh-app')
app.jinja_env.autoreload = True
app.config['SECRET_KEY'] = 'fc0c03ea56ce406c84ad75ad6deb45ee'
Environment(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    email = request.form['email'].lower()
    password = request.form['password']
    u = User.select().where(User.email == email).first()
    if u is None:
        return 'email'

    if not check_password_hash(u.password, password):
        return 'password'

    login_user(u)
    return 'ok'


@app.route('/register', methods=['POST'])
def register():
    email = request.form['email'].lower()
    password = request.form['password']
    if User.select().where(User.email == email).exists():
        return 'duplicate'
    u = User(email=email, password=generate_password_hash(password))
    u.save()
    login_user(u)
    return 'ok'


@app.route('/dashboard')
@login_required
def dashboard():
    programs = Program.select().join(ProgramUser, on=(Program.id == ProgramUser.program_id)).where(ProgramUser.user_id == current_user.id)
    return render_template('dashboard.html', programs=programs)


@app.route('/program-settings/<int:pid>')
@login_required
def program_settings(pid):
    return render_template('program-settings.html', program=Program.get_by_id(pid))


@app.route('/admin-api/create-program', methods=['POST'])
@login_required
def create_program(program_name=None):
    p = current_user.create_program(program_name or request.form['program-name'])
    return url_for('program_settings', pid=p.id)


@app.route('/admin-api/save-program-settings')
def save_program_settings():
    pass


@app.route('/list/<string:program_id>')
def list_entries(program_id):
    return render_template('list-entries.html')


@app.route('/admin-api/get-entries')
def get_entries():
    entries = TweetEntry.select().where(
        TweetEntry.status == getattr(TweetStatus, request.args['status'].upper()),
        TweetEntry.program_id == request.args.get('program_id', -1, int)).order_by(TweetEntry.position.desc(), TweetEntry.id.desc())
    resp = jsonify([e.to_dict() for e in entries])
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@app.route('/admin-api/change-status', methods=['POST'])
def change_status():
    entry = TweetEntry.get_by_id(request.form['id'])
    if not entry:
        return jsonify(result='not found')
    entry.status = getattr(TweetStatus, request.form['status'].upper())
    entry.save()
    return jsonify(result='ok')


@app.route('/extension-api/add', methods=['POST'])
def extension_ad_pending():

    obj = json.loads(request.form['data'])
    api_key = obj['api_key']
    api_secret = obj['api_secret']

    # TODO: check access credientials
    del obj['api_key']
    del obj['api_secret']

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

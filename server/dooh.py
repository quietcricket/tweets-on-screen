import json
import pprint
from datetime import datetime
from uuid import uuid4

from flask import Flask, jsonify, redirect, render_template, render_template_string, request, url_for
from flask_assets import Environment
from flask_login import LoginManager, current_user, login_required, login_user
from werkzeug.security import check_password_hash, generate_password_hash

from dooh_utils import make_response, get_program
from models import *


app = Flask('dooh-app')
app.jinja_env.autoreload = True
app.config['SECRET_KEY'] = 'fc0c03ea56ce406c84ad75ad6deb45ee'
Environment(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.select().where(User.id == user_id).first()


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
    u = User.create(email=email, password=generate_password_hash(password))
    login_user(u)
    return 'ok'


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', programs=current_user.programs)


@app.route('/program-settings')
@login_required
def program_settings():
    pid = request.args['pid']
    return render_template('program-settings.html', p=Program.select().where(Program.id == pid).first())


@app.route('/moderation')
def moderate_tweets():
    return render_template('moderation.html')


@app.route('/display')
def display_program():
    p = Program.select().where(Program.id == request.args['pid']).first()
    return render_template_string(p.html, program=p)


@app.route('/display-entries')
def display_entries():
    entries = Tweet.select().where(
        Tweet.status == getattr(TweetStatus, 'APPROVED'),
        Tweet.raw.is_null() == False,
        Tweet.program_id == request.args['pid']).order_by(Tweet.position.desc(), Tweet.id.desc())
    resp = jsonify([e.to_dict() for e in entries])
    return resp


@app.route('/admin-api/create-program', methods=['POST'])
@login_required
def create_program(program_name=None):
    p = Program.create_by_user(current_user, program_name or request.form['program-name'])
    return url_for('program_settings', pid=p.id)


@app.route('/admin-api/program-settings', methods=['POST'])
def save_program_settings():
    p = Program.get_by_id(request.args['pid'])
    for k, v in request.form.items():
        setattr(p, k, v)
    p.save()
    return 'ok'


@app.route('/admin-api/program-image/', methods=['POST', 'PUT', 'DELETE'])
def upload_program_image(pid):
    """
    Upload by POST
    Reorder by PUT
    Remove by DELETE
    """
    pass


@app.route('/admin-api/get-entries')
def get_entries():
    entries = Tweet.select().where(
        Tweet.status == getattr(TweetStatus, request.args['status'].upper()),
        Tweet.raw.is_null() == False,
        Tweet.program_id == request.args['pid']).order_by(Tweet.position.desc(), Tweet.id.desc())
    resp = jsonify([e.to_dict() for e in entries])
    return resp


@app.route('/admin-api/change-status', methods=['POST'])
def change_status():
    entry = Tweet.get_by_id(int(request.form['id']))
    if not entry:
        return jsonify(result='not found')
    entry.status = getattr(TweetStatus, request.form['status'].upper())
    entry.save()
    return jsonify(result='ok')


@app.route('/extension-api/add', methods=['POST'])
def extension_add_entry():
    obj = json.loads(request.get_data())
    p = get_program(obj['key'], obj['secret'])
    # TODO: testing cheat code
    p = Program.select().first()
    if not p:
        return make_response({'error': 'Invalid key or secret'}, 403)
    tid = int(obj['tid'])
    t = Tweet.select().where(Tweet.id == tid).first()
    if not t:
        t = Tweet.create(id=tid, program=p, status=TweetStatus.APPROVED if p.auto_approve else TweetStatus.PENDING)
    return make_response({'id': tid, 'status': t.status})


@app.route('/extension-api/status', methods=['POST'])
def extension_get_status():
    results = {}
    for t in Tweet.select(Tweet.id, Tweet.status).where(Tweet.id.in_(json.loads(request.form['data']))):
        results[t.id] = t.status
    return make_response(results)


@app.route('/extension-api/validate-key', methods=['POST'])
def validate_key():
    p = get_program(request.form['key'], request.form['secret'])
    return make_response({'name': p.name if p else ''})


@app.route('/extension-api/ping')
def ping_server():
    return make_response({'ok': 1})


if __name__ == "__main__":
    init_db()
    app.run(port=8080, debug=True)

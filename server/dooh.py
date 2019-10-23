import json
import pprint
from datetime import datetime
from uuid import uuid4

from flask import Flask, jsonify, redirect, render_template, request, url_for
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
    programs = Program.select().join(ProgramUser, on=(Program.id == ProgramUser.program_id)
                                     ).where(ProgramUser.user_id == current_user.id)
    return render_template('dashboard.html', programs=programs)


@app.route('/program-settings/<pid>')
@login_required
def program_settings(pid):
    return render_template('program-settings.html', p=Program.select().where(Program.id == pid).first())


@app.route('/moderation/<pid>')
def moderation_page(pid):
    return render_template('moderation.html', p=Program.get_by_id(pid))


@app.route('/admin-api/create-program', methods=['POST'])
@login_required
def create_program(program_name=None):
    p = Program.create_by_user(current_user, program_name or request.form['program-name'])
    return url_for('program_settings', pid=p.id)


@app.route('/admin-api/program-settings<int:pid>', methods=['POST'])
def save_program_settings(pid):
    p = Program.get_by_id(pid)
    for k, v in request.form.items():
        setattr(p, k, v)
    p.save()


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
        Tweet.status == getattr(
            TweetStatus, request.args['status'].upper()),
        Tweet.program_id == request.args.get('program_id', -1, int)).order_by(Tweet.position.desc(), Tweet.id.desc())
    resp = jsonify([e.to_dict() for e in entries])
    return resp


@app.route('/admin-api/change-status', methods=['POST'])
def change_status():
    entry = Tweet.get_by_id(request.form['id'])
    if not entry:
        return jsonify(result='not found')
    entry.status = getattr(TweetStatus, request.form['status'].upper())
    entry.save()
    return jsonify(result='ok')


@app.route('/extension-api/add', methods=['POST'])
def extension_add_entry():
    obj = json.loads(request.get_data())
    p = get_program(obj['key'], obj['secret'])
    p = Program.select().first()
    if not p:
        return make_response({'error': 'Invalid key or secret'}, 403)

    del obj['key']
    del obj['secret']
    obj['program_id'] = p.id
    obj['id'] = int(obj['id'])
    # TODO: Return message to indicate duplicated entry
    return make_response({'id': Tweet.replace(**obj).execute()})


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

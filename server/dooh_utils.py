from flask import jsonify
from models import Program


def make_response(obj, status_code=200):
    resp = jsonify(**obj)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.status_code = status_code
    return resp


def get_program(key, secret):
    return Program.select(Program.name).where(Program.api_key == key, Program.api_secret == secret).first()

import logging
from enum import IntEnum
from uuid import uuid4
import json
from peewee import *
from flask_login import UserMixin

DB_NAME = 'dooh.sqlite'
db = SqliteDatabase(DB_NAME)

logger = logging.getLogger('peewee')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


class TweetStatus(IntEnum):
    PENDING = 100
    APPROVED = 200
    REJECTED = 400
    DELETED = 500


class UserRole(IntEnum):
    OWNER = 7
    ADMIN = 6
    MODERATOR = 5
    VIEWER = 4


class UserAction(IntEnum):
    SET_PENDING = 1
    SET_APPROVED = 2
    SET_REJECTED = 3
    SET_DELETED = 4
    CHANGE_KEY = 5
    CHANGE_SECRET = 6
    CHANGE_HTML = 7
    CHANGE_JS = 8
    CHANGE_CSS = 9


class User(Model, UserMixin):
    id = FixedCharField(max_length=33, primary_key=True,
                        default=lambda: uuid4().hex)
    email = CharField()
    password = CharField()
    screen_name = CharField(null=True)
    is_active = BooleanField(default=True)

    class Meta:
        database = db

    def create_program(self, program_name):
        p = Program.create(name=program_name)
        ProgramUser.create(program=p, user=self, role=UserRole.OWNER)
        return p


class Program(Model):
    id = FixedCharField(max_length=33, primary_key=True,
                        default=lambda: uuid4().hex)
    secret = CharField(default=lambda: uuid4().hex)
    name = CharField()
    html = TextField(null=True)
    css = TextField(null=True)
    js = TextField(null=True)
    auto_approve = BooleanField(default=False)
    max_active = IntegerField(default=20)
    is_active = BooleanField(default=True)

    class Meta:
        database = db

    def add_image(self, image_uri):
        self.images = self.images+','+image_uri if self.images else image_uri
        self.save()


class ProgramUser(Model):
    program = ForeignKeyField(Program)
    user = ForeignKeyField(User)
    role = IntegerField(default=UserRole.VIEWER)

    class Meta:
        database = db


class ProgramAsset(Model):
    id = FixedCharField(max_length=33, primary_key=True,
                        default=lambda: uuid4().hex)
    filename = CharField()
    program = ForeignKeyField(Program, backref='images')

    class Meta:
        database = db


class Tweet(Model):
    id = BigIntegerField(primary_key=True)
    program = ForeignKeyField(Program, backref='tweets')
    screen_name = CharField()
    name = CharField()
    verified = BooleanField(default=False)
    profile_image = CharField()
    text = TextField(null=True)
    photo = TextField(null=True)
    video = CharField(null=True)
    created_at = DateTimeField()
    raw = TextField()
    position = IntegerField(default=0)
    status = IntegerField(default=TweetStatus.PENDING)

    class Meta:
        database = db

    @classmethod
    def from_json(cls, json_str, program_id):
        obj = json.loads(json_str)
        self.id = int(obj['id_str'])
        fields = ['tweet']

    def to_dict(self):
        fields = ['id', 'name', 'screen_name', 'verified', 'display_name',
                  'profile_image', 'text', 'photo', 'created_at', 'position']
        return {f: getattr(self, f) for f in fields}


class Log(Model):
    id = AutoField()
    user = ForeignKeyField(User)
    program = ForeignKeyField(Program)
    action = IntegerField()

    class Meta:
        database = db


def init_db():
    db.create_tables([Tweet, User, Program,
                      ProgramAsset, ProgramUser, Log])

import logging
from enum import IntEnum
from uuid import uuid4
import json
from peewee import *
from flask_login import UserMixin
from datetime import datetime

DB_NAME = 'dooh.sqlite'
db = SqliteDatabase(DB_NAME)

logger = logging.getLogger('peewee')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.ERROR)


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

    @classmethod
    def create_by_user(cls, user, program_name):
        p = cls.create(name=program_name)
        ProgramUser.create(program=p, user=user, roe=UserRole.OWNER)
        return p

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
    username = CharField(null=True)
    name = CharField(null=True)
    verified = BooleanField(default=False)
    profile_image_url = CharField(null=True)
    text = TextField(null=True)
    # Stores raw medias json
    medias = TextField(null=True)
    # Featured photo, the first photo
    photo = CharField(null=True)
    video = CharField(null=True)
    created_at = DateTimeField(null=True)
    raw = TextField(null=True)
    position = IntegerField(default=0)
    status = IntegerField(default=TweetStatus.PENDING)

    class Meta:
        database = db

    def parse_json(self, data, users_map, medias_map):

        self.text = data['text']
        self.created_at = datetime.strptime(data['created_at'], '%Y-%m-%dT%H:%M:%S.%fZ')

        # Extract user info
        user = users_map[data['author_id']]
        self.username = user['username']
        self.name = user['name']
        self.profile_image_url = user['profile_image_url']
        self.verified = user['verified']

        # Extract medias
        medias = []
        for mid in data.get('attachments', {}).get('media_keys', []):
            media = medias_map[mid]
            medias.append(media)
            if media['type'] == 'photo':
                self.photo = media['url']
            elif media['type'] == 'video':
                self.photo = media['preview_image_url']
            elif media['type'] == 'animated_gif':
                self.photo = media['preview_image_url']
        if medias:
            self.medias = json.dumps(medias, indent=2)

        # Store the raw json response for future use
        self.raw = json.dumps(data, indent=2)
        self.save()

    def to_dict(self):
        fields = ['id', 'name', 'username', 'verified',
                  'profile_image_url', 'text', 'photo', 'video', 'created_at', 'position']
        return {f: str(getattr(self, f) or '') for f in fields}


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

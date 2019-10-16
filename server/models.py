from enum import IntEnum
from uuid import uuid4
from peewee import *
from flask_login import UserMixin

DB_NAME = 'dooh.sqlite'
db = SqliteDatabase(DB_NAME)


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


class TweetEntry(Model):
    id = AutoField()
    program_id = IntegerField()
    hash_id = CharField(unique=True)
    handle = CharField()
    display_name = CharField()
    verified = BooleanField(default=False)
    profile = CharField()
    text = TextField(null=True)
    images = TextField(null=True)
    time_created = DateTimeField()
    position = IntegerField(default=0)
    status = IntegerField(default=TweetStatus.PENDING)

    class Meta:
        database = db

    @property
    def image(self):
        return self.images.split(',')[0] if self.images else None

    def to_dict(self):
        fields = ['id', 'handle', 'verified', 'display_name',
                  'profile', 'text', 'image', 'time_created', 'position']
        return {f: getattr(self, f) for f in fields}


class User(Model, UserMixin):
    id = AutoField()
    handle = CharField(null=True)
    email = CharField(unique=True)
    password = CharField()
    is_active = BooleanField(default=True)

    class Meta:
        database = db

    def create_program(self, program_name):
        p = Program(name=program_name)
        p.save()
        ProgramUser(program_id=p.id, user_id=self.id, role=UserRole.OWNER).save()
        return p


class Program(Model):
    id = AutoField()
    name = CharField()
    api_key = CharField(default=lambda: uuid4().hex)
    api_secret = CharField(default=lambda: uuid4().hex)
    html = TextField(null=True)
    css = TextField(null=True)
    js = TextField(null=True)
    images = TextField(null=True)
    auto_approve = BooleanField(default=False)
    is_active = BooleanField(default=True)

    class Meta:
        database = db

    @property
    def images_list(self):
        return self.images.split(',') if self.images else []

    def add_image(self, image_uri):
        self.images = self.images+','+image_uri if self.images else image_uri
        self.save()


class ProgramUser(Model):
    id = AutoField()
    program_id = IntegerField()
    user_id = IntegerField()
    role = IntegerField(default=UserRole.VIEWER)

    class Meta:
        database = db


class Log(Model):
    id = AutoField()
    user_id = IntegerField()
    program_id = IntegerField()
    action = IntegerField()

    class Meta:
        database = db


def init_db():
    db.create_tables([TweetEntry, User, Program, ProgramUser, Log])

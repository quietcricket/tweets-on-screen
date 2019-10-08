from peewee import *
from enum import IntEnum

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


class TweetEntry(Model):
    id = AutoField()
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


class User(Model):
    id = AutoField()
    handle = CharField()
    email = CharField(unique=True)
    password = CharField()

    class Meta:
        database = db


class Program(Model):
    id = AutoField()
    name = CharField()
    api_key = CharField()
    api_secret = CharField()

    class Meta:
        database = db


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

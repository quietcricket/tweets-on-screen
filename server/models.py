from peewee import *

DB_NAME = 'dooh.sqlite'
db = SqliteDatabase(DB_NAME)


class TweetEntry(Model):
    id = AutoField()
    hash = TextField(unique=True)
    handle = TextField()
    verified = BooleanField(default=False)
    display = TextField()
    profile = TextField()
    text = TextField(null=True)
    image = TextField(null=True)
    images = TextField(null=True)
    time = TextField()
    status = CharField(default='pending')

    class Meta:
        database = db


def init_db():
    db.create_tables([TweetEntry])

import os
import time
from models import *


def reset_db():
    os.popen('rm dooh.sqlite')
    time.sleep(1)
    init_db()


def deploy():
    pass


reset_db()

from PIL import Image
import sys
import os
import shutil
from livereload import Server
from tornado.web import StaticFileHandler


class NoCacheHandler(StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header('Cache-Control', 'no-store')


class LocalServer(Server):
    def get_web_handlers(self, script):
        return [
            (r'/(.*)', NoCacheHandler, {
                'path': self.root or '.',
                'default_filename': 'index.html',
            })]


def resize_icon(filename):
    folder = os.path.dirname(filename)
    img = Image.open(filename)
    for s in [128, 48, 19, 16]:
        img.thumbnail((s, s), Image.ANTIALIAS)
        img.save(f'{folder}/icon{s}.png', 'PNG')


def zip(foldername):
    shutil.make_archive(os.path.expanduser('~/Desktop/'+foldername), 'zip', foldername)


def server(foldername):
    ls = LocalServer()
    ls.watch(f'{foldername}/*.html')
    ls.watch(f'{foldername}/*.js')
    ls.watch(f'{foldername}/*.css')
    ls.serve(8080, root=foldername)


if __name__ == "__main__":
    cmd, param = sys.argv[1:3]
    if cmd == 'resize':
        resize_icon(param)
    elif cmd == 'zip':
        zip(param)
    elif cmd == 'server':
        server(param)

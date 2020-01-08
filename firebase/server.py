import json
from livereload import Server
from tornado.web import RedirectHandler, StaticFileHandler

settings = json.load(open('.firebaserc'))
server_url = 'https://%s.web.app/__/' % settings['projects']['default']


class NoCacheHandler(StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header('Cache-Control', 'no-store')


class FirebaseServer(Server):
    def get_web_handlers(self, script):
        return [
            (r"/__/(.*)", RedirectHandler, {"url": server_url+"{0}"}),
            (r'/(.*)', NoCacheHandler, {
                'path': self.root or '.',
                'default_filename': 'index.html',
            })]


server = FirebaseServer()
server.watch('public/*')
server.watch('public/css/*')
server.watch('public/js/*')
server.serve(8000, root='public')
import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

web_dir = os.path.join(os.path.dirname(__file__), 'public')
os.chdir(web_dir)


class Redirect(SimpleHTTPRequestHandler):
    def do_GET(self):
     #    self.send_response(302)
     #    self.send_header('Location', sys.argv[2])
        # self.end_headers()
        print(self.path)
        if '/__/' in self.path:
            self.send_response(302)
            self.send_header('Location', self.path.replace('/__/', 'https://dooh-on-fire.web.app/__/'))
            self.end_headers()
        else:
            super().do_GET()


HTTPServer(("", 8000), Redirect).serve_forever()

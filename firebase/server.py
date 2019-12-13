import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

web_dir = os.path.join(os.path.dirname(__file__), 'public')
os.chdir(web_dir)


class Redirect(SimpleHTTPRequestHandler):
    def do_GET(self):
        print(self.path)
        if '/__/' in self.path:
            self.send_response(302)
            self.send_header('Location', self.path.replace('/__/', 'https://dooh-on-fire.web.app/__/'))
            self.end_headers()
        else:
            super().do_GET()

    def end_headers(self):
        if '/__/' not in self.path:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        return super().end_headers()


HTTPServer(("", 8000), Redirect).serve_forever()

# Desarrollado por la asignatura Programación de Clientes Ligeros
# Universidad Politécnica de Madrid
# Curso 2025-26

import conf

from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib

import logging as lg
import datetime
import socket

import mimetypes

piePagina = conf.ASIGNATURA + "Universidad Polit&eacute;cnica de Madrid ("+datetime.datetime.now().strftime("%c")+" en "+socket.gethostname()+")"

class MyServer(BaseHTTPRequestHandler):

    def do_GET(self):

        lg.debug("New request: "+self.path+" from: "+self.client_address[0])
        try:
            parsed_path = urllib.parse.urlparse(self.path)

            sendReply = True
            petición = self.path[1:]
            if (petición == ""):

                petición="index.html"

            elif (petición == "favicon.ico"):
                pass

            mimetype, codificacion = mimetypes.guess_type(petición)
            if mimetype is None:
                mimetype = 'application/octet-stream'


            if sendReply:
                templateFile=open(petición,'rb')
                string=templateFile.read()
                self.send_headers(200, mimetype)
                self.wfile.write(string)

        except ( FileNotFoundError):
            lg.warning(f"Se solicita una página o fichero '{self.path}' inexistente.")
            self.send_error(404, f"Recurso no encontrado: '{parsed_path.path}'")
        except (IOError):
            lg.warning(f"Se ha producido un error indefinido")
            self.send_error(500, f"Error interno del servidor '{parsed_path.path}'")

    def send_headers(self, status, content_type):
        #    """Send out the group of headers for a successful request"""
        # Send HTTP headers

        self.send_response(status, "OK")
        self.send_header('Content-type', content_type)
        self.send_header('Transfer-Encoding', 'chunked')
        self.send_header('Connection', 'close')
        self.end_headers()


if __name__ == "__main__":

    lg.info("Starting web server...")

    webServer = HTTPServer((conf.HOSTNAME, conf.SERVER_PORT), MyServer)

    lg.info("Server started http://%s:%s" % (conf.HOSTNAME, conf.SERVER_PORT))
    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        lg.info("Keyboard interruption. Stopping web server...")

    webServer.server_close()
    lg.info ("Server stopped.")

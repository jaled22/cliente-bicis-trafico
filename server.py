# Desarrollado por la asignatura Programación de Clientes Ligeros
# Universidad Politécnica de Madrid
# Curso 2025-26

import conf

from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib

import logging as lg
import datetime
import socket

import os

import mimetypes

piePagina = conf.ASIGNATURA + "Universidad Polit&eacute;cnica de Madrid ("+datetime.datetime.now().strftime("%c")+" en "+socket.gethostname()+")"

class MyServer(BaseHTTPRequestHandler):

    def do_GET(self):

        lg.debug("New request: "+self.path+" from: "+self.client_address[0])
        try:
            parsed_path = urllib.parse.urlparse(self.path)

            petición = self.path[1:]
            if (petición == ""):
                petición="index.html"

            mimetype, codificacion = mimetypes.guess_type(petición)
            lg.debug("\tTipo MIME: "+mimetype+" para el archivo: "+self.path)
            if mimetype is None:
                mimetype = 'application/octet-stream'

            if not os.path.isfile(petición):
                lg.warning(f"Se solicita una página o fichero '{self.path}' inexistente.")
                self.send_error(404, f"Recurso no encontrado: '{parsed_path.path}'")
                return

            tamano_archivo = os.path.getsize(petición)
            lg.debug("\tSe va a acceder al archivo: "+petición+" ...")
            templateFile=open(petición,'rb')
            string=templateFile.read()
            lg.debug("\tArchivo leído correctamente ("+str(len(string))+" bytes), se va a enviar al cliente...")
            self.send_headers(200, mimetype, tamano_archivo)
            lg.debug(f"\tEnviando {petición} ({tamano_archivo} bytes) por bloques...")
            with open(petición, 'rb') as f:
                while True:
                    bloque = f.read(1024 * 16) # Bloques de 16KB
                    if not bloque:
                        break
                    self.wfile.write(bloque)
            lg.debug("\tArchivo enviado correctamente al cliente.")

        except (IOError):
            lg.warning(f"Se ha producido un error indefinido")
            self.send_error(500, f"Error interno del servidor '{parsed_path.path}'")

    def send_headers(self, status, content_type, content_length):
        self.send_response(status, "OK")
        self.send_header('Content-type', content_type)
        self.send_header('Content-Length', content_length)
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

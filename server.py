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
import json

piePagina = conf.ASIGNATURA + "Universidad Polit&eacute;cnica de Madrid ("+datetime.datetime.now().strftime("%c")+" en "+socket.gethostname()+")"

class MyServer(BaseHTTPRequestHandler):


    def do_POST(self):
        # do_POST gestiona peticiones HTTP POST cuyo cuerpo debe venir en JSON.
        # Primero registra en el log la ruta solicitada y la IP del cliente.
        # Después valida que la cabecera Content-Type empiece por
        # "application/json"; si no, responde con error 415.
        # A continuación lee el cuerpo usando Content-Length y comprueba que el
        # contenido sea un JSON válido (UTF-8). Si falla el parseo, responde 400.
        # Si es válido, usa la ruta pedida (sin '/') para construir el nombre del
        # fichero destino con extensión .json (si la ruta está vacía usa "index").
        # Luego guarda el cuerpo recibido en ese fichero en modo binario.
        # Si hay un problema de escritura, responde 500.
        # Si todo va bien, devuelve 200 con una respuesta JSON {"status":"ok"}.
        # Cualquier excepción no controlada termina en error 500 genérico.
        lg.debug("New POST request: "+self.path+" from: "+self.client_address[0])
        try:
            parsed_path = urllib.parse.urlparse(self.path)

            content_type = self.headers.get('Content-Type', '')
            if not content_type.lower().startswith('application/json'):
                lg.warning(f"POST rechazado en '{self.path}': Content-Type no válido ({content_type}).")
                self.send_error(415, "Tipo de contenido no soportado. Se requiere application/json")
                return

            content_length = int(self.headers.get('Content-Length', 0))
            cuerpo = self.rfile.read(content_length)

            try:
                json.loads(cuerpo.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                lg.warning(f"POST rechazado en '{self.path}': JSON inválido.")
                self.send_error(400, "JSON inválido en el cuerpo de la petición")
                return

            ruta_recurso = parsed_path.path.lstrip('/')
            if ruta_recurso == "":
                ruta_recurso = "index"
            fichero_destino = ruta_recurso + ".json"

            # CONTROL DE HISTORIAL ACUMULATIVO
            if ruta_recurso == "visitas":
                historial = []
                # 1. Si el archivo ya existe, leemos las visitas anteriores
                if os.path.exists(fichero_destino):
                    with open(fichero_destino, 'r', encoding='utf-8') as f:
                        try:
                            historial = json.load(f)
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            historial = []

                try:
                    # 2. Parseamos la nueva ciudad que envía el app.js
                    nueva_visita = json.loads(cuerpo.decode('utf-8'))
                    # 3. Le añadimos la fecha y hora desde el servidor
                    nueva_visita["fecha"] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    
                    # 4. Lo sumamos al historial
                    historial.append(nueva_visita)

                    # 5. Guardamos la lista completa actualizada
                    with open(fichero_destino, 'w', encoding='utf-8') as f:
                        json.dump(historial, f, indent=4, ensure_ascii=False)
                        
                    lg.debug(f"Historial de visitas actualizado en '{fichero_destino}'.")
                except Exception as e:
                    lg.warning(f"Error al procesar el JSON del historial: {e}")
                    self.send_error(400, "Error en el format de datos enviado")
                    return
            else:

                try:
                    with open(fichero_destino, 'wb') as f:
                        f.write(cuerpo)
                    lg.debug(f"POST guardado correctamente en '{fichero_destino}' ({len(cuerpo)} bytes).")
                except OSError:
                    lg.warning(f"No se pudo guardar el fichero '{fichero_destino}'.")
                    self.send_error(500, f"Error interno del servidor '{parsed_path.path}'")
                    return

            respuesta = b'{"status":"ok"}'
            self.send_headers(200, 'application/json', len(respuesta))
            self.wfile.write(respuesta)

        except Exception:
            lg.warning("Se ha producido un error indefinido en POST")
            self.send_error(500, "Error interno del servidor")


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

HOSTNAME = "localhost"
SERVER_PORT = 8080

ASIGNATURA ="Tecnolog&iacute;as Web - Programaci&oacute;n clientes ligeros 2024-25. "


# Configuración de logging
LOG_FICHERO = False  # Indica si el registro se almacena en un archivo
CARPETA_LOG = "log"  # Carpeta donde se almacenará el archivo de log
FILE_LOG = "webserver.log"  # Nombre del archivo de log



##############################################################################
##############################################################################
##############################################################################
import subprocess
import sys
import logging as lg

# Nivel de registro predeterminado
level = lg.INFO

# Configuración de registro
if LOG_FICHERO:
    """
    Si se habilita el registro en un archivo (LOG_FICHERO=True), configura
    un archivo de log en la carpeta y archivo especificados.
    """
    lg.getLogger(__name__)  # Obtiene el logger para el módulo actual
    lg.basicConfig(
        filename=f".\\{CARPETA_LOG}\\{FILE_LOG}",  # Ruta del archivo de log
        encoding="utf-8",  # Codificación para el archivo
        level=level,  # Nivel de registro
        format="%(asctime)s - %(levelname)s - %(message)s",  # Formato del mensaje
    )
else:
    """
    Si no se habilita el registro en archivo, configura la salida de log
    directamente a la consola.
    """
    lg.basicConfig(
        level=level,  # Nivel de registro
        format="%(asctime)s - %(levelname)s - %(message)s",  # Formato del mensaje
    )

##############################################################################


def instalar_librerías(lib_name: str) -> None:
    """
    Verifica si una librería está instalada y la instala si no lo está.
    """
    try:
        # Intentamos importar la librería para verificar si está instalada.
        __import__(lib_name)
        # print(f'La librería "{lib_name}" ya está instalada.')
    except ImportError:
        # Si no está instalada, mostramos un mensaje y procedemos a instalarla.
        print(f'La librería "{lib_name}" no está instalada. Instalando...')
        try:
            # Usamos subprocess para llamar a pip e instalar la librería
            resultado = subprocess.run(
                [sys.executable, "-m", "pip", "install", lib_name],
                capture_output=True,
                text=True,
            )

            # Mostrar la salida estándar y los errores si ocurren
            if resultado.returncode == 0:
                print(f'La librería "{lib_name}" se ha instalado correctamente.')
            else:
                print(f'Error al instalar la librería "{lib_name}".')
                print(f"Salida de error: {resultado.stderr}")
                print(f"Salida estándar: {resultado.stdout}")
        except Exception as e:
            # Capturamos errores en la ejecución del comando
            print(f'Hubo un error al intentar instalar la librería "{lib_name}": {e}')
            return  # Finalizamos la función si la instalación falla

        # Intentamos importar nuevamente la librería después de instalarla.
        try:
            __import__(lib_name)
            # print(f'La librería "{lib_name}" ya está instalada.')
        except ImportError:
            print(
                f'Error al intentar importar la librería "{lib_name}" después de instalarla.'
            )


# procedemos a instalar todas las librerías necesarias, si no están previamente instaladas

instalar_librerías("logging")
instalar_librerías("datetime")
instalar_librerías("socket")
instalar_librerías("urllib")
instalar_librerías("http")

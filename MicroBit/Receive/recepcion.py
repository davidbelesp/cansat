import serial
import time
import mysql.connector  # python -m pip install mysql-connector-python
import pymysql
from mysql.connector import Error
from datetime import datetime


PORT = "COM3"
RATE = 9600

def getDataBaseConnection():
    try:
        database = pymysql.connect(
            host='localhost',
            database='cansat',
            user='root',
            password='',
        )
        return database
    except Error as ex:
        print("Error en BBDD: ", ex)
        return False


def getSerialPortConnection():
    if getDataBaseConnection() != False:
        print("Conexion con Base de Datos exitosa")
        try:
            # Aqui debes ponerle el puerto al que esta conectado tu arduino en el ide. Normalmente es el COM3 y a 9600 baudios
            # En el metodo setUp del ide de arduino necesitas esto Serial.begin(9600); que ya lo sabrás
            # Te aseguras el puerto en Herramientas > Puerto > El COM que este usando
            serialPort = serial.Serial(PORT, RATE)
            time.sleep(2)  # Damos 2 segundos para realizar la conexion con el puerto serie
            print("Conexion con Serial Port exitosa\n-Esperando lecturas...")
            return serialPort
        except Error:
            print("== Fallo al conectar con Serial Port ==")
            print(Error)
            return False
    else:
        print("== Fallo al conectar con la Base de Datos ==")
        print("Conexion con Serial Port cancelada")


# Aqui pasas los parametros que recibes del arduino. dataBase se queda que es el retorno de la conexion
def setSQLquery(dataBase, temp, rotacion, humedad):
    try:
        cursor = dataBase.cursor()
        sql = (
            # Cada %s es un parametro, tantos como parametros se le pase al insert que seran las lecturas que recibas
            "INSERT INTO datos(TEMP, ANGULO, HUMEDAD)"
            "VALUES (%s, %s, %s)"
        )
        dataToInsert = (temp, rotacion, humedad)
        cursor.execute(sql, dataToInsert)
        dataBase.commit()
        return True
    except:
        dataBase.rollback()


# Main
if __name__ == '__main__':
    # Iniciamos la conexion con la BBDD y el Serial Port
    dataBase = getDataBaseConnection()
    serialPort = getSerialPortConnection()

    # Bucle que se va a repetir constantemente para ir obteniendo las lecturas. Si el arduino recoge lectura cada X segundos, este bucle funciona cada esos X segundos
    try:
        while serialPort.isOpen() and dataBase != False:
            # Lecturas del serial port
            # Cada readLine es una lectura por linea del arduino. Yo en el loop del ide arduino mando cada lectura asi:
            # Serial.println(tuLectura);
            # Para que cada una este en una linea y asi cogerlo mejor con el readLine()
            # Por defecto el tipo será el mismo que mande el arduino
            line = str(serialPort.readline())
            caracteres = ["b","\\","r","n","\"","[","]"," ","\'"]
            for caracter in caracteres:
                line = line.replace(caracter,"")
            line = line.split(",")
            temp = line[0]
            rotacion = line[1]
            humedad = line[2]
            # Ejecutamos la sentencia INSERT de SQL
            if setSQLquery(dataBase, temp, rotacion, humedad):
                print("\nRegistro insertado correctamente")
                print("-Esperando lecturas...")
            else:
                print("== Fallo al insertar el registro en la BBDD. Comprueba la sentencia SQL o la BBDD ==")
                break

    except:
        "Error"

    # Para detener esto pues lo paras manualmente cuando ya quieras acabar
from microbit import *

def on_button_pressed_a():
    serial.write_line("HOLA")
input.on_button_pressed(Button.A, on_button_pressed_a)


basic.show_icon(IconNames.HAPPY)

latestHum = 0
contador = 0

serial.redirect(SerialPin.P12, SerialPin.P8, BaudRate.BAUD_RATE9600)

def getHumidity():
    dht11_dht22.query_data(DHTtype.DHT11, DigitalPin.P1, True, False, False)

    hum = dht11_dht22.read_data(dataType.HUMIDITY)
    global latestHum
    if hum > 0: latestHum = hum
    else: hum = latestHum

    return hum

def getAcceleration():
    return input.acceleration(Dimension.Y)

def on_every_interval():
    global contador
    contador += 1
    
    humidity = getHumidity()
    #dht11_dht22.read_data_successful()
    temperature = input.temperature()
    acceleration = getAcceleration()

    serial.write_line(temperature + "," + acceleration + "," + humidity)
loops.every_interval(1000, on_every_interval)
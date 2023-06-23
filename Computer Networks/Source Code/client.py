import socket
# get local host address
host = socket.gethostname()
port = 3500
# instaniate socket
mysocket = socket.socket()
# connect to server via socket
mysocket.connect((host, port))
# show exit reply /q
print("Type /q to quit")
while True:
    # take in data to send
    data = input("Client: ")
    # check for quit command
    if data.lower().strip() == '/q':
        break
    # sending data
    mysocket.send(data.encode())
    print("Waiting for message...")
    # recv message from server
    data = mysocket.recv(1024).decode()
    if not data:
        break
    print("Server: " + str(data))
mysocket.close()
# Title: Socket Programming HOWTO
# Author: McMillian, Gordon
# Date: Jun 16, 2019
# Code version: n/a
# Availability: https://docs.python.org/3.4/howto/sockets.html
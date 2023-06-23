import socket
# get local host
host = socket.gethostname()
port = 3500
# create socket
mysocket = socket.socket()
# bind socket to host and port
mysocket.bind((host, port))
# make port reusable
mysocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
# set number of connections
mysocket.listen(2)
# accept connection from client program
connection, address = mysocket.accept()
# print address of connection
print("Connected to :" + str(address))
# begin chat function
print("Type /q to quit")
while True:
    print("Waiting for message...")
    # recv data from client to start
    data = connection.recv(1024).decode()
    if not data:
        break
    print("Client: " + str(data))
    # send data
    data = input("Server: ")
    # check for quit command
    if data.lower().strip() == '/q':
        break
    connection.send(data.encode())
connection.close()
# Title: Socket Programming HOWTO
# Author: McMillian, Gordon
# Date: Jun 16, 2019
# Code version: n/a
# Availability: https://docs.python.org/3.4/howto/sockets.html

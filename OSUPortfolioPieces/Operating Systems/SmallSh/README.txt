Read Me File for smallsh project

Program outline :
	Definition:
		The main purpose of this program is to emulate a small scale sh client on a linux-unix based system.
	methods and functions:
		main is the main runing part of the program
		newCommand makes a structure in the format needed to perform an action
		exeMe executes any non built in command and supports the background command 
		getLine gets the command line in a function
		status prints out the exit status of the processes
		cd changes directory in no argument is specified wd is set to HOME
		exitProc exits out the method 
		handle_SIGTSTP overides the standard SIGTSTP
		methodHandle allows the children proccess to use ctrl C
Compile:
	type in Unix "gcc --std=gnu99 -o smallsh main.c"
run:
	type in Unix "smallsh"
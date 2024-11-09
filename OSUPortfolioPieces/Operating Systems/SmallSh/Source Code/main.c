#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <fcntl.h>
#include <stdbool.h>
#include <sys/wait.h>
#include <unistd.h>
#include <signal.h>
//command[arg1 arg2 ...][< input_file][> output_file][&]
//if there is an & sign run in background 
// max 2048 chars per cmd
//max 512 arguments per cmd
bool background = true;
typedef char *String;
struct command {
	String *args;
	String input;
	String output;
	bool background;
	String fullcmd;
};
// test cmd  dostuff args$$[][] < input$file > output$$file &
typedef struct command* Command;
Command newCommand(String line) {
	Command c = malloc(sizeof(struct command));
	if (*line == '\0') {
		return NULL;
	}
	String saveptr;
	//saving fullcmd 
	c->fullcmd = malloc((strlen(line)+1)*sizeof(char));
	strcpy(c->fullcmd,line);
	//first token command
	c->args = malloc(sizeof(String[512]));
	String token = strtok_r(line," ", &saveptr);
	c->args[0] = calloc(strlen(token) + 1, sizeof(char));
	strcpy(c->args[0],token);
	bool inHit = false, outHit = false;
	int count = 1;
	while (*saveptr != '\0' && count<=512 ) {
		token = strtok_r(NULL, " ", &saveptr);
		if (strcmp(token, "<") == 0) {
			inHit = true;
			continue;
		}
		else if (strcmp(token, ">") == 0) {
			outHit = true;
			continue;
		}
		if (outHit) {
			c->output = calloc(strlen(token) + 1, sizeof(char));
			strcpy(c->output, token);
			outHit = false;
			continue;
		}
		else if (inHit) {
			c->input = calloc(strlen(token) + 1, sizeof(char));
			strcpy(c->input, token);
			inHit = false;
			continue;
		}
		else if (strcmp(token, "&") != 0) {
			c->args[count] = calloc(strlen(token) + 1, sizeof(char));
			strcpy(c->args[count], token);
			count++;
			continue;
		}
		else {
			c->background = true;
		}
	
	}
	return c;
}
typedef struct sigaction sigact;
void handle_SIGTSTP() {
	switch (background) {
		case(true):
			printf("\nEntering foreground only mode (& will be ignored)\n");
			fflush(stdout);
			background = false;
			break;
		default:
			printf("\nExiting foreground-only mode (& WILL NOT be ignored)\n");
			fflush(stdout);
			background = true;
			break;
	}


}
void methodHandle() {
	
	printf("terminated by signal 2\n");
	kill(getpid(),2);
	
}
String getLine(int pid) {
	/// <summary>
	/// gets data handles some extra spaces and newLine character
	/// </summary>
	/// <param name="pid"></param>
	/// <returns>String</returns>
	size_t max = 2048 * sizeof(char), length = max;
	String line = malloc(max), lp = line, saveptr;
	//converting pid to string 
	char snum[100];
	sprintf(snum,"%d",pid);
	String np = snum;
	int c, ex;
	if (line == NULL) {
		return NULL;
	}
	while ((c = fgetc(stdin)) != EOF && c != '\n') {
		if (--length == 0)  {
			String s = realloc(lp, max *=2);
			if (s == NULL) {
				free(lp);
				return NULL;
			}
			line = s + (line - lp);
			lp = s;
		}
		if (c == '$' && (ex = fgetc(stdin)) == '$') {
			strcat(lp, snum);
			while (*np != '\0') {
				*np++;
				*line++;
			}
			np = snum;
		}
		else if (c == '$') {
			*line++ = c;
			*line++ = ex;
		}
		else *line++ = c;
		
	}
	*line++ = '\0';
	bool whitespace = true;
	for (int x = strlen(lp)-1; 0 <= x; --x) {
		if (lp[x] != ' ' && lp[x] != '\t') {
			whitespace = false;
		}
		else if (whitespace) {
			lp[x] = '\0';
		}
	}
	fflush(stdin);
	return lp;
}
int exitProc() {
	//returns out of prog;
	return EXIT_SUCCESS;
}
int cd(Command path) {
	//checking to see if args is empty if it is pwd is set to home.
	if (path->args[1]) {
		if(chdir(path->args[1]) == -1) {
			printf("No Directory with name: %s was found.\n");
			fflush(stdout);
		}
	}
	else {
		chdir(getenv("HOME"));
	}
	return -1;
}
int status(int s) {
	
	if (WIFEXITED(s)) {
		printf("exit value %d\n",WEXITSTATUS(s));
	}
	else {
		printf("terminated by signal %d\n",WTERMSIG(s));
	}
	return -1;
}
/// <summary>
/// executes any non built in function
/// </summary>
/// <param name="c"></param>
/// <param name="sa"></param>
/// <param name="exitStat"></param>
/// <returns>int</returns>
int execMe(Command c, sigact sa,int* exitStat) {
	int in, out, cmdRes;
	pid_t spawnPid = -5;
	//fork
	spawnPid = fork();
	switch (spawnPid) {
		case -1:
			perror("Fork Failed :(");
			exit(1);
			break;
		case 0:
			//proccess will now enable ^C for child 
			sa.sa_handler = methodHandle;
			sigaction(SIGINT, &sa,NULL);
			if (c->input != NULL) {
				//OPEN INPUT FILE IF NOT NULL
				if ((in = open(c->input, O_RDONLY)) == -1) {
					printf("Cannot open %s for input\n",c->input);
					exit(1);
				}
				//DUPLICATING 
				if ((cmdRes = dup2(in, 0)) == -1) {
					perror("Cannot assign the input file\n");
					exit(2);
				}
				fcntl(c->input, F_SETFD, FD_CLOEXEC);
			}
			if (c->output != NULL) {
				//OPEN OUTPUT FILE IF NOT NULL
				if ((out = open(c->output, O_WRONLY | O_TRUNC | O_CREAT,0666)) == -1) {
					perror("Cannot open file for output\n");
					exit(1);
				}
				//DUPLICATING 
				if ((cmdRes = dup2(out, 1)) == -1) {
					perror("Cannot assign the output file\n");
					exit(2);
				}
				fcntl(c->output, F_SETFD, FD_CLOEXEC);
			}
			//attempting execute
			if (execvp(c->args[0],(String const*)c->args)) {
				printf("%s: no such file or directory\n",c->args[0]);
				fflush(stdout);
				exit(2);
			}
			break;
		default:
			//check for background process
			if (c->background && background) {
				pid_t actualPid = waitpid(spawnPid, exitStat, WNOHANG);
				printf("background pid is %d\n", spawnPid);
				fflush(stdout);
			}
			else {
				pid_t parentPid = waitpid(spawnPid, exitStat, 0);
			}
			//checking for background terminations
			while ((spawnPid = waitpid(-1, exitStat, WNOHANG)) > 0) {
				printf("child %d terminated\n", spawnPid);
				status(*exitStat);
				fflush(stdout);
			}
	}
	return -1;

}
/// <summary>
/// proccesses and calls proper method
/// </summary>
/// <param name="c"></param>
/// <param name="sa"></param>
/// <param name="exitStat"></param>
/// <returns></returns>
int proccessCMD(Command c,sigact sa,int* exitStat) {
	//checking to see what the command is 
	if (strcmp(c->args[0],"cd")==0) {
		return cd(c);
	}
	else if (strcmp(c->args[0], "status") == 0) {
		return status(*exitStat);
	}
	else if (strcmp(c->args[0], "exit") == 0) {
		return exitProc();
	}
	else {
		return execMe(c, sa,exitStat);
	}
}
int main(){
	//data useful for later on
	int pid = getpid();
	int exitStat = 0;
	int x;
	//catching ^c
	
	sigact SIGINT_action = {0};
	SIGINT_action.sa_handler = SIG_IGN;
	x = sigfillset(&SIGINT_action.sa_mask);
	SIGINT_action.sa_flags = 0;
	sigaction(SIGINT, &SIGINT_action, NULL);
	 
	//catching ^z
	sigact SIGTSTP_action = { 0 };
	SIGTSTP_action.sa_handler = handle_SIGTSTP;
	x = sigfillset(&SIGTSTP_action.sa_mask);
	SIGTSTP_action.sa_flags = 0;
	sigaction(SIGTSTP,&SIGTSTP_action,NULL);
	x = -1;
	Command cmd;
	//beggining prompt
	do {
		printf(": ");
		if ((cmd = newCommand(getLine(pid)))== NULL) {
			continue;
		}
		if (*cmd->args[0] == '#') {
			continue;
		}
		x = proccessCMD(cmd,SIGINT_action,&exitStat);
	} while (x != EXIT_SUCCESS);
	return x;
}     


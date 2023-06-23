Compile
to compile gcc -pthread concurrency.c
Project Intructions
Purpose
To gain familiarity with concurrency solutions as written in C.

Instructions
You will be implementing solutions in C to the Classical concurrency problems. In terms of command-line interface, please use the following:

-p: run the producer/consumer problem
-n: number of producers (required if using -p) -- your solution must work with more than one producer!
-c: number of consumers (required if using -p) -- your solution must work with more than one consumer!
-d: dining philosopher's problem
-b: potion brewers problem
The above are the only required flags. You are welcome to have more, as well as having long versions of the above.

You will be writing a single C file, with solutions for each of the requested tasks. Command-line arguments should be parsed, and if no arguments are given a usage message should be displayed, detailing how to run your program.

You have the option of doing this with threads (recommended) or processes (harder due to shared memory requirements). Extra credit will be given for doing this with processes (+20 points). 

Submission Details
You will be submitting your C code to Canvas.

As you have access to reference solutions, these will be evaluated for correctness, but that is of lesser importance. Feedback will primarily focus on your implementation choices, rather than if it is correct or not. To put that in terms of points, 25 points will be dedicated to correctness. 75 points will be dedicated to your implementation:

Do you parse command-line arguments correctly? (10 points)
Does only the requested functionality run? (10 points)
Do you have reasonable comments in your code, to make it clear what is happening? (15 points)
This can take the form of function preambles, in-line comments, or some combination thereof.
Do you adequately break your code down into functions, rather than one giant block of code in main? (10 points)
This isn't a software engineering class, but at minimum, I should be able to find the code for a given concurrency solution easily.
Do you correctly synchronize between threads/processes? (30 points)

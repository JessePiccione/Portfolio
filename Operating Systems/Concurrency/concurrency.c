#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>
#include <string.h>
#define potionBrewer "-b\0"
#define diningPhils "-d\0"
#define prodcons "-p\0"

//code for produce consumer 

//global data for threads 
int buff[30000];
int pindex = 0;
int cindex = 0;
int numprod = 0;
int numcons = 0;
int concount = 0;
pthread_mutex_t lock;
//produces data for consumption
void* producer(void* arg){
    int x;
    for ( x = 1; x <= (numcons*200)/(numprod); x++ ){
        //obtain lock 
        pthread_mutex_lock(&lock);
        //while buff is full
        int count = 0;
        while(buff[pindex] != 0){
            pthread_mutex_unlock(&lock);
            pthread_mutex_lock(&lock);
        }
        buff[pindex] = x;
        pindex++;
        if (pindex == 1024){
            pindex = 0;
        }
        pthread_mutex_unlock(&lock);
        //release lock
    }
    return NULL;

}
//consumes data for production
void* consumer(void* arg){
    int x;
    while ( 1 ){
        pthread_mutex_lock(&lock);
        int count = 0;
        while (buff[cindex] == 0){
            pthread_mutex_unlock(&lock);
            pthread_mutex_lock(&lock);
            count++;
            if ( count == 300000){
                pthread_mutex_unlock(&lock);
                return NULL;
            }
        }
        concount++;
        printf("Consumed number: %d\n", buff[cindex]);
        buff[cindex] = 0;
        cindex++;
        if(cindex == 1024){
            cindex = 0;
        }
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}
void pc(int argc, char *argv[]){
    pthread_mutex_init(&lock, NULL);
    int x, pcount, ccount;
    for( x = 0; x < argc; x++ ){
        if ( strcmp( argv[x], "-c" ) == 0 ) {
            ccount = atoi(argv[x+1]);
        }
        if ( strcmp( argv[x], "-n" ) == 0 ) {
            pcount = atoi(argv[x+1]);
        }
    } 
    if (pcount < 1 && ccount < 1) {
        printf("incorect values, must be 1 or more producers and consumers\n");
        return;
    }
    const int a = pcount;
    const int b = ccount;
    numprod = a;
    numcons = b;
    pthread_t producers[a];
    pthread_t consumers[b];
    //starting producer threads 
    for (x = 0; x < pcount; x++){
        pthread_create(&producers[x], NULL, &producer, NULL);
    }
    //starting consumer threads 
    for (x = 0; x < ccount; x++){
        pthread_create(&consumers[x], NULL, &consumer, NULL);
    }
    //joining back threads 
    for (x = 0; x < pcount; x++){
        pthread_join(producers[x], NULL);
    }
    for (x = 0; x < ccount; x++ ){
        pthread_join(consumers[x], NULL);
    }
    printf("Consumption count: %d\n", concount);
}
//end code for producer consumer implementation 
//begin code for dining philosopher 
sem_t table;
sem_t forks[5];
//helpers
int left(int i){return i;}  
int right(int i){return (i + 1) % 5;}
void get_forks(int i){
    sem_wait(&table);
    sem_wait(&forks[left(i)]);
    sem_wait(&forks[right(i)]);
}
void put_forks(int i){
    sem_post(&forks[left(i)]);
    sem_post(&forks[right(i)]);
    sem_post(&table);
}
//main functionality 
void think(int phil){
    printf("Philosopher #%d is thinking.\n", phil);
    sleep( (rand()%20) + 1 );
    printf("Philosopher #%d is done thinking.\n", phil);
}
void eat(int phil){
    printf("Philosopher #%d is eating.\n", phil);
    sleep( (rand()%8) + 2 );
    printf("Philosopher #%d is done eating.\n", phil);
}
void * philosopher(void *num){
    int phil =  *(int*)num;
    while ( 1 ){
        think(phil);
        get_forks(phil);
        eat(phil);
        put_forks(phil);
    }
}
void dp(){
    printf("Ctrl-C to cancel!\n");
    int i, a[5];
    pthread_t ttable[5];
    sem_init(&table, 0, 4);
    for ( i = 0; i < 5; i++ ){
        sem_init(&forks[i], 0, 1);
    }
    for ( i = 0; i < 5; i++ ){
        a[i] = i;
        pthread_create(&ttable[i], NULL, philosopher, (void *) &a[i]);
    }
    for (i = 0; i < 5; i++) {
        pthread_join(ttable[i], NULL);
    }
}
//end code for dining philosopher 
//begin code for potion brewer 
//agent semaphores 
sem_t agentSem;
sem_t mb;
sem_t uh;
sem_t b;
int isMB = 0, isUH = 0, isB = 0;
sem_t mbsem, uhsem, bsem, pushlock;
void brew(char* str){
    printf("Brewer %s is brewing...\n", str);
}
void* agentAcode(void* args){
    while ( 1 ){
        sem_wait(&agentSem);
        sem_post(&mb);
        sem_post(&b);   
    }
}
void* agentBcode(void* args){
    while ( 1 ){
        sem_wait(&agentSem);
        sem_post(&uh);
        sem_post(&b);
    }
}
void* agentCcode(void* args){
    while ( 1 ){
        sem_wait(&agentSem);
        sem_post(&mb);
        sem_post(&uh); 
    }
}
void* pusherAcode(void* args){
    while ( 1 ){
       sem_wait(&mb);
       //sem_wait(&pushlock);
        if (isUH){
           isUH = 0;
           sem_post(&bsem);
        }
        else if (isB) {
           isB = 0;
           sem_post(&uhsem);
        }
        else{
           isMB = 1;
        }
        //sem_post(&pushlock);
    }
}
void* pusherBcode(void* args){
    while ( 1 ){
       sem_wait(&uh);
       //sem_wait(&pushlock);
        if (isMB){
           isMB = 0;
           sem_post(&bsem);
        }
        else if (isB) {
           isB = 0;
           sem_post(&mbsem);
        }
        else{
           isUH = 1;
        }
        //sem_post(&pushlock);
    }
}
void* pusherCcode(void* args){
    printf("Pusher C started");
    while ( 1 ){
       sem_wait(&b);
       //sem_wait(&pushlock);
        if (isUH){
           isUH= 0;
           sem_post(&mbsem);
        }
        else if (isMB) {
           isMB = 0;
           sem_post(&uhsem);
        }
        else{
           isB = 1;
        }
        //sem_post(&pushlock);
    }
}
void* brewerAcode(void* args){
    char* str = "A";
    while ( 1 ) {
        sem_wait(&uhsem);
        brew(str);
        sem_post(&agentSem);
    }
}
void* brewerBcode(void* args){
    char* str = "B";
    while ( 1 ) {
       sem_wait(&mbsem);
       brew(str);
       sem_post(&agentSem);
    }
}
void* brewerCcode(void* args){
    char* str = "C";
    while ( 1 ) {
        sem_wait(&bsem);
        brew(str);
        sem_post(&agentSem);
    }
}

void pb(){
    printf("Staring ...");
    sem_init(&agentSem,0,1);
    sem_init(&mb,0,0);
    sem_init(&uh,0,0);
    sem_init(&b,0,0);

    sem_init(&mbsem, 0, 0);
    sem_init(&uhsem, 0, 0);
    sem_init(&bsem, 0, 0);

    //sem_init(&pushlock,0,1);

    char* str = "Hello123";
    //code for agent 
    pthread_t agentA, agentB, agentC;
    pthread_create(&agentA, NULL, agentAcode, NULL);
    pthread_create(&agentB, NULL, agentBcode, NULL);
    pthread_create(&agentC, NULL, agentCcode, NULL);

    pthread_t pusherA, pusherB, pusherC;
    pthread_create(&pusherA, NULL, pusherAcode, NULL);
    pthread_create(&pusherB, NULL, pusherBcode, NULL);
    pthread_create(&pusherC, NULL, pusherCcode, NULL);

    pthread_t brewerA, brewerB, brewerC;
    pthread_create(&brewerA, NULL, brewerAcode, NULL);
    pthread_create(&brewerB, NULL, brewerBcode, NULL);
    pthread_create(&brewerC, NULL, brewerCcode, NULL);

    pthread_join(agentA, NULL);
    pthread_join(agentB, NULL);
    pthread_join(agentC, NULL);

    pthread_join(pusherA, NULL);
    pthread_join(pusherB, NULL);
    pthread_join(pusherC, NULL);

    pthread_join(brewerA, NULL);
    pthread_join(brewerB, NULL);
    pthread_join(brewerC, NULL);
}
//end code for potion brewer 
int main(int argc, char *argv[] ){
    char* str;
    if  (argc < 2){
        printf("Incorrect amount of arguments\n");
        printf("Usage: 'program_name (-d or -b)'\nOther Usage: 'program_name -p -n num_of_producers -c num_of_consumers'\n");
        return -1;
    }
    str = argv[1];
    if (strcmp(str, prodcons) == 0){
        pc(argc, argv);
    }
    else if (strcmp(str, potionBrewer) == 0){
        pb();
    }
    else if (strcmp(str, diningPhils) == 0){
        dp();
    }
    return 0;
}
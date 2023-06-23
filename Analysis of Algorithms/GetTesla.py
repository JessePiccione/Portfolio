def toOne(num):
    return 1 + abs(num)

def getTesla(M):
    netChange = M[0][0]
    count = 0
    i = j = 0
    rowLen = len(M)-1
    colLen = len(M[0])-1
    while(i < rowLen and j < colLen):
        if(M[i+1][j] < M[i][j+1]):
            j = j + 1
        else:
            i = i + 1
        netChange += M[i][j]
        if(netChange <= 0):
            temp = toOne(netChange)
            netChange+=temp
            count+=temp
        
    while(i < rowLen):
        i += 1
        netChange += M[i][j]
        if(netChange <= 0):
            temp = toOne(netChange)
            netChange+=temp
            count+=temp

    while( j < colLen):
        j += 1
        netChange += M[i][j]
        if(netChange <= 0):
            temp = toOne(netChange)
            netChange+=temp
            count+=temp
    return count
    
M = [[-1,-1000,2],
    [-10,-8,5],
    [-5,-2,10]]
print(getTesla(M))
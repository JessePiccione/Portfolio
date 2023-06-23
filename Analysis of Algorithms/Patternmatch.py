
def patternmatch(string, p):
    n = len(string)
    m = len(p)
    cache = [[False for i in range(m + 1)] for j  in range(n+1)]
    cache[0][0] = True
    for j in range(1, m+1):
        if p[j - 1] == '*':
            cache[0][j] = cache[0][j-1]
    for i in range(1, n+1):
        for j in range(1, m+1):
            if p[ j - 1 ] == '*':
                cache[i][j] = cache[i][ j - 1] or cache[i - 1][j]
            elif p[ j - 1 ] =='?' or string[ i - 1 ] == p[ j - 1 ]:
                cache[i][j] = cache[i-1][j-1]
            else: 
                cache[i][j] = False
    return cache[m][n]
print(patternmatch("abcde","*a?c*"))
    
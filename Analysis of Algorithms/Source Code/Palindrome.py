#brute force 
def helper_1(str1,str2,index1,index2):
    if not index1: return index2
    if not index2: return index1
    if str1[index1-1] == str2[index2-1]:
        return helper_1(str1,str2,index1-1,index2-1)
    res = 1 + min( helper_1(str1, str2,index1-1,index2), helper_1(str1, str2, index1, index2 -1) )
    return res
def checkPalindrome_1(string, k):
    rev = string[::-1]
    length = len(string)
    return (helper_1(string,rev,length,length) <= k*2)
#dynamic programming 
def checkPalindrome_2(string, k):
    rev = string[::-1]
    index1 = index2 = len(rev)
    darr = [[0] * (index1 + 1) for uselessVariable in range(index1 + 1)]
    for i in range(index1+1):
        for j in range(index2+1):
            if not i or not j:
                darr[i][j] = 0
            elif (string[i - 1] == rev[j - 1]):
                darr[i][j] = darr[i-1][j-1]
            else:
                darr[i][j] = 1 + min(darr[i-1][j],darr[i][j-1])
    return darr[index1][index2] <= k * 2
#test for both methods 
string = 'mabham'
k = 2
print(checkPalindrome_2(string, k))
print(checkPalindrome_1(string, k))
# Gets the ip address of a user givent the request
# Why get the Ip this way: https://stackoverflow.com/questions/50468293/about-the-security-issues-of-http-x-forwarded-for-should-i-use-it-at-all-inst
def get_ip(request):
    ip = None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')    
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
        
    return ip
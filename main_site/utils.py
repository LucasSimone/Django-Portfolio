import requests
from django.conf import settings

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

def geolocate_ip(ip):
    url = 'http://ip-api.com/json/' + ip + '?fields=status,message,country,regionName,city,district,zip,lat,lon,timezone,isp,mobile,proxy'
    response = requests.get(url)
    data = response.json()

    return data


def recaptcha_is_valid(token):
    response = requests.post(
        'https://www.recaptcha.net/recaptcha/api/siteverify', 
        data={
            'secret': settings.RECAPTCHA_PRIVATE_KEY,
            'response': token
        }
    )
    recaptcha_json = response.json()

    if recaptcha_json['success'] and recaptcha_json['score'] >= float(settings.RECAPTCHA_REQUIRED_SCORE):
        return True
    else:
        return False
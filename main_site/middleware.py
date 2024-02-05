
from .utils import *
from django.utils import timezone

from .models import Visitor

def visitor_middleware(get_response):

    def middleware(request):
        ip = get_ip(request)
        
        if not Visitor.objects.filter(ip_address=ip).exists():
            ip = get_ip(request)

            data = geolocate_ip(ip)
            if data['status'] == 'success':
                data['ip'] = ip
                del data['status']
                Visitor.save_visitor(data)
        else:
            Visitor.update_visitor_date(Visitor.objects.get(ip_address=ip))

        # Have to return what comes next after the middleware
        response = get_response(request)
        return response

    return middleware
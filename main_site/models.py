from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

    
# # Example of a Model creation with different options
# class ExampleModel(models.Model):
#     # Below is a char field with set choices
#     priority_level = [
#         ("HI", "High"),
#         ("MD", "Medium"),
#         ("LW", "Low"),
#         ("NN", "None"),
#     ]

#     priority = models.CharField(
#         max_length=2,
#         choices=priority_level,
#         default="NN"
#     )

#     # Sets a custom table name
#     class Meta:
#         verbose_name_plural = "Name"


class Feedback(models.Model):
    name = models.CharField(max_length=128)
    email = models.EmailField()
    date_recieved = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True,blank=True)
    content = models.TextField()

    priority_level = [
        (0, "New"),
        (1, "High"),
        (2, "Medium"),
        (3, "Low"),
        (4, "None"),
    ]

    priority = models.IntegerField(choices=priority_level,default=0)

    class Meta:
        verbose_name_plural = "Feedback"

class Testimonial(models.Model):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=128,null=True,blank=True)
    content = models.TextField()
    date_recieved = models.DateTimeField(default=timezone.now,null=True,blank=True)

class Visitor(models.Model):
    ip_address = models.GenericIPAddressField(unique=True,null=True,blank=True)
    country = models.CharField(max_length=128,null=True,blank=True)
    regionName = models.CharField(max_length=128,null=True,blank=True)
    city = models.CharField(max_length=128,null=True,blank=True)
    district = models.CharField(max_length=128,null=True,blank=True)
    zip = models.CharField(max_length=128,null=True,blank=True)
    lat = models.CharField(max_length=128,null=True,blank=True)
    lon = models.CharField(max_length=128,null=True,blank=True)
    isp = models.CharField(max_length=128,null=True,blank=True)
    mobile = models.BooleanField(null=True)
    proxy = models.BooleanField(null=True)
    last_visited = models.DateTimeField(default=timezone.now)

    def save_visitor(ip_info):
        visitor = Visitor(
            ip_address = ip_info['ip'],
            country = ip_info['country'],
            regionName = ip_info['regionName'],
            city = ip_info['city'],
            district = ip_info['district'],
            zip = ip_info['zip'],
            lat = ip_info['lat'],
            lon = ip_info['lon'],
            isp = ip_info['isp'],
            mobile = ip_info['mobile'],
            proxy = ip_info['proxy']
        ).save()

        
    def update_visitor_date(visitor):
        visitor.last_visited = timezone.now()
        visitor.save()


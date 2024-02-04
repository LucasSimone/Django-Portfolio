from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib import messages
from django.core.mail import send_mail

import requests
from .utils import *

from .forms import FeedbackForm
from .models import Testimonial


def home(request):
    return render(request, 'main_site/pages/home.html')

def projects(request):
    context = {
        'title': 'Projects',
    }
    return render(request, 'main_site/pages/projects.html', context)

def resume(request):
    context = {
        'title': 'Resume',
    }
    return render(request, 'main_site/pages/resume.html', context)

def about(request):
    context = {
        'title': 'About',
    }
    return render(request, 'main_site/pages/about.html', context)

def references(request):
    # Get data from databsse and send it to the page
    context = {
        'title': 'References',
    }
    return render(request, 'main_site/pages/references.html', context)

def geolocate(request):
    context = {
        'title': 'Geolocate',
    }

    ip = get_ip(request)
    url = 'http://ip-api.com/json/' + '99.233.26.66' + '?fields=status,message,country,regionName,city,district,zip,lat,lon,timezone,isp,mobile,proxy'
    response = requests.get(url)
    data = response.json()

    if(data['status'] == 'success'):
        del data['status']
        context['ip_info'] = data
    else:
        context['error_message'] = 'Sorry there was an issue with the api. Please try again.'

    return render(request, 'main_site/pages/geolocate.html', context)


def contact(request):
    context = {
        'title': 'Contact',
        'form' : FeedbackForm()
    }

    if request.method == 'POST':
        if 'contact_form' in request.POST:
            form = FeedbackForm(request.POST)
            if form.is_valid():
                # Caputre the IP and save
                instance = form.save(commit=False)
                instance.ip_address = get_ip(request)
                instance.save()

                body = "Name: " + form.cleaned_data['name'] + '\n' + "Email: " + form.cleaned_data['email'] + '\n' + "Content: " + form.cleaned_data['content']
                send_mail(
                    "Feedback from: " + form.cleaned_data['email'],
                    body,
                    'newmessage@nebulous.tech',
                    ['lucas.simone.careers@gmail.com'],
                )

                messages.success(request, f"Your message has been recived and I will get back to you as soon as possible. Thank you, I'm looking forward to connecting with you. - Lucas")
                return redirect('site-contact')
            else:
                context['form'] = form


    return render(request, 'main_site/pages/contact.html', context)

def page_not_found(request, exception):
    return render(request, 'main_site/pages/404.html')


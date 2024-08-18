from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib import messages

from .utils import *

from .forms import UnsubscribeForm, SubscribeForm
from .models import Contact


def subscribe(request):
    context = {
        'subscribe_form': SubscribeForm(),
        'anchor' : 'subscribe'
    }

    if request.method == 'POST':
        subscribe_form = SubscribeForm(request.POST)
        if subscribe_form.is_valid():
            # Caputre the IP and save
            instance = subscribe_form.save(commit=False)
            instance.ip_address = get_ip(request)
            instance.save()

            messages.success(
                request, 
                f'Thanks for reaching out! If you are looking to get in contact right away feel free to reach out through the email on my contact page.', 
                extra_tags='success'
            )
            return redirect('site-home')
        else:
            context['subscribe_form'] = subscribe_form

    return render(request, 'main_site/pages/home.html', context)

# Create your views here.
def unsubscribe(request):
    context = {
        'title': "Unsubscribe",
        'unsubscribe_form': UnsubscribeForm(),
    }

    if request.method == 'POST':
        unsubscribe_form = UnsubscribeForm(request.POST)
        if unsubscribe_form.is_valid():
            form_email = unsubscribe_form.cleaned_data['email']
            Contact.objects.filter(email=form_email).update(subscribed = False)

            messages.success(request, f'You have been sucessfuly unsubscribed. We are sorry to see you go.', extra_tags='success')
            return redirect('site-home')
        else:
            context['unsubscribe_form'] = unsubscribe_form

    return render(request, 'mailing/pages/unsubscribe.html', context)
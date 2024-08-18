from django import template
from django.conf import settings
register = template.Library()

@register.simple_tag
def get_recaptcha_key():
    return getattr(settings, 'RECAPTCHA_PUBLIC_KEY')
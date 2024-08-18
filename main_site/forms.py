from django.forms import ModelForm
from django.urls import reverse_lazy
from django import forms

from .utils import recaptcha_is_valid

from crispy_forms.helper import FormHelper
from crispy_bootstrap5.bootstrap5 import FloatingField
from crispy_forms.layout import Layout, Fieldset, Submit, Field, Div


from .models import Feedback

class FeedbackForm(ModelForm):

    recaptcha = forms.CharField(label='',required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            FloatingField("name"),
            FloatingField("email"),
            Field('content', placeholder="Message"),
            Field('recaptcha', css_class='d-none'),
            Div(Submit('contact_form', 'SUBMIT', css_class='gradient-button'),css_class='d-flex justify-content-end'),
        )
        self.helper.form_method = "POST"
        self.helper.form_action = 'site-contact'
        self.helper.form_id = 'contact'
        self.helper.attrs = {'data-recaptcha-action': 'contact'}
        self['content'].label = ''

    class Meta:
        model = Feedback
        fields = ['name','email','content']

    def clean_recaptcha(self):

        recaptcha = self.cleaned_data['recaptcha']

        if not recaptcha_is_valid(recaptcha):
            raise forms.ValidationError("The reCAPTCHA validation failed. Please try again.")

        return recaptcha


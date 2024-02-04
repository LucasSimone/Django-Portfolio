from django import forms
from django.core import validators

from crispy_forms.helper import FormHelper
from crispy_bootstrap5.bootstrap5 import FloatingField
from crispy_forms.layout import Layout, Fieldset, Submit, Field, Div

from .models import Contact


class SubscribeForm(forms.ModelForm):

    subscribed = forms.BooleanField(
        label="I consent to recieve emails in the future.",
        error_messages={"required": "You must accept our terms of service"},
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            FloatingField("email"),
            Div(
                Div(Field('subscribed', css_class="form-check-input", wrapper_class="form-check form-switch"),css_class='col-sm-8',),
                Div(Submit('subscribe_form', 'Submit', css_class='gradient-button float-end'),css_class='col-sm-4',),
                css_class='row d-flex justify-content-between',
                
            ),
            
        )
        self.helper.label_classes = ('text-muted', 'class_b', )
        self.helper.form_method = "POST"
        self.helper.form_action = "subscribe"

    class Meta:
        model = Contact
        fields = ['email','subscribed']

class UnsubscribeForm(forms.Form):

    email = forms.CharField(validators=[validators.EmailValidator()])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            FloatingField('email'),
            Submit('unsubscribe_form', 'Submit', css_class='button white'),
        )
        self.helper.form_method = "POST"

    def clean_email(self):
        email = self.cleaned_data['email']
        
        if not Contact.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is not subscribed.")
        
        if Contact.objects.get(email=email).subscribed == False:
            raise forms.ValidationError("This email is already unsubscribed")
        
        return email

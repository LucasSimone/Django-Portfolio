from django.forms import ModelForm
from django import forms

from crispy_forms.helper import FormHelper
from crispy_bootstrap5.bootstrap5 import FloatingField
from crispy_forms.layout import Layout, Fieldset, Submit, Field, Div

from .models import Feedback

class FeedbackForm(ModelForm):

    # content = forms.CharField(widget=forms.Textarea,)
    # # label_2 uses a widget with custom attribute(s)
    # label_2 = forms.CharField(label='label2', widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    # label_3 = forms.CharField(label='label3',help_text='This is help text', widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            FloatingField("name"),
            FloatingField("email"),
            Field('content', placeholder="Message"),
            Div(Submit('contact_form', 'Submit', css_class='gradient-button'),css_class='d-flex justify-content-end'),
        )
        self.helper.form_method = "POST"
        self['content'].label = ''

    class Meta:
        model = Feedback
        fields = ['name','email','content']

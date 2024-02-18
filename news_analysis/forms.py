from django import forms

from crispy_forms.helper import FormHelper
from crispy_bootstrap5.bootstrap5 import FloatingField
from crispy_forms.layout import Layout, Fieldset, Submit, Field, Div


class ArticleDateForm(forms.Form):

    # content = forms.CharField(widget=forms.Textarea,)
    # # label_2 uses a widget with custom attribute(s)
    # label_2 = forms.CharField(label='label2', widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    # label_3 = forms.CharField(label='label3',help_text='This is help text', widget=forms.Textarea)

    start_date = forms.DateField(
            widget=forms.TextInput(
                attrs={'type': 'date'}
            )
        )
    
    end_date = forms.DateField(
            widget=forms.TextInput(
                attrs={'type': 'date',}
            )
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Div(
                Div(Field('start_date'),css_class='col-12 col-lg-3 col-md-4 mb-2 mb-md-0 d-flex align-items-center justify-content-center text-center py-2 py-md-3 border border-secondary rounded'),
                Div(Field('end_date'),css_class='col-12 col-lg-3 col-md-4 mb-2 mb-md-0 d-flex align-items-center justify-content-center text-center py-2 py-md-3 border border-secondary rounded'),
                Div(Submit('article_date_form', 'Submit', css_class='gradient-button'),css_class='col-12 col-md-3 mb-2 mb-md-0 d-flex align-items-center justify-content-center text-center py-2 py-md-3'),
                css_class="row d-md-flex justify-content-center justify-content-md-between",
            ),
        )
        self.helper.form_method = "POST"
        self.helper.form_class = 'm-0'

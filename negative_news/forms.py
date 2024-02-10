
from django import forms
from django.core import validators

from crispy_forms.helper import FormHelper
from crispy_bootstrap5.bootstrap5 import FloatingField
from crispy_forms.layout import Layout, Fieldset, Submit, Field, Div


class ArticleSearch(forms.Form):

    search_term = forms.CharField(label="Search Term")
    from_date = forms.DateField(
        widget=forms.TextInput(     
            attrs={'type': 'date'},
        ),
        required=False,
        label="From"
    )
    to_date = forms.DateField(
        widget=forms.TextInput(     
            attrs={'type': 'date'},
        ),
        required=False,
        label="To"
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Div(
                Div(Field('search_term',),css_class='col-2',),
                Div(Field('from_date',),css_class='col-2',),
                Div(Field('to_date',),css_class='col-2',),
                Div(Submit('article_search_form', 'Submit', css_class='button white'),css_class='col-1',),
                css_class='row d-flex justify-content-evenly align-items-center py-2',
            ),
        )
        self.helper.form_method = "POST"
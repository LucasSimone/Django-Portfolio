from django.shortcuts import render
from django.contrib import messages

import datetime

from .models import Article
from .forms import ArticleDateForm

def home(request):
    context = {
        'title': 'News Home',
    }
    
    return render(request, 'news_analysis/pages/home.html')

def analysis(request):

    # Default Date range
    start_date = datetime.date.today() - datetime.timedelta(days=1)
    end_date = datetime.date.today()

    context = {
        'title': 'News Analysis',
        'article_date_form': ArticleDateForm({'start_date': start_date,'end_date':end_date}),
    }

    if request.method == 'POST':
        if 'article_date_form' in request.POST:
            article_date_form = ArticleDateForm(request.POST)
            if article_date_form.is_valid():
                start_date = article_date_form.cleaned_data['start_date']
                end_date = article_date_form.cleaned_data['end_date']

                context['article_date_form'] = article_date_form

            else:
                context['article_date_form'] = article_date_form

    context['articles'] = Article.objects.filter(date_added__gte = start_date, date_added__lte=end_date)
    
    pos=0
    neg=0
    if context['articles']:
        for article in context['articles']:
            if(article.ai_analysis == "POSITIVE" or article.ai_analysis == "POSITIVE."):
                pos += 1
            if(article.ai_analysis == "NEGATIVE" or article.ai_analysis == "NEGATIVE."):
                neg += 1
        if(pos>neg):
            context['outlook'] = "Positive"
        elif(neg>pos):
            context['outlook'] = "Negative"
        else:
            context['outlook'] = "Neutral"
    else:
        context['outlook'] = "None"



    return render(request, 'news_analysis/pages/analysis.html', context)


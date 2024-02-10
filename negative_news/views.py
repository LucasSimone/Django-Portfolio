from django.shortcuts import render
from django.http import HttpResponse

from django.conf import settings
from newsapi import NewsApiClient

from .forms import ArticleSearch



def home(request):
    context = {
        'title': 'NN',
    }
    
    return render(request, 'negative_news/pages/home.html')

def tool(request):
    context = {
        'title': 'NN',
        'search_form': ArticleSearch()
    }

    if request.method == 'POST':
        if 'article_search_form' in request.POST:
            form = ArticleSearch(request.POST)
            if form.is_valid():
                # # Init
                api = NewsApiClient(api_key=settings.NEWS_API_KEY)

                response = api.get_sources(country='ca')

                for source in response['sources']:
                    print(source['id'])

                # print(settings.NEWS_API_KEY)
                # response = api.get_everything(
                #     q=form.cleaned_data['search_term'],
                #     country='canada',
                # )

                # if(response['status'] == 'ok'):
                #     context['articles'] = response['articles']


            else:
                context['form'] = form

    # # Init
    # api = NewsApiClient(api_key=settings.NEWS_API_KEY)

    # # print(settings.NEWS_API_KEY)
    # response = api.get_everything(q='bitcoin')

    # print(response['status'])
    # print(response['totalResults'])

    # if(response['status'] == 'ok'):
    #     context['articles'] = response['articles']


    return render(request, 'negative_news/pages/tool.html', context)

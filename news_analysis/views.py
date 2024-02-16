from django.shortcuts import render
from django.http import HttpResponse

from django.conf import settings
import datetime
from newsapi import NewsApiClient
from openai import OpenAI

from .models import Article

def home(request):
    context = {
        'title': 'News Home',
    }
    
    return render(request, 'news_analysis/pages/home.html')

def analysis(request):
    context = {
        'title': 'News Analysis',
    }

    yesterday = datetime.date.today() - datetime.timedelta(days=1)
    today = datetime.date.today()

    context['articles'] = Article.objects.filter(date_added__gte = yesterday, date_added__lte=today)
    
    pos=0
    neg=0
    for article in context['articles']:
        print(article)
        print(article.ai_analysis)
        if(article.ai_analysis == "POSITIVE"):
            pos += 1
        if(article.ai_analysis == "NEGATIVE"):
            neg += 1
    if(pos>neg):
        context['outlook'] = "Positive"
    elif(neg>pos):
        context['outlook'] = "Negative"
    else:
        context['outlook'] = "Neutral"

    # get_daily_news()


    # Get articles from the database with date and return them


    return render(request, 'news_analysis/pages/analysis.html', context)




def get_daily_news():
    # Every day we are going to get x articles and analyze them
    # # Init
    api = NewsApiClient(api_key=settings.NEWS_API_KEY)

    
    yesterday = datetime.date.today() - datetime.timedelta(days=1)
    today = datetime.date.today()

    # Get the top 5 articles of the day
    response = api.get_everything('bitcoin', None, None, None, None, yesterday, today, 'en', 'popularity', None, 10)


    if(response['status'] == 'ok'):
        client = OpenAI(api_key=settings.GPT_API_KEY)
        for article in response['articles']:
            print(article['publishedAt'])
            # Check if article already exists based on URL
            if not Article.objects.filter(url=article['url']).exists():
                completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", 
                    "content": "You are an expert financial analyst, tasked with reading daily news articles about bitcoin and providing a one word opinion on whether the article positive(meaning the price will increase) or negative(meaning the price will decrease) for bitcoin."},
                    {"role": "user", "content": article['url']}
                ])
                article['ai_analysis'] = completion.choices[0].message.content.upper()

                Article.save_article(article)

    # print("get_daily_news() run at : ", datetime.datetime.now())
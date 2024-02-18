import datetime
from django.conf import settings

from .models import Article

from newsapi import NewsApiClient
from openai import OpenAI

def get_daily_news():
    # Every day we are going to get x articles and analyze them
    # # Init
    api = NewsApiClient(api_key=settings.NEWS_API_KEY)

    
    yesterday = datetime.date.today() - datetime.timedelta(days=1)
    today = datetime.date.today()

    # Get the top 50 articles of the day
    response = api.get_everything('bitcoin', None, None, None, None, yesterday, today, 'en', 'popularity', None, 50)


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
                    "content": "You are an expert financial analyst, tasked with reading daily news articles about bitcoin and providing a one word opinion on whether the article positive(meaning the price will increase), negative(meaning the price will decrease) for bitcoin, or neutral. If you are unable to read the article respond with: error. If the article is not relevant or doesn't fit into any other category respond with N/A."},
                    {"role": "user", "content": article['url']}
                ])

                if(not completion.choices[0].message.content.upper() == 'ERROR'):
                    article['ai_analysis'] = completion.choices[0].message.content.upper()
                    Article.save_article(article)

    print("get_daily_news() run at : ", datetime.datetime.now())

def get_past_10():
    api = NewsApiClient(api_key=settings.NEWS_API_KEY)

    for i in range(10):
        print(i+1)
        start = datetime.date.today() - datetime.timedelta(days=i+1)
        end = datetime.date.today()- datetime.timedelta(days=i)

        # Get the top 50 articles of the day
        response = api.get_everything('bitcoin', None, None, None, None, start, end, 'en', 'popularity', None, 50)


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
                        "content": "You are an expert financial analyst, tasked with reading daily news articles about bitcoin and providing a one word opinion on whether the article positive(meaning the price will increase), negative(meaning the price will decrease) for bitcoin, or neutral. If you are unable to read the article respond with: error. If the article is not relevant or doesn't fit into any other category respond with N/A."},
                        {"role": "user", "content": article['url']}
                    ])

                    if(not completion.choices[0].message.content.upper() == 'ERROR'):
                        article['ai_analysis'] = completion.choices[0].message.content.upper()
                        Article.save_article(article)
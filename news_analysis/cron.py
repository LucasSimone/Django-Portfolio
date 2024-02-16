import datetime
from django.conf import settings

from newsapi import NewsApiClient
from openai import OpenAI

def get_daily_news():
    # Every day we are going to get x articles and analyze them
    # # Init
    api = NewsApiClient(api_key=settings.NEWS_API_KEY)

    
    yesterday = datetime.date.today() - datetime.timedelta(days=1)
    today = datetime.date.today()

    response = api.get_everything('bitcoin', None, None, None, None, '2024-02-12', '2024-02-13', 'en', 'popularity', 5, 5)

    # print(response)

    # if(response['status'] == 'ok'):
    #     article_context = response['articles']
    #     client = OpenAI(api_key=settings.GPT_API_KEY)
    #     for article in article_context:
    #         completion = client.chat.completions.create(
    #         model="gpt-3.5-turbo",
    #         messages=[
    #             {"role": "system", 
    #             "content": "You are an expert financial analyst, tasked with reading daily news articles about bitcoin and providing a one word opinion on whether the article positive(meaning the price will increase) or negative(meaning the price will decrease) for bitcoin."},
    #             {"role": "user", "content": article['url']}
    #         ])
    #         article['ai_analysis'] = completion.choices[0].message.content
    #     context['articles'] = article_context


    print("get_daily_news() run at : ", datetime.datetime.now())
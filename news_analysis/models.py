from django.db import models
from django.utils import timezone
import datetime


# Create your models here.

class Article(models.Model):
    url = models.URLField(null=True,blank=True)
    source = models.CharField(max_length=255,null=True,blank=True)
    author = models.CharField(max_length=255,null=True,blank=True)
    title = models.CharField(max_length=255,null=True,blank=True)
    description = models.TextField(null=True,blank=True)
    ai_analysis = models.CharField(max_length=255,null=True,blank=True)
    date_added = models.DateField(default=timezone.now)

    def __str__(self):
        return self.url

    def save_article(article_info):
        article = Article(
            url = article_info['url'],
            source = article_info['source']['name'],
            author = article_info['author'],
            title = article_info['title'],
            description = article_info['description'],
            ai_analysis = article_info['ai_analysis'],
            date_added = article_info['publishedAt'][:10],
        ).save()
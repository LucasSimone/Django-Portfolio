from django.contrib import admin

from .models import Article
# Register your models here.


class ArticleAdmin(admin.ModelAdmin):
    search_fields = ['url', 'source', 'title', 'description', 'ai_analysis', 'date_added']
    list_display = ('url', 'source', 'title', 'ai_analysis', 'date_added')
    list_filter = ('source', 'date_added', 'ai_analysis')


admin.site.register(Article, ArticleAdmin)
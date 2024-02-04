from django.contrib import admin
from django.db import models
from .models import EmailTemplate, Contact, Deployment, MailingList


class ContactAdmin(admin.ModelAdmin):
    search_fields = ['email', 'first_name', 'last_name', 'date_recieved', 'ip_address']
    list_display = ('email', 'first_name', 'last_name', 'date_recieved', 'ip_address')
    list_filter = ('date_recieved', 'ip_address', 'subscribed')
    readonly_fields=('subscribed',)

class EmailTemplateAdmin(admin.ModelAdmin):
    search_fields = ['title', 'docket', 'subject', 'preview', 'html']
    list_display = ('title', 'docket', 'subject', 'preview')
    list_filter = ('date_created',)

class MailingListAdmin(admin.ModelAdmin):
    search_fields = ['title', 'contact_list',]
    list_display = ('title', 'list_size')
    filter_horizontal = ('contact_list',)

    def list_size(self,obj):
        return obj.contact_list.count()
    
class DeploymentAdmin(admin.ModelAdmin):
    search_fields = ['deployment_date', 'deployment_time', 'mailing_list', 'email_template',]
    list_display = ('deployment_date', 'deployment_time', 'mailing_list', 'email_template')
    list_filter = ('deployment_date', 'deployment_time', 'mailing_list', 'email_template')

    fieldsets = (
        ('Date & Time', {
            'fields': (('deployment_date', 'deployment_time'),)
        }),
        ('Details', {
            'fields': ('mailing_list', 'email_template')
        }),
    )

    def list_size(self,obj):
        return obj.mailing_list.contact_list.count()
    

admin.site.register(Contact, ContactAdmin)
admin.site.register(EmailTemplate, EmailTemplateAdmin)
admin.site.register(MailingList, MailingListAdmin)
admin.site.register(Deployment, DeploymentAdmin)
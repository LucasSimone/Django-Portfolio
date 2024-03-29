from django.contrib import admin
from .models import Feedback, Testimonial, Visitor


# Example of how to edit Model options in the admin
class ExampleModel(admin.ModelAdmin):
    # Add fields to this list to be able to search through them
    search_fields = ['',]
    # Add fields to this list to display them in the table view
    list_display = ('',)
    # Add fields to this list to edit them in the table view
    list_editable = ('',)
    # Shows the filter sidebar
    list_filter = ('',)
    #Number of rows to show
    list_per_page = 400

    # Add fields to this list to prevent them from being edited
    readonly_fields=('',)

    # To add an action to the list 
    actions = ["function_name"]

    # Populate a field from other fields with hyphens inbetween 
    prepopulated_fields = {"field": ['field1','field2']}

    #To group fields onto the same row
    fields = [('', ''), '']
    #To Group fields under different sections 
    fieldsets = (
        ('title', {
            'fields': ('',)
        }),
        ('title', {
            'fields': ('',)
        }),
    )

    # Custom values in the list display
    list_display = ('function_name')
    def function_name(self, obj):
        return obj.priority


class FeedbackAdmin(admin.ModelAdmin):
    search_fields = ['name', 'email', 'date_recieved', 'ip_address', 'content', 'priority']
    list_display = ('id', 'name', 'email', 'date_recieved', 'ip_address', 'priority')
    list_editable = ('priority',)
    list_filter = ('date_recieved', 'priority')
    list_per_page = 20

    fieldsets = (
        ('Details', {
            'fields': ('name', 'email','ip_address','date_recieved', 'priority')
        }),
        ('Feedback', {
            'fields': ('content',)
        }),
    )
    
    # classes = ["collapse"]

class TestimonialAdmin(admin.ModelAdmin):
    search_fields = ['name', 'description', 'content', 'date_recieved']
    list_display = ('id', 'name', 'description', 'date_recieved')

    list_filter = ('date_recieved',)

class VisitorAdmin(admin.ModelAdmin):
    search_fields = ['ip_address', 'country', 'regionName', 'city','isp']
    list_display = ('ip_address', 'country', 'regionName', 'city',)
    list_filter = ('country', 'regionName', 'city', 'isp', 'mobile')


admin.site.register(Visitor, VisitorAdmin)
admin.site.register(Testimonial, TestimonialAdmin)
admin.site.register(Feedback, FeedbackAdmin)

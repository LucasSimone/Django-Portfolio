# Generated by Django 4.2.9 on 2024-02-02 00:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mailing', '0012_remove_mailinglist_group_list_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mailinglist',
            name='select_all',
        ),
    ]

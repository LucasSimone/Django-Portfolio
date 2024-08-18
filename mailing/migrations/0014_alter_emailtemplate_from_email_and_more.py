# Generated by Django 4.2.9 on 2024-08-15 21:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mailing', '0013_remove_mailinglist_select_all'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emailtemplate',
            name='from_email',
            field=models.CharField(default='contact@nebulous.tech', max_length=255),
        ),
        migrations.AlterField(
            model_name='emailtemplate',
            name='from_name',
            field=models.CharField(default='nebulous.tech', max_length=255),
        ),
    ]

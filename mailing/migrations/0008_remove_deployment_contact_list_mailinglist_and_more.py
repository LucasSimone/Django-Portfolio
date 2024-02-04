# Generated by Django 4.2.9 on 2024-02-01 22:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mailing', '0007_rename_email_template_emailtemplate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='deployment',
            name='contact_list',
        ),
        migrations.CreateModel(
            name='MailingList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('contact_list', models.ManyToManyField(to='mailing.contact')),
            ],
        ),
        migrations.AddField(
            model_name='deployment',
            name='mailing_list',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='mailing.mailinglist'),
        ),
    ]

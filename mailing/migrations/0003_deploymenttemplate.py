# Generated by Django 4.2.9 on 2024-02-01 02:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mailing', '0002_contact_subscribed_alter_emailtemplate_from_email_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeploymentTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deployment_date', models.DateTimeField()),
                ('contact_list', models.ManyToManyField(to='mailing.contact')),
                ('email_template', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='mailing.emailtemplate')),
            ],
        ),
    ]

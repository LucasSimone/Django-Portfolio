# Generated by Django 4.2.9 on 2024-02-05 01:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_site', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Visitor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('country', models.CharField(blank=True, max_length=128, null=True)),
                ('regionName', models.CharField(blank=True, max_length=128, null=True)),
                ('city', models.CharField(blank=True, max_length=128, null=True)),
                ('district', models.CharField(blank=True, max_length=128, null=True)),
                ('zip', models.CharField(blank=True, max_length=128, null=True)),
                ('lat', models.CharField(blank=True, max_length=128, null=True)),
                ('lon', models.CharField(blank=True, max_length=128, null=True)),
                ('isp', models.CharField(blank=True, max_length=128, null=True)),
                ('mobile', models.BooleanField(null=True)),
                ('proxy', models.BooleanField(null=True)),
            ],
        ),
    ]

# Generated by Django 3.1.4 on 2020-12-17 11:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenantsys', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='schema_name',
            field=models.CharField(max_length=100),
        ),
    ]
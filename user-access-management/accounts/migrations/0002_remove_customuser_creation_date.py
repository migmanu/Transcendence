# Generated by Django 5.1.5 on 2025-01-17 16:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="customuser",
            name="creation_date",
        ),
    ]

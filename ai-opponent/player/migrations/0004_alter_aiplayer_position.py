# Generated by Django 3.2.21 on 2025-02-07 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0003_alter_aiplayer_position'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aiplayer',
            name='position',
            field=models.FloatField(),
        ),
    ]

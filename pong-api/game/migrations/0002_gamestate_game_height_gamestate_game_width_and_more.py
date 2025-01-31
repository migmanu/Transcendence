# Generated by Django 5.1.4 on 2025-01-22 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamestate',
            name='game_height',
            field=models.IntegerField(default=1200),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='game_width',
            field=models.IntegerField(default=1600),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='paddle_height',
            field=models.IntegerField(default=10),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='paddle_offset',
            field=models.IntegerField(default=10),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='paddle_width',
            field=models.IntegerField(default=10),
        ),
    ]

# Generated by Django 5.1.4 on 2025-01-21 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AIPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ai_player_id', models.IntegerField()),
                ('target_game_id', models.IntegerField()),
            ],
        ),
    ]

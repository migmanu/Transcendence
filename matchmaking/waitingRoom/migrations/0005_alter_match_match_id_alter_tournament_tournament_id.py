# Generated by Django 5.0.9 on 2025-01-31 10:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('waitingRoom', '0004_remove_match_waitingroom_player__78ac49_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='tournament_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]

# Generated by Django 5.1.4 on 2025-01-29 13:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0006_alter_gamestate_paddle_width'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamestate',
            name='ball_radius',
            field=models.IntegerField(default=20),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='move_step',
            field=models.IntegerField(default=10),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='paddle_offset',
            field=models.IntegerField(default=20),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='paddle_width',
            field=models.IntegerField(default=10),
        ),
    ]

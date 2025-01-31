# Generated by Django 5.1.4 on 2025-01-31 12:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_gamestate_ball_diameter_gamestate_move_step_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamestate',
            name='ball_speed',
            field=models.FloatField(default=12),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='ball_radius',
            field=models.IntegerField(default=10),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='ball_x_direction',
            field=models.FloatField(default=3),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='ball_x_position',
            field=models.FloatField(default=290),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='ball_y_direction',
            field=models.FloatField(default=3),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='ball_y_position',
            field=models.FloatField(default=190),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='max_score',
            field=models.PositiveIntegerField(default=30),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='player_1_position',
            field=models.FloatField(default=160),
        ),
        migrations.AlterField(
            model_name='gamestate',
            name='player_2_position',
            field=models.FloatField(default=160),
        ),
    ]

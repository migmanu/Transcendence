# Generated by Django 5.1.4 on 2025-01-15 11:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('game', '0003_alter_gamestate_ball_x_velocity_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gamestate',
            name='players',
        ),
        migrations.AddField(
            model_name='gamestate',
            name='player_1',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player_1_games', to='game.player'),
        ),
        migrations.AddField(
            model_name='gamestate',
            name='player_2',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player_2_games', to='game.player'),
        ),
        migrations.AddField(
            model_name='player',
            name='player_direction',
            field=models.IntegerField(default=150),
        ),
        migrations.AddField(
            model_name='player',
            name='player_position',
            field=models.IntegerField(default=150),
        ),
        migrations.AddField(
            model_name='player',
            name='player_score',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='player',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='game_player_set', to='auth.group', verbose_name='groups'),
        ),
        migrations.AlterField(
            model_name='player',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='game_player_set', to='auth.permission', verbose_name='user permissions'),
        ),
        migrations.DeleteModel(
            name='GamePlayer',
        ),
    ]

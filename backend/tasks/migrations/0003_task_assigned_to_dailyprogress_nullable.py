# Generated manually on 2026-05-10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='assigned_to',
            field=models.ForeignKey(
                blank=True,
                help_text='Specific user this task is assigned to (for personal or targeted tasks)',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='assigned_tasks',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='dailyprogress',
            name='group',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to='users.group',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='dailyprogress',
            unique_together=set(),
        ),
    ]

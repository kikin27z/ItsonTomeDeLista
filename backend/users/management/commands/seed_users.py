from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seeding users data into the database'
    def handle(self, *args, **options):
        self.stdout.write('Starting seeding users data')


        self.stdout.write('Finishing seeding users data')

        return super().handle(*args, **options)
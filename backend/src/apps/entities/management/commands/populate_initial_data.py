from apps.entities.models import *
from collections import defaultdict
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.db import transaction as django_transaction
from django.utils import timezone
from faker import Faker
import logging
import random

# Logging basic configuration
logger = logging.getLogger(__name__)

# Initializes Faker, defining brazilian language
fake = Faker('pt_BR')

def create_data(number_of_users=10):
    
    logger.info("Starting initial data creation")

    # Get the current timezone from Django settings to make datetimes timezone-aware
    tz = timezone.get_current_timezone()

    wallet_history_to_create = []

    # Create Users
    logger.info('Creating users...')
    try:
        users_to_insert = []

        for i in range(1, number_of_users + 1):
            full_name = fake.name()
            name_parts = full_name.split()
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            cpf = fake.cpf()
            username = f'{first_name.lower()}{i}'
            email = f'{username}@recicash.fake'
            zip_code = fake.postcode()
            access_level = 'U'

            user = User(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                cpf=cpf,
                zip_code=zip_code,
                access_level=access_level
            )
            user.set_password('senha123')  # Sets password securely
            users_to_insert.append(user)

        created_users = User.objects.bulk_create(users_to_insert)
        logger.info(f"Users created successfully: {len(created_users)} users")

    except Exception as e:
        logger.error(f"An unexpected error occurred while creating users: {e}")
        return

    # Create Recycling Points and its managers
    logger.info(f"Creating Recycling Points...")
    created_managers = []

    for i in range(1, 11):
        try:
            with django_transaction.atomic():
                manager_full_name = fake.name()
                name_parts = manager_full_name.split()
                first_name = name_parts[0]
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                
                manager_username = f'manager_{first_name.lower()}{i}'
                manager_email = f'{manager_username}@recicash.point'
                
                new_manager = User(
                    username=manager_username,
                    first_name=first_name,
                    last_name=last_name,
                    email=manager_email,
                    cpf=fake.cpf(),
                    zip_code=fake.postcode(),
                    access_level='M'
                )
                new_manager.set_password('senha123')
                new_manager.save()
                created_managers.append(new_manager)

                RecyclingPoint.objects.create(
                    user_id=new_manager,
                    name=f"Ecoponto {fake.city()}",
                    cnpj=fake.cnpj(),
                    zip_code=fake.postcode(),
                    latitude=float(fake.latitude()),
                    longitude=float(fake.longitude())
                )
            logger.info(f"Recycling Point {i} and manager created successfully")
        
        except Exception as e:
            logger.error(f"Error creating Recycling Point {i} and its manager: {e}")
            continue

    logger.info(f"Total Recycling Points created: {RecyclingPoint.objects.count()}")

    # Create Recycling Value
    logger.info(f"Creating Recycling value...")
    try:
        recycling_value = RecyclingValue.objects.create(
            points_value=500.0,
            date=timezone.now() - timedelta(days=366)
        )
        logger.info(f"Recycling value created successfully")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Recycling Value: {e}")
        return
    
    # Create Recycling
    logger.info(f"Creating Recycling records...")
    try:
        all_users = list(User.objects.filter(access_level='U'))
        all_recycling_points = list(RecyclingPoint.objects.all())

        if not all_users:
            logger.error("No users found to link up with recyclings. Aborting.")
            return
        if not all_recycling_points:
            logger.error("No recycling points found to link up with recyclings. Aborting.")
            return
        
        recyclings_to_create = []

        for i in range(1, 201):
            random_user = random.choice(all_users)
            random_point = random.choice(all_recycling_points)

            weight_value = round(random.uniform(0.5, 5.0), 2)
            points = int(weight_value * recycling_value.points_value)

            recyclings_to_create.append(
                Recycling(
                    user_id=random_user,
                    recycling_point_id=random_point,
                    recycling_value_id=recycling_value,
                    points_value=points,
                    weight=weight_value,
                    date=fake.past_datetime(start_date="-1y", tzinfo=tz),
                    validation_hash=fake.sha256()
                )
            )
        
        recyclings_created = Recycling.objects.bulk_create(recyclings_to_create)
        logger.info(f"Recycling records created successfully: {len(recyclings_created)} records")

        for recycling in recyclings_created:
            wallet_history_to_create.append(
                WalletHistory(
                    user_id=recycling.user_id,
                    operation='RECYCLING',
                    value=recycling.points_value,
                    date=recycling.date
                )
            )
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Recycling records: {e}")

    # Create Partner Companies
    logger.info(f"Creating Partner Companies...")
    try:
        partners_to_create = []
        for i in range(1, 21):
            partners_to_create.append(
                PartnerCompany(
                    name=fake.company(),
                    cnpj=fake.cnpj()
                )
            )
        
        created_partners = PartnerCompany.objects.bulk_create(partners_to_create)
        logger.info(f"Partner Companies created successfully: {len(created_partners)} companies")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Partner Companies: {e}")
    
    # Create Coupons
    logger.info(f"Creating coupons...")
    try:
        all_partners = list(PartnerCompany.objects.all())
        coupon_types = ['PERCENTAGE_DISCOUNT', 'DIRECT_DISCOUNT', 'GIFT']

        if not all_partners:
            logger.warning("No partner companies found. Skipping coupon creation.")
        else:
            coupons_to_create = []
            for i in range(1, 301):
                random_partner = random.choice(all_partners)
                coupon_type = random.choice(coupon_types)

                start_date = fake.past_datetime(start_date='-1y', tzinfo=tz)
                expiring_date = start_date + timedelta(days=random.randint(30, 120))
                
                # Adjust value based on coupon type
                if coupon_type == 'PERCENTAGE_DISCOUNT':
                    value = random.randint(5, 50)  # 5% to 50%
                elif coupon_type == 'DIRECT_DISCOUNT':
                    value = random.randint(10, 100)  # R$ 10 to R$ 100
                else:  # GIFT
                    value = 1  # Quantity or boolean indicator
                
                coupons_to_create.append(
                    Coupon(
                        partner_company_id=random_partner,
                        coupon_type=coupon_type,
                        value=value,
                        points_cost=random.randint(100, 2500),
                        validation_hash=fake.sha256(),
                        start_date=start_date,
                        expiring_date=expiring_date
                    )
                )
            created_coupons = Coupon.objects.bulk_create(coupons_to_create)
            logger.info(f"Coupons created successfully: {len(created_coupons)} coupons")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating coupons: {e}")
    
    # Create Coupon Transactions
    logger.info(f"Creating coupon transactions...")
    try:
        all_users = list(User.objects.filter(access_level='U'))
        all_coupons = list(Coupon.objects.all())

        if not all_users or not all_coupons:
            logger.warning("No users or coupons found. Skipping coupon transaction creation.")
        else:
            transactions_to_create = []
            for i in range(1, 101):
                random_user = random.choice(all_users)
                random_coupon = random.choice(all_coupons)
                
                transactions_to_create.append(
                    CouponsTransactions(
                        user_id=random_user,
                        coupon_id=random_coupon,
                        points_value=random_coupon.points_cost,
                        date=fake.past_datetime(start_date="-1y", tzinfo=tz)
                    )
                )
            transactions_created = CouponsTransactions.objects.bulk_create(transactions_to_create)
            logger.info(f"Coupon transactions created successfully: {len(transactions_created)} transactions")

            for transaction in transactions_created:
                wallet_history_to_create.append(
                    WalletHistory(
                        user_id=transaction.user_id,
                        operation='COUPON_TRANSACTION',
                        value=-transaction.points_value,
                        date=transaction.date
                    )
                )
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating coupon transactions: {e}")

    # Create WalletHistory
    logger.info("Creating Wallet History records...")
    if not wallet_history_to_create:
        logger.warning("No history items to create. Skipping.")
    else:
        try:
            created_history = WalletHistory.objects.bulk_create(wallet_history_to_create)
            logger.info(f"Wallet history records created successfully: {len(created_history)} records")
        except Exception as e:
            logger.error(f"An unexpected error occurred while creating wallet history: {e}")
    
    # Create Blog Posts
    logger.info(f"Creating blog posts...")
    try:
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'first_name': 'Admin',
                'last_name': 'Recicash',
                'email': 'admin@recicash.fake',
                'cpf': fake.cpf(),
                'zip_code': fake.postcode(),
                'access_level': 'A'
            }
        )
        
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            logger.info("Admin user created.")
        else:
            logger.info("Admin user already exists.")

        posts_to_create = []
        blog_titles = [
            "A Importância da Reciclagem para o Meio Ambiente",
            "Como Separar Corretamente Seus Resíduos",
            "Materiais Recicláveis que Você Pode Não Conhecer",
            "O Impacto do Plástico nos Oceanos",
            "Economia Circular: O Futuro da Sustentabilidade"
        ]
        
        for i, title in enumerate(blog_titles, 1):
            posts_to_create.append(
                PostBlog(
                    author_id=admin_user,
                    title=title,
                    text=fake.text(max_nb_chars=1500),
                    images="https://placehold.co/800x400/22c55e/ffffff?text=Recicash+Blog",
                    created_at=timezone.now() - timedelta(days=random.randint(1, 180)),
                    last_edition_date=timezone.now()
                )
            )
        
        created_posts = PostBlog.objects.bulk_create(posts_to_create)
        logger.info(f"Blog posts created successfully: {len(created_posts)} posts")

    except Exception as e:
        logger.error(f"An unexpected error occurred while creating blog posts: {e}")

    # Create Wallets
    logger.info("Calculating final balances and creating wallets for all users...")
    try:
        user_balances = defaultdict(int)
        for history_item in wallet_history_to_create:
            user_balances[history_item.user_id] += history_item.value

        wallets_to_create = []
        all_system_users = User.objects.all()

        for user in all_system_users:
            balance = user_balances.get(user, 0)
            wallets_to_create.append(
                Wallet(user_id=user, points_balance=balance)
            )
        
        Wallet.objects.all().delete()
        created_wallets = Wallet.objects.bulk_create(wallets_to_create)
        logger.info(f"Wallets created successfully: {len(created_wallets)} wallets")

    except Exception as e:
        logger.error(f"An unexpected error occurred while creating wallets: {e}")

    logger.info("="*60)
    logger.info("Initial data creation completed successfully!")
    logger.info(f"Summary:")
    logger.info(f"  - Users: {User.objects.count()}")
    logger.info(f"  - Recycling Points: {RecyclingPoint.objects.count()}")
    logger.info(f"  - Recyclings: {Recycling.objects.count()}")
    logger.info(f"  - Partner Companies: {PartnerCompany.objects.count()}")
    logger.info(f"  - Coupons: {Coupon.objects.count()}")
    logger.info(f"  - Coupon Transactions: {CouponsTransactions.objects.count()}")
    logger.info(f"  - Wallet History: {WalletHistory.objects.count()}")
    logger.info(f"  - Blog Posts: {PostBlog.objects.count()}")
    logger.info(f"  - Wallets: {Wallet.objects.count()}")
    logger.info("="*60)


class Command(BaseCommand):
    help = 'Populates the database with initial, necessary data for the application to run.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--total', 
            type=int, 
            default=10, 
            help='Number of fake users to create'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting database population...'))
        create_data(options['total'])
        self.stdout.write(self.style.SUCCESS('Population command executed successfully!'))

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
            name = fake.name()
            cpf = fake.cpf()
            email = f'{name.split()[0].lower()}{i}@recicash.fake'
            zip_code = fake.postcode()
            access_level = 'U'

            users_to_insert.append(
                User(
                    user_id = f'{i:06}',
                    name=name,
                    email=email,
                    cpf=cpf,
                    zip_code=zip_code,
                    access_level=access_level
                    # fav_recycling_point = 
                )
            )

        created_users = User.objects.bulk_create(users_to_insert)
        logger.info(f"Users created successfully")

    except Exception as e:
        logger.error(f"An unexpected error occurred while creating users: {e}")
        return
    
    logger.info("Creating Passwords and Wallets for initial users...")
    passwords_to_insert = []
    for user in created_users:
        passwords_to_insert.append(Password(user_id=user, password='safe_hash_password'))

    try:
        Password.objects.bulk_create(passwords_to_insert)
        logger.info(f"Passwords and Wallets created successfully for {len(created_users)} users")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Passwords and Wallets: {e}")

    # Create Recycling Points and its managers
    logger.info(f"Creating Recycling Points...")
    total_current_users = User.objects.count()

    for i in range(1, 10 + 1):
        try:
            # Uses a transaction to make sure that RP and User will be created together
            with django_transaction.atomic():
                manager_name = fake.name()
                manager_id_num = total_current_users + i
                manager_email = f'manager.{manager_name.split()[0].lower()}{manager_id_num}@recicash.point'
                
                new_manager = User.objects.create(
                    user_id=f'{manager_id_num:06}',
                    name=manager_name,
                    email=manager_email,
                    cpf=fake.cpf(),
                    zip_code=fake.postcode(),
                    access_level='M' # Manager access level
                )

                RecyclingPoint.objects.create(
                    recycling_point_id=f'{i:06}',
                    user_id=new_manager,
                    name=f"Ponto de Coleta - {fake.city()}",
                    cnpj=fake.cnpj(),
                    zip_code=fake.postcode(),
                    latitude=float(fake.latitude()),
                    longitude=float(fake.longitude())
                )
            logger.info(f"Recycling Point '{i}' and manager created successfully")
        
        except Exception as e:
            logger.error(f"Erros creating Recycling Point {i} and its manager: {e}")
            # Continua para o próximo item do loop
            continue

    logger.info("Initial data created successfully!")

    # Create Recycling Value
    logger.info(f"Creating Recycling value...")
    try:
        i = 1
        RecyclingValue.objects.create(
            recycling_value_id=f'{i:06}',
            points_value=500.0,
            date=timezone.now() - timedelta(days=366)
        )
        logger.info(f"Recycling value created successfully")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Recycling Value {i}: {e}")
    
    # Create Recycling
    logger.info(f"Creating Recycling...")
    try:
        all_users = list(User.objects.filter(access_level='U'))
        all_recycling_points = list(RecyclingPoint.objects.all())
        recycling_value_instance = RecyclingValue.objects.get(recycling_value_id='000001')

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
            points = weight_value * recycling_value_instance.points_value

            recyclings_to_create.append(
                Recycling(
                    recycling_id=f'{i:06}',
                    user_id=random_user,
                    recycling_point_id=random_point,
                    recycling_value_id=recycling_value_instance,
                    points_value=points,
                    weight=weight_value, # Random weight between 0.5kg and 50kg
                    date=fake.past_datetime(start_date="-1y", tzinfo=tz), # Random date in last year
                    validation_hash=fake.sha256()
                )
            )
        
        recyclings_created = Recycling.objects.bulk_create(recyclings_to_create)
        logger.info(f"Recycling records created successfully")

        for recycling in recyclings_created:
                wallet_history_to_create.append(
                    WalletHistory(
                        user_id=recycling.user_id,
                        operation='RECYCLING',
                        value=recycling.points_value,
                        date=recycling.date
                    )
                )
    except RecyclingValue.DoesNotExist:
        logger.error("Recycling Value with id '000001' does not exist. Create it first")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Recycling records: {e}")

    logger.info(f"Creating Company Partners...")
    try:
        partners_to_create = []
        for i in range(1, 20 + 1):
            partners_to_create.append(
                PartnerCompany(
                    company_id=f'{i:06}',
                    name=fake.company(),
                    cnpj=fake.cnpj()
                )
            )
        
        PartnerCompany.objects.bulk_create(partners_to_create)
        logger.info(f"Partner Company created successfully.")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating Recycling records: {e}")
    

    logger.info(f"Creating coupons...")
    try:
        # Pre-fetch partners to avoid DB queries inside the loop
        all_partners = list(PartnerCompany.objects.all())
        coupon_types = ['PERCENTAGE_DISCOUNT', 'DIRECT_DISCOUNT', 'GIFT']

        if not all_partners:
            logger.warning("No partner companies found. Skipping coupon creation.")
        else:
            coupons_to_create = []
            for i in range(1, 300 + 1):
                random_partner = random.choice(all_partners)
                coupon_type = random.choice(coupon_types)

                start_date = fake.past_datetime(start_date='-1y', tzinfo=tz)
                expiring_date = start_date + timedelta(days=random.randint(30, 120))
                
                coupons_to_create.append(
                    Coupon(
                        coupon_id=f'{i:06}',
                        partner_company_id=random_partner,
                        type=coupon_type,
                        value=float(random.randint(5, 50)),
                        points_cost=random.randint(100, 2500),
                        validation_hash=fake.sha256(),
                        start_date=start_date,
                        expiring_date=expiring_date
                    )
                )
            Coupon.objects.bulk_create(coupons_to_create)
            logger.info(f"Coupons created successfully")
    except Exception as e:
        logger.error(f"An unexpected error occurred while creating coupons: {e}")
    
    logger.info(f"Creating coupon transactions...")
    try:
        # Pre-fetch users and coupons for efficiency
        all_users = list(User.objects.filter(access_level='U'))
        all_coupons = list(Coupon.objects.all())

        if not all_users or not all_coupons:
            logger.warning("No users or coupons found. Skipping coupon transaction creation.")
        else:
            transactions_to_create = []
            for i in range(1, 100 + 1):
                random_user = random.choice(all_users)
                random_coupon = random.choice(all_coupons)
                
                transactions_to_create.append(
                    CouponsTransactions(
                        transaction_id=f'{i:06}',
                        user_id=random_user,
                        coupon_id=random_coupon,
                        points_value=random_coupon.points_cost, # Set value_points equal to the coupon's points_cost
                        date=fake.past_datetime(start_date="-1y", tzinfo=tz)
                    )
                )
            transactions_created = CouponsTransactions.objects.bulk_create(transactions_to_create)
            logger.info(f"Coupons transactions created successfully")

            for transaction in transactions_created:
                wallet_history_to_create.append(
                    WalletHistory(
                        user_id=transaction.user_id,
                        operation='COUPON_TRANSACTION',
                        value=-transaction.points_value, # Note: Negative value for point deduction
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
        # Assign unique IDs before bulk creating
        for i, history_item in enumerate(wallet_history_to_create, 1):
            history_item.history_id = f'{i:06}'
        
        try:
            WalletHistory.objects.bulk_create(wallet_history_to_create)
            logger.info(f"Wallet history records created successfuly")
        except Exception as e:
            logger.error(f"An unexpected error occurred while creating wallet history: {e}")
    
    logger.info("Calculating final balances and creating wallets for all users...")
    try:
        # Use defaultdict to simplify balance aggregation
        user_balances = defaultdict(float)
        for history_item in wallet_history_to_create:
            user_balances[history_item.user_id] += history_item.value

        wallets_to_create = []
        all_system_users = User.objects.all()

        # Ensure every user has a wallet, even if they have no transactions
        for user in all_system_users:
            balance = user_balances[user] # Returns 0.0 for users not in the dict
            wallets_to_create.append(
                Wallet(user_id=user, points_balance=balance)
            )
        
        # To ensure a clean slate, delete existing wallets before creating new ones
        Wallet.objects.all().delete()
        Wallet.objects.bulk_create(wallets_to_create)
        logger.info(f"Wallets created successfully")

    except Exception as e:
        logger.error(f"An unexpected error occurred while creating wallets: {e}")


class Command(BaseCommand):
    help = 'Populates the database with initial, necessary data for the application to run.'

    def add_arguments(self, parser):
        # Allows user to define how much users must be created
        parser.add_argument(
            '--total', 
            type=int, 
            default=10, 
            help='Number of fake users'
        )

    def handle(self, *args, **options):
        create_data(options['total'])
        self.stdout.write(self.style.SUCCESS('Population command executed successfully!'))

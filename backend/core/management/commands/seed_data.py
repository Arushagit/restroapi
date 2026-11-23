from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from authentication.models import CustomerProfile
from menu.models import FoodCategory, FoodItem
from tables.models import RestaurantTable
from orders.models import Order, OrderItem, OrderStatusHistory
from billing.models import Payment

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with interview-ready initial data for RESTROFLOW"

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Create Users
        users_data = [
            {'username': 'admin', 'email': 'admin@restroflow.com', 'role': 'admin', 'first_name': 'Admin', 'last_name': 'Manager', 'phone': '9876543210', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
            {'username': 'staff', 'email': 'staff@restroflow.com', 'role': 'staff', 'first_name': 'Sanjay', 'last_name': 'Sharma', 'phone': '9876543211', 'password': 'staff123', 'is_staff': True, 'is_superuser': False},
            {'username': 'kitchen', 'email': 'kitchen@restroflow.com', 'role': 'kitchen', 'first_name': 'Chef', 'last_name': 'Vikram', 'phone': '9876543212', 'password': 'kitchen123', 'is_staff': False, 'is_superuser': False},
            {'username': 'customer', 'email': 'customer@restroflow.com', 'role': 'customer', 'first_name': 'Priya', 'last_name': 'Patel', 'phone': '9876543213', 'password': 'customer123', 'is_staff': False, 'is_superuser': False},
            {'username': 'rahul', 'email': 'rahul@gmail.com', 'role': 'customer', 'first_name': 'Rahul', 'last_name': 'Verma', 'phone': '9876543214', 'password': 'rahul123', 'is_staff': False, 'is_superuser': False},
        ]

        users = {}
        for udata in users_data:
            pwd = udata.pop('password')
            u, created = User.objects.get_or_create(username=udata['username'], defaults=udata)
            if created:
                u.set_password(pwd)
                u.save()
                if u.role == 'customer':
                    CustomerProfile.objects.get_or_create(user=u, address='Flat 402, Sunshine Apartments, MG Road')
                self.stdout.write(f"Created user: {u.username} ({u.role})")
            users[u.username] = u

        # 2. Create Restaurant Tables
        tables_data = [
            {'table_number': 'T1', 'capacity': 2, 'status': 'available', 'location': 'Window Area'},
            {'table_number': 'T2', 'capacity': 4, 'status': 'available', 'location': 'Main Dining Hall'},
            {'table_number': 'T3', 'capacity': 4, 'status': 'occupied', 'location': 'Main Dining Hall'},
            {'table_number': 'T4', 'capacity': 6, 'status': 'available', 'location': 'Balcony Terrace'},
            {'table_number': 'T5', 'capacity': 8, 'status': 'reserved', 'location': 'VIP Lounge'},
            {'table_number': 'T6', 'capacity': 2, 'status': 'available', 'location': 'Outdoor Patio'},
        ]
        tables = {}
        for tdata in tables_data:
            t, _ = RestaurantTable.objects.get_or_create(table_number=tdata['table_number'], defaults=tdata)
            tables[t.table_number] = t
        self.stdout.write(f"Seeded {len(tables)} tables.")

        # 3. Create Categories
        categories_data = [
            {'name': 'Starters & Appetizers', 'description': 'Tantalizing bites to kick off your culinary voyage.'},
            {'name': 'Main Course', 'description': 'Rich, hearty authentic dishes cooked to perfection.'},
            {'name': 'Beverages & Mocktails', 'description': 'Artisan drinks, cooling refreshments and brewed blends.'},
            {'name': 'Artisan Desserts', 'description': 'Handcrafted sweet finales and indulgent creations.'},
        ]
        categories = {}
        for cdata in categories_data:
            c, _ = FoodCategory.objects.get_or_create(name=cdata['name'], defaults=cdata)
            categories[c.name] = c
        self.stdout.write(f"Seeded {len(categories)} food categories.")

        # 4. Create Food Items
        items_data = [
            # Starters
            {
                'category': categories['Starters & Appetizers'],
                'name': 'Paneer Tikka Royale',
                'description': 'Cottage cheese cubes marinated in spiced hung curd, bell peppers, chargrilled in tandoor.',
                'price': Decimal('280.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Starters & Appetizers'],
                'name': 'Crispy Peri Peri Wings',
                'description': 'Tender chicken wings tossed in homemade smoky peri peri glaze with garlic aioli.',
                'price': Decimal('320.00'),
                'food_type': 'non_veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Starters & Appetizers'],
                'name': 'Golden Truffle Spring Rolls',
                'description': 'Crisp golden pastry rolls stuffed with shredded vegetables, mushroom, and truffle oil dip.',
                'price': Decimal('210.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': False
            },
            # Main Course
            {
                'category': categories['Main Course'],
                'name': 'Grand Butter Chicken',
                'description': 'Tandoori chicken simmered in rich creamy satin tomato gravy with fenugreek butter.',
                'price': Decimal('390.00'),
                'food_type': 'non_veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Main Course'],
                'name': 'Paneer Butter Masala',
                'description': 'Succulent cottage cheese steeped in velvety spiced tomato and cashew gravy.',
                'price': Decimal('340.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Main Course'],
                'name': 'Dal Makhani Heritage',
                'description': 'Slow-cooked black lentils simmered overnight over slow coals with churned butter and cream.',
                'price': Decimal('260.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': False
            },
            {
                'category': categories['Main Course'],
                'name': 'Awadhi Dum Biryani',
                'description': 'Fragrant basmati rice layered with marinated chicken, saffron, mint and sealed in dough.',
                'price': Decimal('420.00'),
                'food_type': 'non_veg',
                'is_available': True,
                'is_featured': True
            },
            # Beverages
            {
                'category': categories['Beverages & Mocktails'],
                'name': 'Royal Alphonso Mango Lassi',
                'description': 'Pure Alphonso mango pulp blended with rich creamy curd and crushed pistachios.',
                'price': Decimal('140.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Beverages & Mocktails'],
                'name': 'Cold Brew Hazelnut Frappe',
                'description': '18-hour cold brewed arabica with roasted hazelnut syrup and whipped chocolate foam.',
                'price': Decimal('180.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': False
            },
            {
                'category': categories['Beverages & Mocktails'],
                'name': 'Virgin Mint Mojito',
                'description': 'Crushed garden mint, freshly squeezed lime, raw cane sugar and sparkling club soda.',
                'price': Decimal('120.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': False
            },
            # Desserts
            {
                'category': categories['Artisan Desserts'],
                'name': 'Shahi Gulab Jamun with Rabri',
                'description': 'Warm cardamom saffron soaked gulab jamun rested on a bed of chilled slow-reduced rabri.',
                'price': Decimal('160.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Artisan Desserts'],
                'name': 'Belgian Dark Chocolate Mousse',
                'description': 'Airy 70% dark Belgian chocolate mousse with roasted almond praline crunch.',
                'price': Decimal('220.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': True
            },
            {
                'category': categories['Artisan Desserts'],
                'name': 'Kesar Badam Kheer',
                'description': 'Traditional fragrant rice pudding laced with Kashmiri saffron and slivered almonds.',
                'price': Decimal('130.00'),
                'food_type': 'veg',
                'is_available': True,
                'is_featured': False
            },
        ]

        food_items = {}
        for idata in items_data:
            f, _ = FoodItem.objects.get_or_create(name=idata['name'], defaults=idata)
            food_items[f.name] = f
        self.stdout.write(f"Seeded {len(food_items)} food items.")

        # 5. Create Sample Past & Present Orders with payments
        now = timezone.now()
        customer_user = users['customer']
        rahul_user = users['rahul']
        admin_user = users['admin']

        # Order 1: Completed dine-in with payment (Today)
        if not Order.objects.filter(customer=customer_user, status='completed').exists():
            sub = food_items['Grand Butter Chicken'].price + food_items['Paneer Tikka Royale'].price
            tax = (sub * Decimal('0.05')).quantize(Decimal('0.01'))
            tot = sub + tax

            ord1 = Order.objects.create(
                customer=customer_user,
                created_by=customer_user,
                table=tables['T2'],
                order_type='dine_in',
                status='completed',
                subtotal=sub,
                tax_amount=tax,
                discount_amount=Decimal('0.00'),
                total_amount=tot,
                created_at=now - timedelta(hours=2)
            )
            OrderItem.objects.create(order=ord1, food_item=food_items['Grand Butter Chicken'], quantity=1, unit_price=food_items['Grand Butter Chicken'].price, subtotal=food_items['Grand Butter Chicken'].price)
            OrderItem.objects.create(order=ord1, food_item=food_items['Paneer Tikka Royale'], quantity=1, unit_price=food_items['Paneer Tikka Royale'].price, subtotal=food_items['Paneer Tikka Royale'].price)
            OrderStatusHistory.objects.create(order=ord1, status='completed', changed_by=admin_user, note='Order completed and paid')

            Payment.objects.create(
                order=ord1,
                payment_method='upi',
                payment_status='completed',
                subtotal=sub,
                tax_rate=Decimal('5.00'),
                tax_amount=tax,
                discount_amount=Decimal('0.00'),
                total_amount=tot,
                amount_paid=tot,
                change_amount=Decimal('0.00'),
                invoice_number='RF-202611-0001-01',
                created_at=now - timedelta(hours=2),
                created_by=admin_user
            )

        # Order 2: Preparing order (Active in Kitchen)
        if not Order.objects.filter(status='preparing').exists():
            sub = food_items['Awadhi Dum Biryani'].price + food_items['Royal Alphonso Mango Lassi'].price * 2
            tax = (sub * Decimal('0.05')).quantize(Decimal('0.01'))
            tot = sub + tax

            ord2 = Order.objects.create(
                customer=rahul_user,
                created_by=rahul_user,
                table=tables['T3'],
                order_type='dine_in',
                status='preparing',
                subtotal=sub,
                tax_amount=tax,
                discount_amount=Decimal('0.00'),
                total_amount=tot,
                created_at=now - timedelta(minutes=25)
            )
            OrderItem.objects.create(order=ord2, food_item=food_items['Awadhi Dum Biryani'], quantity=1, unit_price=food_items['Awadhi Dum Biryani'].price, subtotal=food_items['Awadhi Dum Biryani'].price)
            OrderItem.objects.create(order=ord2, food_item=food_items['Royal Alphonso Mango Lassi'], quantity=2, unit_price=food_items['Royal Alphonso Mango Lassi'].price, subtotal=food_items['Royal Alphonso Mango Lassi'].price * 2)
            OrderStatusHistory.objects.create(order=ord2, status='pending', changed_by=rahul_user, note='Order placed')
            OrderStatusHistory.objects.create(order=ord2, status='preparing', changed_by=users['kitchen'], note='Kitchen started preparation')

        # Order 3: Ready order for billing (Active in Kitchen & Billing)
        if not Order.objects.filter(status='ready').exists():
            sub = food_items['Paneer Butter Masala'].price + food_items['Shahi Gulab Jamun with Rabri'].price
            tax = (sub * Decimal('0.05')).quantize(Decimal('0.01'))
            tot = sub + tax

            ord3 = Order.objects.create(
                customer=customer_user,
                created_by=customer_user,
                order_type='takeaway',
                status='ready',
                subtotal=sub,
                tax_amount=tax,
                discount_amount=Decimal('0.00'),
                total_amount=tot,
                created_at=now - timedelta(minutes=45)
            )
            OrderItem.objects.create(order=ord3, food_item=food_items['Paneer Butter Masala'], quantity=1, unit_price=food_items['Paneer Butter Masala'].price, subtotal=food_items['Paneer Butter Masala'].price)
            OrderItem.objects.create(order=ord3, food_item=food_items['Shahi Gulab Jamun with Rabri'], quantity=1, unit_price=food_items['Shahi Gulab Jamun with Rabri'].price, subtotal=food_items['Shahi Gulab Jamun with Rabri'].price)
            OrderStatusHistory.objects.create(order=ord3, status='ready', changed_by=users['kitchen'], note='Ready for pickup/billing')

        # Order 4: Historical payments for revenue chart (previous 5 days)
        for d in range(1, 6):
            past_date = now - timedelta(days=d)
            sub = Decimal('1200.00') + Decimal(d * 180)
            tax = (sub * Decimal('0.05')).quantize(Decimal('0.01'))
            tot = sub + tax

            hist_order, _ = Order.objects.get_or_create(
                customer=customer_user,
                special_instructions=f'Historical Order Day -{d}',
                defaults={
                    'order_type': 'delivery',
                    'delivery_address': 'Flat 402, Sunshine Apartments, MG Road',
                    'status': 'completed',
                    'subtotal': sub,
                    'tax_amount': tax,
                    'discount_amount': Decimal('50.00'),
                    'total_amount': tot - Decimal('50.00'),
                    'created_at': past_date
                }
            )
            if not hasattr(hist_order, 'payment'):
                Payment.objects.create(
                    order=hist_order,
                    payment_method='card' if d % 2 == 0 else 'cash',
                    payment_status='completed',
                    subtotal=sub,
                    tax_rate=Decimal('5.00'),
                    tax_amount=tax,
                    discount_amount=Decimal('50.00'),
                    total_amount=tot - Decimal('50.00'),
                    amount_paid=tot - Decimal('50.00'),
                    change_amount=Decimal('0.00'),
                    invoice_number=f'RF-HIST-202611-{d:03d}',
                    created_at=past_date,
                    created_by=admin_user
                )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))


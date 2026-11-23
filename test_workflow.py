import urllib.request
import json
import sys

BASE_URL = "https://restroapi-vvei.onrender.com/api"

def request(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(f"{BASE_URL}{url}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_content)
        except:
            return e.code, {"error": err_content}

def run_tests():
    print("=" * 60)
    print("RESTROFLOW COMPLETE END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Admin login
    print("\n[Step 1] Admin login...")
    status, res = request("/auth/login/", "POST", {"username": "admin", "password": "admin123"})
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res["access"]
    print(f"✓ Admin logged in. User: {res['username']}, Role: {res['role']}")

    # 2. Admin adds food category
    print("\n[Step 2] Admin adds food category...")
    status, cat = request("/menu/categories/", "POST", {
        "name": "Chef Sizzlers & Grills",
        "description": "Smoking hot platters sizzling with garlic herb butter."
    }, token=admin_token)
    assert status in [200, 201], f"Category creation failed: {cat}"
    cat_id = cat["id"]
    print(f"✓ Category created: #{cat_id} '{cat['name']}'")

    # Admin adds food item in that category
    print("Admin adds food item...")
    status, item = request("/menu/items/", "POST", {
        "name": "Sizzling Paneer Supreme",
        "category": cat_id,
        "description": "Chargrilled cottage cheese over aromatic fried rice and spicy pepper jus.",
        "price": "360.00",
        "food_type": "veg",
        "is_available": True,
        "is_featured": True
    }, token=admin_token)
    assert status in [200, 201], f"Food item creation failed: {item}"
    item_id = item["id"]
    print(f"✓ Food item created: #{item_id} '{item['name']}' @ Rs.{item['price']}")

    # 3. Customer browses menu
    print("\n[Step 3] Customer browses menu...")
    status, menu = request("/menu/items/", "GET")
    assert status == 200, f"Menu retrieval failed: {menu}"
    print(f"✓ Menu retrieved: {len(menu)} available dishes found.")

    # 4. Customer login
    print("\n[Step 4] Customer logs in...")
    status, res = request("/auth/login/", "POST", {"username": "customer", "password": "customer123"})
    assert status == 200, f"Customer login failed: {res}"
    customer_token = res["access"]
    print(f"✓ Customer logged in: {res['username']}")

    # 5. Customer places order
    print("\n[Step 5] Customer places order...")
    # Get table 1
    _, tables = request("/tables/", "GET")
    table_1 = tables[0]["id"]
    order_payload = {
        "order_type": "dine_in",
        "table": table_1,
        "special_instructions": "Make it sizzling hot, serve with lime wedges.",
        "items_input": [
            {"food_item_id": item_id, "quantity": 2, "notes": "Extra sizzle sauce"}
        ]
    }
    status, order = request("/orders/", "POST", order_payload, token=customer_token)
    assert status in [200, 201], f"Order creation failed: {order}"
    order_id = order["id"]
    print(f"✓ Order placed: #{order_id} | Total: Rs.{order['total_amount']} | Status: {order['status']}")

    # 6. Admin views incoming order
    print("\n[Step 6] Admin views incoming order...")
    status, admin_order = request(f"/orders/{order_id}/", "GET", token=admin_token)
    assert status == 200, f"Order view failed: {admin_order}"
    print(f"✓ Admin verified Order #{order_id} from {admin_order['customer_name']} (Table {admin_order['table_number']})")

    # 7. Kitchen staff login & updates order status
    print("\n[Step 7] Kitchen staff updates order status...")
    status, res = request("/auth/login/", "POST", {"username": "kitchen", "password": "kitchen123"})
    assert status == 200, f"Kitchen login failed: {res}"
    kitchen_token = res["access"]

    # Kitchen sets to preparing
    status, res = request(f"/orders/{order_id}/update_status/", "POST", {"status": "preparing"}, token=kitchen_token)
    assert status == 200, f"Failed to mark preparing: {res}"
    print(f"✓ Kitchen changed Order #{order_id} status -> PREPARING")

    # Kitchen sets to ready
    status, res = request(f"/orders/{order_id}/update_status/", "POST", {"status": "ready"}, token=kitchen_token)
    assert status == 200, f"Failed to mark ready: {res}"
    print(f"✓ Kitchen changed Order #{order_id} status -> READY")

    # 8. Customer tracks order status
    print("\n[Step 8] Customer verifies status...")
    status, my_orders = request("/orders/my_orders/", "GET", token=customer_token)
    matching = [o for o in my_orders if o["id"] == order_id]
    assert len(matching) > 0 and matching[0]["status"] == "ready"
    print(f"✓ Customer received live status: {matching[0]['status'].upper()}")

    # 9. Cashier generates bill & records payment
    print("\n[Step 9] Cashier generates bill & settles payment...")
    pay_payload = {
        "order": order_id,
        "payment_method": "upi",
        "discount_amount": 20.00,
        "amount_paid": float(matching[0]["total_amount"]) - 20.00
    }
    status, payment = request("/billing/", "POST", pay_payload, token=admin_token)
    assert status in [200, 201], f"Billing payment failed: {payment}"
    payment_id = payment["id"]
    invoice_num = payment["invoice_number"]
    print(f"✓ Payment settled: Invoice #{invoice_num} | Net Paid: Rs.{payment['total_amount']}")

    # Get printable invoice
    status, invoice = request(f"/billing/{payment_id}/invoice/", "GET", token=admin_token)
    assert status == 200, f"Invoice fetch failed: {invoice}"
    print(f"✓ Printable invoice verified for {invoice['restaurant']['name']}")

    # 10. Admin dashboard reflection
    print("\n[Step 10] Checking Admin Dashboard stats...")
    status, stats = request("/dashboard/stats/", "GET", token=admin_token)
    assert status == 200, f"Stats failed: {stats}"
    print(f"✓ Dashboard stats verified:")
    print(f"   • Total Orders: {stats['total_orders']}")
    print(f"   • Today's Revenue: Rs.{stats['today_revenue']}")
    print(f"   • Total Lifetime Revenue: Rs.{stats['total_revenue']}")
    print(f"   • Popular Dishes: {[p['name'] for p in stats['popular_items']]}")

    print("\n" + "=" * 60)
    print("ALL 10 DEMO WORKFLOW STEPS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()


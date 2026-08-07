### Product Details Page + Variants & Inventory

* Create a **separate product details page for every product** on the customer storefront.
* When a user clicks any product, open its dedicated product page.
* On the product page, show:

  * Product image
  * Product name
  * Description
  * Price
  * Available weight variants
  * Add to Cart / Buy Now
* Fetch all product weight variants and **real-time stock directly from the database**.
* Show only variants where `stock > 0` (e.g., 250g, 500g, 1kg).
* Each variant must have its own **unique SKU, weight, price, original price, discount %, and stock**.
* Use the **SKU as the unique identifier** across the product page, cart, checkout, orders, and inventory.
* If another customer purchases the available stock and it reaches `0`, automatically hide that variant from the product page.
* When an order is successfully placed, deduct the exact purchased quantity from the selected variant using its SKU.
* Handle simultaneous orders safely to prevent **overselling and double stock deduction**.
* Keep the **product page, variants, cart, checkout, orders, and admin inventory** fully synchronized with the database.
* Do not break any existing functionality.

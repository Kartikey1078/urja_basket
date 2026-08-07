Tum ye prompt de sakte ho:

---

I agree with the soft delete approach, but I want to modify the behavior slightly.

### Required behavior

1. When I click **Delete Product**, **do not hard delete** the product from the database.
2. Instead:

   * Set `is_active = 0`
   * Automatically set the product **Out of Stock**
   * Remove the product from all customer carts (if present).
3. The product should **still be visible on the website**, but:

   * It must display **"Out of Stock"**.
   * The **Add to Cart** button must be disabled.
   * Users must not be able to add it to the cart, buy it, or place an order.
4. Existing order history, inventory history, reviews, and reports must remain unchanged.
5. In the Admin Panel:

   * The product should appear as **Archived / Inactive**.
   * Admin should have a **Restore** option.
6. On Restore:

   * Set `is_active = 1`.
   * Restore the previous stock quantity (or allow the admin to update stock before making it available).
   * The product should become purchasable again.

### Important

Do **not** remove archived products from the website listing. They should remain visible for SEO and customer reference, but they must clearly show **Out of Stock** and must not be purchasable in any way.

Please implement this throughout the backend, admin panel, and storefront while preserving all existing functionality and foreign key relationships.
 
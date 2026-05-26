You are a senior backend architect. Create only the **backend folder structure** for my e-commerce platform **Urja Basket** (fruits + dry fruits).

Tech stack:

* Node.js
* Express.js
* TypeScript
* MySQL (managed with phpMyAdmin) via **`mysql2`** — parameterized SQL in repositories; **no Prisma / no ORM**
* Versioned **SQL migration files** under `server/database/migrations/` (run manually or with your chosen migration runner)
* MVC + Service + Repository pattern

Goal:
Create a production-ready structure that is:

* Clean
* Scalable
* Modular
* Beginner-friendly
* Easy to understand
* Systematic and maintainable

Project should support:

Core modules:

* Authentication
* Users
* Products
* Categories
* Product variants (250g, 500g, 1kg)
* Inventory / stock
* Cart
* Wishlist
* Orders
* Payments
* Reviews & ratings
* Addresses
* Notifications
* Admin panel

Architecture folders:

* Routes
* Controllers
* Services
* Repositories
* Validators
* Middleware
* Config
* Database (connection pool, query helpers; migrations live in `database/migrations/`)
* Utils
* Helpers
* Constants
* Types
* Interfaces
* DTOs
* Error handling
* Logs
* Cache / Redis
* Uploads / Cloudinary
* Cron jobs
* Events
* Queue jobs
* API versioning


Requirements:

* Use TypeScript naming conventions
* Include `src` structure
* Show where `.env`, `tsconfig.json`, package files, and configs belong
* Keep feature-based organization
* Make future modules easy to add

Return only:

1. Complete folder tree
2. One-line purpose of each folder
3. Explain where future features should be added

Do not generate APIs or code.

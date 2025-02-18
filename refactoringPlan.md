# Refactoring Plan for Node.js Express Project

## 1. Controller Improvements
- Implement **validation** for all `req.query` parameters in controllers.
- Move business logic from `reports` controller to a dedicated **service** layer.
- Extract business logic from the following controllers and move them to their respective **services** inside the `Customer App`:
  - `basket`
  - `order`
- Extract business logic from the `subscription` controller (Seller App) to a **service** layer.

## 2. Repository Enhancements
- Extract the following commonly used functions from repositories into a shared **utility/helper** module:
  - `convertToLowerCase`
  - `isNameUnique`
  - `isObjectUnique`
  - `isEmailUnique`
- Move the following logic from **repositories** to the **service** layer for better separation of concerns:
  - `basket`
  - `cart`
  - `coupon`
- Move the function `isItemInWishlist` from the **wishlist repository** to a **helper module**, since it does not interact with the database.

## 3. Utility Refactoring
- In `stripePayment.util.js`, extract the `URLS` object into a separate **JSON file** and use it in the utility module.

## 4. Low-Priority Improvements
- Extract business logic from `updateSeller` and `variation` functions from the **repository** to a more suitable layer for better separation of concerns.
- Refactor the code for:
  - `shipping`
  - `batch`
  - `socket`
- Add a **logging tool** to manage logs, control their verbosity, and enable/disable them when needed.
- Review and refactor **schemas and validations**, ensuring they are consistent and well-structured.

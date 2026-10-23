# Changelog

## 0.1.1

- Replace the duplicated movie model with `@thydda/movies-contracts@0.1.0`.
- Preserve the public `Movie` type export and existing cart behavior.
- Update package dependencies and consumer documentation.
- Clean generated output before builds to avoid packaging the removed model.

## 0.1.0

- Introduce shared movie cart actions, reducer and selectors built on `cart-state`.
- Provide numeric selection IDs and a derived cart count.

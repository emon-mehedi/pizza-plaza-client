export const MENU_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const

export type MenuCategory = (typeof MENU_CATEGORIES)[number]

export function isMenuCategory(value: string): value is MenuCategory {
  return (MENU_CATEGORIES as readonly string[]).includes(value)
}

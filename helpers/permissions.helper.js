
let adminEndPoints = [
    "/admin/create", "/admin/list", "/admin/get", "/admin/update", "/admin/remove",
    "/admin/image", "/admin/password", "/admin/role"
]


let roleEndPoints = [
    "/admin/roles/create", "/admin/roles/list", "/admin/roles/get", "/admin/roles/update", "/admin/roles/remove"
]


let permissionEndPoints = ["/admin/permissions/list"]


let customerEndPoints = [
    "/admin/customers/list", "/admin/customers/get", "/admin/customers/update", "/admin/customers/remove",
    "/admin/customers/image", "/admin/customers/password"
]


let sellerEndPoints = [
    "/admin/sellers/list", "/admin/sellers/get", "/admin/sellers/update", "/admin/sellers/remove",
    "/admin/sellers/image", "/admin/sellers/password"
]


let shopEndPoints = [
    "/admin/shops/create", "/admin/shops/list", "/admin/shops/get", "/admin/shops/update", "/admin/shops/remove",
    "/admin/shops/image", "/admin/shops/cover"
]


let categoryEndPoints = [
    "/admin/categories/create", "/admin/categories/update", "/admin/categories/remove",
    "/admin/categories/list", "/admin/categories/get", "/admin/categories/image"
]


let tagEndPoints = [
    "/admin/tags/create", "/admin/tags/update", "/admin/tags/remove",
    "/admin/tags/list", "/admin/tags/get"
]


let fieldEndPoints = [
    "/admin/fields/create", "/admin/fields/update", "/admin/fields/remove",
    "/admin/fields/list", "/admin/fields/get"
]


let formEndPoints = [
    "/admin/forms/create", "/admin/forms/update", "/admin/forms/remove",
    "/admin/forms/list", "/admin/forms/get"
]


let productEndPoints = [
    "/admin/products/create", "/admin/products/update", "/admin/products/remove",
    "/admin/products/list", "/admin/products/get"
]


let variationEndPoints = [
    "/admin/variations/create", "/admin/variations/update", "/admin/variations/remove",
    "/admin/variations/list", "/admin/variations/get", "/admin/variations/image"
]


let serviceEndPoints = [
    "/admin/services/create", "/admin/services/update", "/admin/services/remove",
    "/admin/services/list", "/admin/services/get", "/admin/services/image"
]


let bannerEndPoints = [
    "/admin/banners/create", "/admin/banners/update", "/admin/banners/remove",
    "/admin/banners/list", "/admin/banners/get", "/admin/banners/image"
]


let wishlistEndPoints = [
    "/admin/wishlists/get", "/admin/wishlists/list", "/admin/wishlists/update",
    "/admin/wishlists/remove"
]


let cartEndPoints = [
    "/admin/carts/get", "/admin/carts/list", "/admin/carts/update",
    "/admin/carts/remove"
]


let basketEndPoints = [
    "/admin/baskets/get", "/admin/baskets/list", "/admin/baskets/update",
    "/admin/baskets/remove"
]


let orderEndPoints = [
    "/admin/orders/get", "/admin/orders/list", "/admin/orders/update",
]


let requestEndPoints = [
    "/admin/requests/get", "/admin/requests/list", "/admin/requests/update",
]


let reviewEndPoints = [
    "/admin/reviews/get", "/admin/reviews/list", "/admin/reviews/remove",
]


let couponEndPoints = [
    "/admin/coupon/create", "/admin/coupon/update", "/admin/coupons/get",
    "/admin/coupons/list", "/admin/coupons/remove",
]


adminEndPoints = new Set(adminEndPoints);
roleEndPoints = new Set(roleEndPoints);
permissionEndPoints = new Set(permissionEndPoints);
customerEndPoints = new Set(customerEndPoints);
sellerEndPoints = new Set(sellerEndPoints);
shopEndPoints = new Set(shopEndPoints);
categoryEndPoints = new Set(categoryEndPoints);
tagEndPoints = new Set(tagEndPoints);
fieldEndPoints = new Set(fieldEndPoints);
formEndPoints = new Set(formEndPoints);
productEndPoints = new Set(productEndPoints);
variationEndPoints = new Set(variationEndPoints);
serviceEndPoints = new Set(serviceEndPoints);
bannerEndPoints = new Set(bannerEndPoints);
wishlistEndPoints = new Set(wishlistEndPoints);
cartEndPoints = new Set(cartEndPoints);
basketEndPoints = new Set(basketEndPoints);
orderEndPoints = new Set(orderEndPoints);
requestEndPoints = new Set(requestEndPoints);
reviewEndPoints = new Set(reviewEndPoints);
couponEndPoints = new Set(couponEndPoints);


let permissions = new Map();

permissions.set("admins", adminEndPoints)
permissions.set("roles", roleEndPoints)
permissions.set("permissions", permissionEndPoints)
permissions.set("customers", customerEndPoints)
permissions.set("sellers", sellerEndPoints)
permissions.set("shops", shopEndPoints)
permissions.set("categories", categoryEndPoints)
permissions.set("tags", tagEndPoints)
permissions.set("fields", fieldEndPoints)
permissions.set("forms", formEndPoints)
permissions.set("products", productEndPoints)
permissions.set("variations", variationEndPoints)
permissions.set("services", serviceEndPoints)
permissions.set("banners", bannerEndPoints)
permissions.set("wishlists", wishlistEndPoints)
permissions.set("carts", cartEndPoints)
permissions.set("baskets", basketEndPoints)
permissions.set("orders", orderEndPoints)
permissions.set("requests", requestEndPoints)
permissions.set("reviews", reviewEndPoints)
permissions.set("coupons", couponEndPoints)


module.exports = { permissions }
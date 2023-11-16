
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
    "/admin/shops/list", "/admin/shops/get", "/admin/shops/update", "/admin/shops/remove",
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


module.exports = { permissions }
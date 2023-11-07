
let adminEndPoints = [
    "/admin/create", "/admin/list", "/admin/get", "/admin/update", "/admin/remove",
    "/admin/image", "/admin/password", "/admin/role"
]


let roleEndPoints = [
    "/admin/roles/create", "/admin/roles/list", "/admin/roles/get", "/admin/roles/update", "/admin/roles/remove"
]


let permissionEndPoints = ["/admin/permissions/list"]


adminEndPoints = new Set(adminEndPoints);
roleEndPoints = new Set(roleEndPoints);
permissionEndPoints = new Set(permissionEndPoints);



let permissions = new Map();

permissions.set("admins", adminEndPoints)
permissions.set("roles", roleEndPoints)
permissions.set("permissions", permissionEndPoints)


module.exports = { permissions }
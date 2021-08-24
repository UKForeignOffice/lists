export const dashboardRoutes = {
  start: "/dashboard",

  // users
  usersList: "/dashboard/users",
  usersEdit: "/dashboard/users/:userEmail",

  // lists
  lists: "/dashboard/lists",
  listsEdit: "/dashboard/lists/:listId",
  listsItems: "/dashboard/lists/:listId/items",
  listsItemsApprove: "/dashboard/lists/:listId/items/:listItemId/approve",
  listsItemsPublish: "/dashboard/lists/:listId/items/:listItemId/publish",
};

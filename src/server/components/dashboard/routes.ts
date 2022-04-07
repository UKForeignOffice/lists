export const dashboardRoutes = {
  start: "/dashboard",

  // feedback
  feedback: "/dashboard/feedback",

  // users
  usersList: "/dashboard/users",
  usersEdit: "/dashboard/users/:userEmail",

  // lists
  lists: "/dashboard/lists",
  listsEdit: "/dashboard/lists/:listId",
  listsItems: "/dashboard/lists/:listId/items",
  listsItemsApprove: "/dashboard/lists/:listId/items/:listItemId/approve",
  listsItemsDelete: "/dashboard/lists/:listId/items/:listItemId",
  listsItemsPublish: "/dashboard/lists/:listId/items/:listItemId/publish",
  listsItem: "/dashboard/lists/:listId/items/:listItemId",
  listsItemConfirm: "/dashboard/lists/:listId/items/:listItemId/confirm",
  listsTest: "/dashboard/test",
};

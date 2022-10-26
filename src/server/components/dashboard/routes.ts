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
  listsItem: "/dashboard/lists/:listId/items/:listItemId",
  listsItemDelete: "/dashboard/lists/:listId/items/:listItemId/delete",
  listsItemPin: "/dashboard/lists/:listId/items/:listItemId/pin",
  listsItemPublish: "/dashboard/lists/:listId/items/:listItemId/publish",
  listsItemRequestChanges: "/dashboard/lists/:listId/items/:listItemId/changes",
  listsItemUpdate: "/dashboard/lists/:listId/items/:listItemId/update",
  listsHelp: "/dashboard/help",
  listsTest: "/dashboard/test",
} as const;

import {
  getActivityStatus,
  getPublishingStatus, hasBeenPublishedSinceUnpublishing,
  hasBeenUnpublishedSincePublishing,
  wasUnpublishedByUser
} from "./../summary.helpers";


test("wasUnpublishedByUser returns true if userId is present", () => {

  const noUserHistory = [
    {
      type: "UNPUBLISHED",
      time: new Date("2022-02-02")
    }
  ];
  expect(wasUnpublishedByUser(noUserHistory)).toBe(false);


  const withUserHistory = [
    {
      type: "UNPUBLISHED",
      time: new Date("2022-02-02"),
      jsonData: {
        userId: 366
      }
    }
  ];
  expect(wasUnpublishedByUser(withUserHistory)).toBe(true);

  const withFalseyIntUserHistory = [
    {
      type: "UNPUBLISHED",
      time: new Date("2022-02-02"),
      jsonData: {
        userId: 0
      }
    }
  ]
  expect(wasUnpublishedByUser(withFalseyIntUserHistory)).toBe(true);

  const withTruthyIntUserHistory = [
    {
      type: "UNPUBLISHED",
      time: new Date("2022-02-02"),
      jsonData: {
        userId: 1
      }
    }
  ]
  expect(wasUnpublishedByUser(withTruthyIntUserHistory)).toBe(true);
})

test("getActivityStatus returns the correct status that does not have historical dependencies", () => {
  const item = {
    history: [],
    isPublished: true,
    isAnnualReview: false
  }

  const newItem = {
    ...item,
    status: "NEW"
  }
  expect(getActivityStatus(newItem).text).toBe("Check new entry")

  const editedItem = {
    ...item,
    status: "EDITED"
  }
  expect(getActivityStatus(editedItem).text).toBe("Check edits")

  const publishedItem = {
    ...item,
    status: "PUBLISHED"
  }
  expect(getActivityStatus(publishedItem).text).toBe("No action needed")

  const withProviderItem = {
    ...item,
    status: "OUT_WITH_PROVIDER"
  }
  expect(getActivityStatus(withProviderItem).text).toBe("Edits requested")

  const overdueItem = {
    ...item,
    status: "ANNUAL_REVIEW_OVERDUE"
  }
  expect(getActivityStatus(overdueItem).text).toBe("Annual review overdue")

  const checkItem = {
    ...item,
    status: "CHECK_ANNUAL_REVIEW"
  }
  expect(getActivityStatus(checkItem).text).toBe("Check annual review")
});

test("getActivityStatus returns removed by post if a provider has been unpublished", () => {
  const history = [{
      type: "PUBLISHED",
      time: new Date("2022-01-01")
    },
      {
        type: "UNPUBLISHED",
        time: new Date("2022-02-02")
      }
    ];
  const item = {
    status: "UNPUBLISHED",
    isPublished: false,
    history,
    isAnnualReview: false
  }

  expect(getActivityStatus(item).text).toBe("Removed by post")

  const itemUnpublishedWithUser = {
    ...item,
    history: [
      history[0],
      {
        type: "UNPUBLISHED",
        time: new Date("2022-02-02"),
        jsonData: {
          userId: 366
        }
    }]
  }

  expect(getActivityStatus(itemUnpublishedWithUser).text).toBe("Removed by post")

  //NOTE:- currently the only other instance of unpublishing is due to scheduled annual review.
});

test("getPublishingStatus returns the correct publishing status", () => {
  const item = {
    history: [],
    isPublished: true,
    isAnnualReview: false
  }

  expect(getPublishingStatus(item)).toBe("live");

  const itemHasBeenArchived = {
    ...item,
    history: [{
      type: "ARCHIVED"
    }]
  }

  expect(getPublishingStatus(itemHasBeenArchived)).toBe("archived")

})

test("getPublishingStatus returns unpublished correctly", () => {
  const item = {
    history: [],
    isPublished: false,
    isAnnualReview: false
  }
  const itemWithStatus = {
    ...item,
    status: "UNPUBLISHED",
  }

  expect(getPublishingStatus(itemWithStatus)).toBe("unpublished")

  const itemUnpublishedSincePublishing = {
    ...item,
    history: [
      {
        type: "UNPUBLISHED",
      },
      {
        type: "PUBLISHED",
      },
    ]
  }

  expect(getPublishingStatus(itemUnpublishedSincePublishing)).toBe("unpublished")

  const publishedSinceUnpublishing = {
    ...item,
    history: [
      {
        type: "PUBLISHED",
      },
      {
        type: "UNPUBLISHED",
      },
      {
        type: "PUBLISHED",
      },
    ]
  }

  expect(getPublishingStatus(publishedSinceUnpublishing)).toBe("live")

});

test("hasBeenUnpublishedSincePublishing", () => {

  expect(hasBeenUnpublishedSincePublishing([
    { type: "UNPUBLISHED" },
  ])).toBe(true)

  expect(hasBeenUnpublishedSincePublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
  ])).toBe(true)

  expect(hasBeenUnpublishedSincePublishing([
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(false)

  expect(hasBeenUnpublishedSincePublishing([
    { type: "PUBLISHED" },
    { type: "EDITED" },
    { type: "OUT_WITH_PROVIDER" },
    { type: "NEW" },
  ])).toBe(false)

  expect(hasBeenUnpublishedSincePublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "EDITED" },
    { type: "OUT_WITH_PROVIDER" },
    { type: "NEW" },
  ])).toBe(true)


  expect(hasBeenUnpublishedSincePublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(true)

  expect(hasBeenUnpublishedSincePublishing([
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(false)

})

test("hasBeenPublishedSinceUnpublishing", () => {

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "PUBLISHED" },
  ])).toBe(true)

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
  ])).toBe(false)

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(true)

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "PUBLISHED" },
    { type: "EDITED" },
    { type: "OUT_WITH_PROVIDER" },
    { type: "NEW" },
  ])).toBe(true)

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "EDITED" },
    { type: "OUT_WITH_PROVIDER" },
    { type: "NEW" },
  ])).toBe(false)


  expect(hasBeenPublishedSinceUnpublishing([
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(false)

  expect(hasBeenPublishedSinceUnpublishing([
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
    { type: "PUBLISHED" },
    { type: "UNPUBLISHED" },
  ])).toBe(true)
})


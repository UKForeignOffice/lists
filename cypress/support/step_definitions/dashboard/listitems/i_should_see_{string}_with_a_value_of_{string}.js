/* eslint-disable */
Then(
  "I should see {string} with a value of {string} on row number {string}",
  (rowLabel, rowValue, rowPosition) => {
    const rowAtPosition = (position) =>
      cy
        .get(".govuk-summary-list > .govuk-summary-list__row")
        .eq(Number(position) - 1);

    rowAtPosition(rowPosition).contains("dt", rowLabel);
    rowAtPosition(rowPosition).contains("dd", rowValue);
  }
);

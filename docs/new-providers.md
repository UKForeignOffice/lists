# Adding new providers

To add a new provider the following sections need to be changed:-

components.lists.questionnaire.ts
 - add any new questions here

components.lists.types.ts
 - add the new question field to ListsRequestParams

lists.searches.<provider>.ts
- add the question sequence and searchFuneralDirectors() function

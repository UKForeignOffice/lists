export function getDbServiceTypeFromParameter(param: string | undefined) {
  const normalisedParameterToServiceType = {
    "funeral-directors": "funeralDirectors",
    lawyers: "lawyers",
    "translator-interpreters": "translatorsInterpreters",
  };

  return normalisedParameterToServiceType[param];
}

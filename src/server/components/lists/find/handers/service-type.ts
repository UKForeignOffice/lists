import { formatCountryParam } from "../../helpers";

export function get(req, res) {
  const country = req.query.country;
  if (country) {
    res.locals.country = formatCountryParam(country);
  }
  return res.render("lists/find/lawyers/notice");
}

export function post(req, res) {
  return res.redirect("/country");
}

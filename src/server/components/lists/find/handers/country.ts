import { countriesList } from "server/services/metadata";

export function get(req, res) {
  return res.render("lists/find/country", {
    countriesList,
  });
}

export function post(req, res) {
  return res.redirect("/region");
}

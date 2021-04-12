import URLSearchParams from "url-search-params";


(() => {
  // analytics
  const {pathname} = window.location;
  const urlParams = new URLSearchParams(window.location.search);

  console.log({pathname, urlParams})
})();
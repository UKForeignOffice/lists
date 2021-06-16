function toggleAnalyticsCookies(isOn: boolean): void {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/help/cookies", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify({
      analytics: isOn ? "on" : "off",
    })
  );
}

function removeCookieBanner(): void {
  const banner = document.querySelector(".govuk-cookie-banner") as HTMLElement;

  if (banner !== null) {
    banner.style.display = "none";
  }
}

Object.assign(document, {
  acceptAnalyticsCookies: (): void => {
    toggleAnalyticsCookies(true);
    removeCookieBanner();
  },
  rejectAnalyticsCookies: (): void => {
    toggleAnalyticsCookies(false);
    removeCookieBanner();
  },
});

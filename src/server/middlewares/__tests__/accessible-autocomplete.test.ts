/**
 * @jest-environment jsdom
 */

import express from "express";
import request from "supertest";
import { configureStaticServer } from "../static";

describe("Accessible autocomplete v3 assets", () => {
  let autocompleteScript: string;
  let autocompleteStylesheet: string;

  beforeAll(async () => {
    const app = express();
    configureStaticServer(app);

    const [scriptResponse, stylesheetResponse] = await Promise.all([
      request(app).get("/assets/accessible-autocomplete.min.js").expect(200),
      request(app).get("/assets/accessible-autocomplete.min.css").expect(200),
    ]);

    autocompleteScript = scriptResponse.text;
    autocompleteStylesheet = stylesheetResponse.text;
  });

  test("serves the stylesheet rule that hides the status element under CSP", () => {
    expect(autocompleteStylesheet).toContain(".autocomplete__visually-hidden");
  });

  test("enhances a select with keyboard, blur confirmation, and accessible ARIA markup", async () => {
    document.body.innerHTML = `
      <form>
        <label for="country-autocomplete">Country</label>
        <div id="country-hint">Select a country or territory</div>
        <select id="country-autocomplete" name="country">
          <option value=""></option>
          <option value="ca">Canada</option>
          <option value="fr">France</option>
        </select>
      </form>
    `;

    window.eval(autocompleteScript);

    const { accessibleAutocomplete } = window as Window & {
      accessibleAutocomplete?: {
        enhanceSelectElement: (options: {
          defaultValue: string;
          selectElement: HTMLSelectElement;
          autoselect: boolean;
          confirmOnBlur: boolean;
        }) => void;
      };
    };
    const select = document.querySelector("#country-autocomplete");
    if (!accessibleAutocomplete || !(select instanceof HTMLSelectElement)) {
      throw new Error("Autocomplete bundle or country select is unavailable");
    }

    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: "",
      selectElement: select,
      autoselect: true,
      confirmOnBlur: true,
    });

    const input = document.querySelector("#country-autocomplete");
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Country select was not enhanced into an autocomplete input");
    }
    const listboxId = input.getAttribute("aria-controls");
    const assistiveHintId = input.getAttribute("aria-describedby");
    if (!listboxId || !assistiveHintId) {
      throw new Error("Autocomplete input is missing its accessible listbox or hint");
    }

    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("both");
    expect(document.getElementById(listboxId)?.getAttribute("role")).toBe("listbox");
    expect(document.getElementById(assistiveHintId)?.textContent).toContain("up and down arrows");
    expect(document.querySelector(".autocomplete__status")?.classList).toContain("autocomplete__visually-hidden");
    expect(document.querySelector('.autocomplete__status [role="status"][aria-live="polite"]')).not.toBeNull();

    input.value = "France";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[role="option"]')?.textContent).toBe("France");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(select.value).toBe("fr");
    expect(input.value).toBe("France");

    input.value = "Canada";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    input.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(select.value).toBe("ca");
  });
});

const cragLocation = 10;

const locations = [
  "Lerwick, Scotland",
  "Kirkwall, Scotland",
  "Portree, Scotland",
  "Dundee, Scotland",
  "Ayr, Scotland",
  "Malton, England",
  "Ripon, England",
  "Cambridge, England",
  "Whipsnade, England",
  "Y Bala, Wales",
  "Hay on Wye",
];

const loc = locations[cragLocation];

const radius = 250;

describe("scrape crag positions", () => {
  it("scrapes the crag positions", () => {
    cy.visit(
      `https://www.ukclimbing.com/logbook/crags/?location=${loc}&distance=${radius}`
    );

    const crags = [];
    cy.get("table#results > tbody > tr").each(($el) => {
      const tr = $el.get(0);
      const id = tr.getAttribute("id");

      const marker = tr.children[8].children[0];
      const lat = marker.getAttribute("data-osx");
      const long = marker.getAttribute("data-osy");
      crags.push([id, lat, long]);
    });

    cy.then(() => {
      cy.task("log", `Location: ${cragLocation} ${crags.length}`);
      cy.writeFile(
        `data/crag-positions/${cragLocation}.json`,
        JSON.stringify(crags)
      );
    });
  });
});

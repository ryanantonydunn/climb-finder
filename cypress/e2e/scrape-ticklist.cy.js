// const slug = Cypress.env("SLUG");

// // Get crag positions from leaflet layers object
// function extractCragPositionsFromLeaflet(layers, crags) {
//   function checkLayer(layer) {
//     // if this layer has crag data
//     const layerCragId = layer?.options?.crag_id;
//     if (layerCragId) {
//       const crag = crags.find((crag) => crag.id === layerCragId);
//       if (crag) {
//         crag.lat = layer._latlng.lat;
//         crag.lng = layer._latlng.lng;
//       }
//     }

//     // get any markers with crag ID's
//     (layer?._markers || []).forEach(checkLayer);

//     // look for child clusters further down
//     (layer?._childClusters || []).forEach(checkLayer);
//   }

//   Object.values(layers).forEach(checkLayer);

//   return crags.sort((a, b) => a.id - b.id);
// }

// describe("scraper", () => {
//   it("scrapes the crag data for a ticklist", () => {
//     cy.task("log", `Slug: ${slug}`);
//     cy.visit(`https://www.ukclimbing.com/logbook/ticklists/${slug}`);

//     /**
//      * Get basic information from the table
//      */
//     const crags = [];
//     cy.get("tbody > tr").each(($el) => {
//       const tr = $el.get(0);
//       const id = tr.getAttribute("data-id");
//       if (!id) return;

//       const routeNameAnchor = tr.children[2]?.children[0];
//       const url = routeNameAnchor?.getAttribute("href");
//       const name = routeNameAnchor?.innerText;

//       const grade = getGradeObject(tr.children[3]);

//       const height = tr.children[5].innerText.replace("m", "");

//       const cragAnchor = tr.children[8]?.children[0];
//       const cragUrl = cragAnchor.getAttribute("href");
//       const cragName = cragAnchor.getAttribute("title");
//       const cragId = cragUrl.split("-").slice(-1)[0].replace("/", "");

//       const newRoute = { id, url, name, ...grade, height, cragId };

//       let crag = crags.find((crag) => crag.id === cragId);
//       if (!crag) {
//         crag = {
//           id: cragId,
//           lat: undefined,
//           lng: undefined,
//           name: cragName,
//           routes: [],
//         };
//         crags.push(crag);
//       }
//       cy.task("log", `Crag: ${crag.id} - Route: ${newRoute.id}`);
//       crag.routes.push(newRoute);
//     });

//     /**
//      * Get name of ticklist from h1
//      * */
//     let name;
//     cy.then(() => {
//       cy.get("h1")
//         .invoke("text")
//         .then((h1Name) => {
//           name = h1Name;
//         });
//     });

//     /**
//      * Get position of crags from leaflet
//      */
//     cy.then(() => {
//       cy.get("#show_map").click();
//       cy.get(".leaflet-container", { timeout: 10000 }).should("be.visible");
//       cy.window().then((obj) => {
//         const sortedCrags = extractCragPositionsFromLeaflet(
//           obj.myMap._layers,
//           crags
//         );
//         cy.writeFile(
//           `data/scraped-crags/${slug}.json`,
//           JSON.stringify({ name, slug, crags: sortedCrags })
//         );
//       });
//     });
//   });
// });

// function isTradGrade(str) {
//   return [
//     "M",
//     "D",
//     "HD",
//     "VD",
//     "HVD",
//     "S",
//     "HS",
//     "VS",
//     "MVS",
//     "HVS",
//     "E1",
//     "E2",
//     "E3",
//     "E4",
//     "E5",
//     "E6",
//     "E7",
//     "E8",
//     "E9",
//     "E10",
//     "E11",
//     "E12",
//   ].includes(str);
// }

// function isTechGrade(str) {
//   return !!str.match(/\d+[a|b|c]/);
// }

// function isStarGrade(str) {
//   return str.includes("*");
// }

// function getGradeObject(str = "") {
//   const obj = {};
//   str.innerText.split(" ").forEach((subStr) => {
//     if (isTradGrade(subStr)) {
//       obj.tradGrade = subStr;
//     } else if (isTechGrade(subStr)) {
//       obj.techGrade = subStr;
//     } else if (isStarGrade(subStr)) {
//       obj.stars = subStr;
//     }
//   });
//   return obj;
// }

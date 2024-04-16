const { dbInsertArray, dbLoadFull, dbRun } = require("./db-utils");

/**
 * Get grade information from object in source here:
 * view-source:https://www.ukclimbing.com/logbook/crags/
 */
async function getGrades(db) {
  // extract all grades and place into
  const newGrades = [];
  Object.entries(grades).forEach(([_, types]) =>
    Object.entries(types).forEach(([_, type]) => {
      Object.entries(type.grades).forEach(([_, grade]) => {
        newGrades.push([
          grade.id,
          grade.name,
          grade.gradesystem,
          grade.gradetype,
          grade.score,
        ]);
      });
    })
  );

  console.log("adding grades");
  dbInsertArray(db, "grades", newGrades);
}

async function getGradeTypes(db) {
  console.log("adding grade types");
  dbInsertArray(db, "grade_types", [
    [1, "Winter"],
    [2, "Trad"],
    [3, "Sport"],
    [4, "Bouldering"],
    [5, "Aid"],
    [6, "Alpine"],
    [7, "Ice"],
    [10, "Mixed"],
    [11, "Via Ferrata"],
    [12, "Scrambling"],
  ]);
}

async function getGradeData() {
  const db = await dbLoadFull();
  await getGrades(db);
  await getGradeTypes(db);
}

getGradeData();

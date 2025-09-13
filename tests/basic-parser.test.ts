import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");

// Define the schema. This is a Zod construct, not a TypeScript type.
export const PersonRowSchema = z
  .tuple([z.string(), z.coerce.number()])
  .transform((tup) => ({ name: tup[0], age: tup[1] }));

// Define the corresponding TypeScript type for the above schema.
// Mouse over it in VSCode to see what TypeScript has inferred!
export type Person = z.infer<typeof PersonRowSchema>;

// Test for schema input
test("parseCSV with schema", async () => {
  const results = await parseCSV<Person>(PEOPLE_CSV_PATH, PersonRowSchema);
  // Ensure we received schemaReturn
  expect("data" in results).toBe(true);
  if (!("data" in results)) throw new Error("Expected schemaReturn");

  // Check valid rows
  results.data.forEach((person) => {
    expect(typeof person.name).toBe("string");
    expect(typeof person.age).toBe("number");
    expect(Number.isNaN(person.age)).toBe(false); // age should be a valid number
  });

})

// Test file is not empty
test("parseCSV reads non-empty file", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH);
  // run the test if the result is string[][]
  if (Array.isArray(results)) {
    expect(results.length).toBeGreaterThan(0);
    return;
  }
});

// Check if parser preserves comma inside quotes
test("parseCSV handles quoted fields with commas", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH);
  if (Array.isArray(results)) {
    expect(results[1]).not.toEqual(['"Doe, John"', '35']); 
  }
});


// Test if res == "Tim, Nelson, CSCI 0320, instructor"
test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  if (Array.isArray(results)) {
    expect(results).toHaveLength(5);
    expect(results[0]).toEqual(["name", "age"]); // Test whether the first row contains data or headers
    expect(results[1]).toEqual(["Alice", "23"]);
    expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
    expect(results[3]).toEqual(["Charlie", "25"]);
    expect(results[4]).toEqual(["Nim", "22"]);
  }
});

// Test whether all rows are arrays not strings
test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  if (Array.isArray(results)) {
    for(const row of results) {
      expect(Array.isArray(row)).toBe(true);
    }
  }
});

import * as fs from "fs";
import * as readline from "readline";
import {z, ZodType, ZodError} from "zod";

// Type of return val
export type schemaReturn<T> = {
  data: T[];
  errors: {
    line: number;
    content: string[];
    error: string;
  }[];
};


/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @param schema Accept a Zod schema as a parameter. 
 * @returns A promise resolving to an object containing valid data and validation errors, or string[][] if passes undefined
 */
export async function parseCSV<T>(
  path: string,
  schema?: ZodType<T>
): Promise<schemaReturn<T> | string[][]> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // variable is a "readline interface" that allows us to read the file
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });

  if (!schema) {
    // Fallback to original behavior if no schema is provided (undefined schema)
    const result: string[][] = [];
    for await (const line of rl) {
      const values = line.split(",").map((v) => v.trim());
      result.push(values);
    }
    return result;
  }
  else {
    const data: T[] = [];
    const errors: schemaReturn<T>["errors"] = [];
    let i = 0;
    for await (const line of rl) {
      i += 1;
      if (i === 1) continue; // Skip header line
      const values = line.split(",").map((v) => v.trim());
      try {
        const parsed = schema.parse(values);
        data.push(parsed);
      } catch (err) {
        if (err instanceof ZodError) {
          errors.push({
            line: i,
            content: values,
            error: err.issues.map(e => e.message).join("; ")
          });
        } else {
          throw err; 
        }
      }
    }
    return { data, errors};
  }
}
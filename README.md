# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.
1. Check embedded commas. For example a line like "Rui, Zhou", 23 should be parsed as ["Rui, Zhou", "23"], but may be incorrectly split into [""Rui", " Zhou"", "23"]
2. Check if newlines inside the quotes. 
3. Check row level validations, like ignoring blank lines.
4. Return objects rather than arrays.

- #### Step 2: Use an LLM to help expand your perspective.
1. Prompt 1: We are writing a test for the CSV Parser. What features or test cases did I miss?
2.  I’m working on a CSV parser in TypeScript that currently accepts a filename as input and converts rows into strings or objects. What are some missing features or edge cases that I should consider? What improvements would make it easier for other developers to use in different kinds of apps?
3. We are writing a test for the CSV parser. Start by creating a bullet list of key details about the CSV format specification. produce the list and then ask an important clarifying question. 

Prompt 1 focuses on test coverage, identifying practical cases like empty files, invalid file format, and large file handling. Prompt 2 emphasizes how to improve the parser as a product, not just for tests. Introducing more missing features like streaming, custom delimiters, CLI support, and schema-based validation—crucial for making the parser production-ready and user-friendly. Prompt 3 grounds the discussion in the CSV specification itself, highlighting subtleties like escaped quotes, line endings, and encodings while raising an essential clarifying question about scope. Together, they all mention features to test CSV parser.

- #### Step 3: use an LLM to help expand your perspective.

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 

    Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

In brainstorming enhancements for the CSV parser, my initial ideas focused on functional correctness—handling malformed rows, quoted fields, and header inference. The LLM expanded on this with deeper extensibility features like streaming large files, CLI support, and developer-facing error messages. Prompt 1 emphasized test cases, Prompt 2 provided product-oriented feature suggestions, and Prompt 3 grounded the conversation in standards. What resonated most with me was Prompt 2’s focus on configurability and usability in real-world applications—especially streaming and custom delimiter support. Less compelling was the deep spec-level detail in Prompt 3, like line endings and Unicode.

4 enhancement for future sprints:
1. Quoted Field handling (functionality) (source: both)
    User Story:
    As a developer using the CSV parser, I want it to correctly parse fields that are wrapped in quotes and may include commas or line breaks, so that the data remains consistent and isn’t split incorrectly.
    Acceptance Criteria:
	• Fields enclosed in quotes are treated as a single value, even if they contain commas or newlines.
	• Double quotes inside quoted fields are parsed correctly (escaped as "").
	• A test file with quoted values and commas/newlines passes without field splitting errors.

2. Inconsistent Row Length Detection (functionality) (source: LLM)
    User Story:
    As a developer, I want the parser to detect rows that have more or fewer columns than the header row, so I can avoid silently processing malformed data.
    Acceptance Criteria:
	• The parser returns an error or warning when a row has the wrong number of fields.
	• A configuration option allows the user to choose between “skip”, “warn”, or “throw” behavior.
	• Errors include line numbers to aid debugging.

3. Header Row Mapping to Objects (extensibility) (source: both)
    User Story:
    As a developer, I want to receive each row as a JavaScript object with key-value pairs based on the header row, so that I can access field values by name instead of index.
    Acceptance Criteria:
	• If header mode is enabled, return data like { name: "Alice", age: "23" }.
	• Header row is validated for uniqueness and non-empty keys.
	• Parser can fall back to arrays if headers are not present or invalid.
4. Streaming support for large file (extensibility) (source: LLM)
    User Story:
    As a developer working with large CSV files, I want to stream and parse rows incrementally instead of reading the whole file at once, so I can prevent memory overload and process data efficiently.
    Acceptance Criteria:
	• A streaming API is exposed to the user.
	• The parser processes one row at a time with minimal memory footprint.
	• Performance benchmarks are included for large file input (>100MB).


### Design Choices (Supplemental Challenge)
I choose Stack as my data structure.
We can represent a stack simply as an array, where the last item is the top of the stack.

```
import { z } from "zod";

type Stack<T> = {
  items: T[];
};

const StringStackSchema = z.object({
  items: z.array(z.string())
});

const data = {
  items: ["Alice", "Bob", "Charlie", "Nim"]
};

const result = StringStackSchema.safeParse(data);
if (result.success) {
  const stack = result.data;
  // Use stack.items
} else {
  console.error(result.error.format());
}
```

### 1340 Supplement

- #### 1. Correctness
    - The first row is column tag rather than data.
    - The order of rows and colummns should be preserved as in the original csv file. 
    - When we parse schema, the parser should check that each field matches the expected type.
    - If a row fails to match a schema, the parser report the failure fields to the caller rather than crash the program. 
    - Quoted string should be unwrapped properly, like the scenario of including embedded commas and newline inside the quotes.

- #### 2. Random, On-Demand Generation
    Randomly generate malformed rows (e.g., with missing fields, invalid types, broken quotes) to ensure the parser doesn’t crash and returns informative errors. 

- #### 3. Overall experience, Bugs encountered and resolved
    This sprint differed from prior programming assignments in a key way: we were allowed to use LLM to assist with development and debugging. In contrast, most past assignments either discouraged or restricted LLM use entirely. This freedom was both exciting and instructive — it encouraged me to compare my own understanding and debugging process with the solutions and suggestions provided by the LLM.

    One thing that surprised me was the behavior of z.coerce.number() in Zod. I expected it to throw an error if a string like "thirty" couldn’t be converted to a number. Instead, it silently coerced it into NaN, which wasn’t immediately caught by my schema. This led to a small that a invalid numeric input would still pass the schema unless I added an explicit .refine() check to ensure the result was not NaN.


#### Errors/Bugs:
    z.coerce.number() cast age "thirty" to NaN
#### Tests:
    Test if we received a NaN value.
    Test if the we throw the error if we meet a invalid number. 
#### How To…
    Test the NaN field by expect(Number.isNaN(person.age)).toBe(false);
    Refine schema to not accept NaN and throw error:
    z.coerce.number().refine((val) => !Number.isNaN(val), {
      message: "Age must be a valid number",
    })
#### Team members and contributions (include cs logins):
    rzhou52

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI): 
    GPT4o
#### Total estimated time it took to complete project:
    6h
#### Link to GitHub Repo:  
    https://github.com/cs0320-f25/typescript-csv-Bettyyy666.git

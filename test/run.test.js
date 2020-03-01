const YAML = require("yaml");

const run = require("../src/run");

describe("run", () => {
  const ENV_BAK = process.env;

  beforeEach(() => {
    process.exitCode = undefined;
    process.env = { ...ENV_BAK };
  });

  test("failure (missing inputs)", async () => {
    expect(process.exitCode).toBe(undefined);
    await run();
    expect(process.exitCode).toBe(1);
  });

  test("failure (invalid inputs)", async () => {
    process.env["INPUT_VERSION"] = "1.0";
    process.env["INPUT_ACTION"] = "validate";
    process.env["INPUT_FILE_PATH"] = "test/fixtures/htunk.zip";
    process.env["INPUT_FIELDS"] = YAML.stringify({
      pkg: "knuth",
      version: "foobar",
      author: "foobar",
      email: "foobar",
      uploader: "foobar",
      license: "bsd",
      summary: "foobar"
    });
    expect(process.exitCode).toBe(undefined);
    await run();
    expect(process.exitCode).toBe(1);
  });

  test("success", async () => {
    process.env["INPUT_VERSION"] = "1.0";
    process.env["INPUT_ACTION"] = "validate";
    process.env["INPUT_FILE_PATH"] = "test/fixtures/htunk.zip";
    process.env["INPUT_FIELDS"] = YAML.stringify({
      pkg: "htunk",
      version: "foobar",
      author: "foobar",
      email: "foobar",
      uploader: "foobar",
      license: "bsd",
      summary: "foobar"
    });
    expect(process.exitCode).toBe(undefined);
    await run();
    expect(process.exitCode).toBe(undefined);
  });
});

const rewire = require("rewire");

// NOTE: we're just testing the internals
const CTAN = rewire("../src/ctan");

describe("buildUrl", () => {
  const buildUrl = CTAN.__get__("buildUrl");

  test("default url is endpoint for validation on latest version", () => {
    expect(buildUrl()).toBe("https://www.ctan.org/submit/validate");
  });

  test("version can be customized", () => {
    expect(buildUrl({ version: "2.0" })).toBe(
      "https://www.ctan.org/submit/2.0/validate"
    );
  });

  test("action can be customized", () => {
    expect(buildUrl({ action: "upload" })).toBe(
      "https://www.ctan.org/submit/upload"
    );
  });

  test("everything can be customized", () => {
    expect(
      buildUrl({
        version: "2.0",
        action: "upload"
      })
    ).toBe("https://www.ctan.org/submit/2.0/upload");
  });
});

describe("postCallback", () => {
  const postCallback = CTAN.__get__("postCallback");

  test("throws request error if present", () => {
    expect(() => {
      postCallback(null, "This is an error!", null, null);
    }).toThrow("This is an error!");
  });

  test("logs response code", () => {
    const logger = { info: jest.fn() };
    postCallback(logger, null, 200, null);
    expect(logger.info).toHaveBeenCalledWith("CTAN responded with code 200");
  });

  test("logs body messages", () => {
    const logger = { info: jest.fn(), warning: jest.fn() };
    postCallback(logger, null, 200, '[["WARNING", "Label", "Details"]]');
    expect(logger.info).toHaveBeenCalledWith("CTAN responded with code 200");
    expect(logger.warning).toHaveBeenCalledTimes(1);
  });

  test("throws error if status code is failure", () => {
    const logger = { info: jest.fn() };
    expect(() => {
      postCallback(logger, null, 500, null);
    }).toThrow("CTAN submit failed: see log for details");
  });
});

describe("logBody", () => {
  const logBody = CTAN.__get__("logBody");

  test("passes through non-JSON body", () => {
    const logger = { info: jest.fn() };
    logBody(logger, "foobar");
    expect(logger.info).toHaveBeenCalledWith("CTAN says foobar");
  });

  test("passes through non-list JSON body", () => {
    const logger = { info: jest.fn() };
    logBody(logger, '{"foo": "bar"}');
    expect(logger.info).toHaveBeenCalledWith('CTAN says {"foo": "bar"}');
  });

  test("pretty prints a list JSON body", () => {
    const logger = { info: jest.fn() };
    logBody(logger, '[["INFO", "Label", "Details"]]');
    expect(logger.info).toHaveBeenCalledWith(
      'CTAN says ["INFO","Label","Details"]'
    );
  });
});

describe("maybeJSONParse", () => {
  const maybeJSONParse = CTAN.__get__("maybeJSONParse");

  test("parses valid JSON", () => {
    expect(maybeJSONParse("[1,2,3]")).toEqual([1, 2, 3]);
  });

  test("ignores invalid JSON", () => {
    expect(maybeJSONParse("foobar")).toBe(null);
  });
});

describe("logMessageList", () => {
  const logMessageList = CTAN.__get__("logMessageList");

  test("logs error entry", () => {
    const logger = { error: jest.fn() };
    logMessageList(logger, [["ERROR", "Label", "Details"]]);
    expect(logger.error).toHaveBeenCalledWith(
      'CTAN says ["ERROR","Label","Details"]'
    );
  });

  test("logs warning entry", () => {
    const logger = { warning: jest.fn() };
    logMessageList(logger, [["WARNING", "Label", "Details"]]);
    expect(logger.warning).toHaveBeenCalledWith(
      'CTAN says ["WARNING","Label","Details"]'
    );
  });

  test("logs info entry", () => {
    const logger = { info: jest.fn() };
    logMessageList(logger, [["INFO", "Label", "Details"]]);
    expect(logger.info).toHaveBeenCalledWith(
      'CTAN says ["INFO","Label","Details"]'
    );
  });

  test("logs other entry", () => {
    const logger = { info: jest.fn() };
    logMessageList(logger, [["OTHER", "Label", "Details"]]);
    expect(logger.info).toHaveBeenCalledWith(
      'CTAN says ["OTHER","Label","Details"]'
    );
  });

  test("logs many entries", () => {
    const logger = { error: jest.fn() };
    logMessageList(logger, [
      ["ERROR", "Label", "Details"],
      ["ERROR", "Label", "Details"]
    ]);
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});

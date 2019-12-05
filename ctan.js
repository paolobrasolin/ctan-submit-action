const request = require("request");
const util = require("util");

const BASE_URL = "https://www.ctan.org/submit";

function post({
  version = undefined,
  action = "validate",
  formData = {},
  logger = console
} = {}) {
  return util
    .promisify(request.post)({
      url: buildUrl({ version: version, action: action }),
      formData: formData
    })
    .then(({ error, statusCode, body }) => {
      postCallback(logger, error, statusCode, body);
    });
}

function buildUrl({ version = undefined, action = "validate" } = {}) {
  if (version === undefined) {
    return [BASE_URL, action].join("/");
  } else {
    return [BASE_URL, version, action].join("/");
  }
}

function postCallback(logger, error, statusCode, body) {
  if (error) throw error;
  logger.info(`CTAN responded with code ${statusCode}`);
  // NOTE: codes expected to return the log as a JSON list are 200, 404 (sometimes), and 409.
  logBody(logger, body);
  // NOTE: documented error codes are only 404, 409, and 500.
  if (statusCode >= 400) throw "CTAN submit failed: see log for details";
}

function logBody(logger, body) {
  const messageList = maybeJSONParse(body);
  if (Array.isArray(messageList)) {
    logMessageList(logger, messageList);
  } else {
    logger.info("CTAN says " + body);
  }
}

function maybeJSONParse(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

function logMessageList(logger, messageList) {
  messageList.forEach(message => {
    const humanMessage = "CTAN says " + JSON.stringify(message);
    const messageType = message[0];
    switch (messageType) {
      case "ERROR":
        logger.error(humanMessage);
        break;
      case "WARNING":
        logger.warning(humanMessage);
        break;
      default:
        // i.e. "INFO" and everything else
        logger.info(humanMessage);
    }
  });
}

const CTAN = {
  post: post
};

module.exports = CTAN;

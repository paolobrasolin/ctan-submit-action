const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const CTAN = require("./ctan");

async function run() {
  try {
    core.info("Reading action inputs:");

    const version = core.getInput("version");
    core.info("  Version: " + JSON.stringify(version));

    const action = core.getInput("action");
    core.info("  Action: " + JSON.stringify(action));

    const fields = core.getInput("fields", { required: true });
    const formDataFields = YAML.parse(fields);
    core.info("  Parameters: " + JSON.stringify(formDataFields));

    const filePath = core.getInput("file_path", { required: true });
    const formDataFile = fs.createReadStream(filePath);
    core.info("  Filepath: " + JSON.stringify(path.resolve(formDataFile.path)));

    const formData = { ...formDataFields, file: formDataFile };

    core.info("Starting API request...");

    await CTAN.post({
      version: version,
      action: action,
      formData: formData,
      logger: core
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

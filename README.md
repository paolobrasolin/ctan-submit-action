# CTAN submit

[![CI tests status badge][ci-shield]][ci-url]

[![Latest release badge][release-shield]][release-url]
[![License badge][license-shield]][license-url]

[ci-url]: https://github.com/paolobrasolin/ctan-submit-action/actions/workflows/main.yml "CI tests"
[ci-shield]: https://img.shields.io/github/actions/workflow/status/paolobrasolin/ctan-submit-action/main.yml?branch=main&label=tests&logo=github
[release-url]: https://github.com/paolobrasolin/ctan-submit-action/releases "Latest release"
[release-shield]: https://img.shields.io/github/v/release/paolobrasolin/ctan-submit-action?display_name=tag&sort=semver
[license-url]: https://github.com/paolobrasolin/ctan-submit-action/blob/main/LICENSE "License"
[license-shield]: https://img.shields.io/github/license/paolobrasolin/ctan-submit-action

This action performs a submit on the CTAN API to validate or upload a package.

## Usage

As any other action, it's recommended to use the latest stable version: `paolobrasolin/ctan-submit-action@v1`.

### Inputs

#### `version`

This is the CTAN API version to address.

This input is **not required** and has **no default**.

Effectively, the latest CTAN API version will be addressed by default.
That is most probably what you want.

Currently versions `1.1` and `1.0` (deprecated) exist.
More details at [Submitting to CTAN](https://ctan.org/help/submit/).

#### `action`

This is the action to perform upon submit.

This input is **not required** and **defaults to `validate`**.

Allowed values are:

- `validate` to validate your submission.
  More details at [Sending a Validation Request to CTAN
  ](https://ctan.org/help/submit/#validation)

- `upload` to validate and upload your submission.
  More details at [Sending a Submission Request to CTAN
  ](https://ctan.org/help/submit/#submit)

#### `file_path`

This is the archive file path of the package you are submitting.

This input is **required** and has **no default**.

You can find more details on structuring the archive at [How can I upload a package?
](https://ctan.org/help/upload-pkg) and [Additional Information for CTAN Uploaders
](https://ctan.org/file/help/ctan/CTAN-upload-addendum).

#### `fields`

This is a YAML string containing all metadata of the package you are submitting.

This input is **required** and has **no default**.

You can find exhaustive documentation for the available parameters at [Parameters for Validation](https://ctan.org/help/submit#validation.parameters).

### Outputs

Currently there are no outputs.

The action will succeed (fail) if the request to the API succeeds (fails).

All errors, warnings and informative messages given by CTAN will be displayed in the log of your job.

### Example

```yaml
# ...
jobs:
  # ...
  my_job_name:
    # ...
    steps:
      # ...
      - uses: paolobrasolin/ctan-submit-action@v1
        with:
          file_path: htunk.zip
          fields: |
            pkg: htunk
            version: 0.1.0
            author: Paolo Brasolin
            email: paolo.brasolin@gmail.com 
            uploader: paolo.brasolin@gmail.com 
            license: mit
            summary: This is a CI test
```

You can see this very example in action as the `main` workflow of this repo, running nightly:

- check out [the workflow code](https://github.com/paolobrasolin/ctan-submit-action/blob/main/.github/workflows/main.yml)
- comb through [the workflow logs](https://github.com/paolobrasolin/ctan-submit-action/actions?query=event%3Aschedule)
- admire the badge ![nightly][ci-shield]

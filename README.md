# CTAN submit

[![CI tests status badge][ci-shield]][ci-url]

[![Latest release badge][release-shield]][release-url]
[![License badge][license-shield]][license-url]

[ci-url]: https://github.com/paolobrasolin/ctan-submit-action/actions/workflows/main.yml "CI tests"
[ci-shield]: https://img.shields.io/github/actions/workflow/status/paolobrasolin/ctan-submit-action/main.yml?branch=main&label=nightly%20check&logo=github
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

## Example workflows

The implementation details of your workflow will depend very much on your needs, but here a few examples you can get inspiration from.

### Validating

There is a very simple workflow running a nightly check on this repo to ensure everything is in working order:

[![CI tests status badge][ci-shield]][ci-url]

It uses CTAN API to perform a simple validity check, without actually submitting anything.
As long as the badge is green we can sleep easy using this action.

You can read its [full sourcode](https://github.com/paolobrasolin/ctan-submit-action/blob/main/.github/workflows/main.yml), but here's the gist of its structure:

```yaml
name: validate
on:
  # ...
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2
      - name: CTAN submit (validate only)
        uses: paolobrasolin/ctan-submit-action@v1
        with:
          action: validate
          # We use the file_path of a pre-built test fixture committed to the repo. You'd normally use the path of the archive resulting from your build steps.
          file_path: ${{ github.workspace }}/test/fixtures/htunk.zip
          fields: |
            pkg: htunk
            version: 0.1.0
            author: Paolo Brasolin
            email: paolo.brasolin@gmail.com 
            uploader: paolo.brasolin@gmail.com 
            license: mit
            summary: This is a CI test
```

### Releasing

Normally you'd want to use this action to publish releases to CTAN (and perhaps to GitHub itself).

Here are the broad strokes of how you could implement that:

```yaml
name: release
on:
  push:
    tags:
      # We match pushes of semantic versioning tags.
      - v[0-9]+.[0-9]+.[0-9]+
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2

      - # This step extracts the tag and the version into variables for reuse; you can do this in your preferred way.
        name: Labeller
        id: labeller
        run: |
          echo "TAG=${GITHUB_REF/refs\/tags\//}" >> $GITHUB_OUTPUT
          echo "VERSION=${GITHUB_REF/refs\/tags\/v/}" >> $GITHUB_OUTPUT

      - # This step is where you build the distributable of your package, named foobar.
        name: Build
        run: |
          # TODO: somehow build and archive your package into dist/foobar.zip
          cp dist/foobar.zip dist/foobar-${{ steps.labeller.outputs.version }}.zip

      - # Optionally, you can also publish your release to GitHub.
        name: Release on Github
        uses: docker://antonyurchenko/git-release:v3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DRAFT_RELEASE: "false"
          CHANGELOG_FILE: "CHANGELOG.md"
          ALLOW_EMPTY_CHANGELOG: "false"
          ALLOW_TAG_PREFIX: "true"
          RELEASE_NAME: "Foobar ${{ steps.labeller.outputs.version }}"
        with:
          args: |
            dist/foobar-${{ steps.labeller.outputs.version }}.zip

      - # This step is executed only on the first submission of your package to CTAN, assuming your first release tag is v1.0.0. Note that it requires a lot more fields than the simple update step below. Please read and follow CTAN documentation to fill out everything correctly.
        name: Submit to CTAN (first release)
        if: ${{ steps.labeller.outputs.version == '1.0.0' }}
        uses: paolobrasolin/ctan-submit-action@v1
        with:
          action: upload
          file_path: dist/foobar-${{ steps.labeller.outputs.version }}.zip
          fields: |
            update: "false"
            pkg: foobar
            version: ${{ steps.labeller.outputs.version }}
            uploader: Paolo Brasolin
            email: paolo.brasolin@gmail.com
            author: Paolo Brasolin
            license: mit
            ctanPath: /graphics/pgf/contrib/foobar
            topic: diagram
            home: https://paolobrasolin.github.io/foobar/
            bugs: https://github.com/paolobrasolin/foobar/issues
            repository: https://github.com/paolobrasolin/foobar
            summary: >
              Foobar: foobars for TeX
            description: >
              Foobar is a TikZ library. Its aim is making foobars more approachable for people using TikZ to draw them.
            note: >
              Extra relevant topics are: diagram-maths maths pgf-tikz

      - # This step is executed on all subsequent submissions of your package to CTAN. In fact, this is simply an update to an existing package.
        name: Submit to CTAN (update)
        if: ${{ steps.labeller.outputs.version != '1.0.0' }}
        uses: paolobrasolin/ctan-submit-action@v1
        with:
          action: upload
          file_path: dist/foobar-${{ steps.labeller.outputs.version }}.zip
          fields: |
            update: "true"
            pkg: foobar
            version: ${{ steps.labeller.outputs.version }}
            uploader: Paolo Brasolin
            email: paolo.brasolin@gmail.com
```

### Other examples

Here is the list of all projects using this action: https://github.com/paolobrasolin/ctan-submit-action/network/dependents

You can peek at their CI setup to find other live examples and learn more about how it can be used.

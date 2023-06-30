# Thin-edge documentation

This repository contains [Docusaurus 2](https://docusaurus.io/) configuration files
for generating the documentation of [thin-edge](https://github.com/thin-edge/thin-edge.io).


The documentation source files are stored in the [main thin-edge.io](https://github.com/thin-edge/thin-edge.io/tree/main/docs/src) repository.

__Warning__ This is a work in progress.
Currently you have to check out the documentation from [this PR](https://github.com/thin-edge/thin-edge.io/pull/2003)

## Running docs in development

The instructions below detail how to build and serve the documentation.

1. Clone the project and change directory to the project

    ```sh
    git clone https://github.com/thin-edge/tedge-docs
    cd tedge-docs
    ```

2. Checkout the thin-edge.io source markdown files

    ```sh
    just init

    # Optional (if you want to include the last official docs as well)
    just checkout-version
    ```

    You can also checkout a fork instead (rather than the main project)by providing the git url of the fork as the first positional argument.

    ```sh
    just project=https://github.com/myuser/thin-edge.io.git init
    ```

3. Start the documentation (using a local dev server)

    ```sh
    just docs
    ```

    Alternatively you can start the doc

    ```sh
    just docs-container
    ```

    **Note**

    * The thin-edge.io repo be cloned automatically in a sibling folder (on the same level as the `tedge-docs` project)

4. You can now edit the thin-edge.io documents under the `docs/src` folder of the `thin-edge.io` repository. Any changes will be detected and the browser page will be refreshed automatically.

## Building the docs

Assuming you have done the initial project setup in the [running docs in development](./README.md#running-docs-in-development) section, then you can build the production files using the following steps:

These instructions will produce a static web-site in the `build/` folder at the root project directory.

### Natively (if you have nodejs installed on your machine/dev container)

```sh
just build
```

Then verify the result by serving the files:

### Container

```sh
just docs-container yarn build
```

Then verify the result by serving the files:

```sh
just docs-container yarn serve
```

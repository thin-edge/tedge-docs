# Thin-edge documentation

This repository contains [Docusaurus 2](https://docusaurus.io/) configuration files
for generating the documentation of [thin-edge](https://github.com/thin-edge/thin-edge.io).


The documentation source files are stored in the [main thin-edge.io](https://github.com/thin-edge/thin-edge.io/tree/main/docs/src) repository.

Check out the [online documentation](https://thin-edge.github.io/thin-edge.io) to see how the docs looked when published by Docusaurus.

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

## Checkout a branch and treat it as a specific version

To support use-cases where the documentation has been fixed after a tag has been created, the following command allows you to checkout a specific branch and treat it like the given version.

The following will checkout the `main` branch and treat it as the `0.11.0` version.

```sh
just checkout-version 0.11.0 main
```

Once you have done this, then you can commit the files to the project.

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

## Community Plugin Documentation

The docs also maintain a custom (React) component to display the list of Community Plugins in an interactive way, to make it easier for users to search for plugins which interest them. Each plugin includes a short description, and links to the repository code and the installable package (if applicable).The same plugin list will be visible in all displayed documentation version to increase their visibility to users.

### Add or edit a plugin

The list of plugins is sourced via a single [typescript file](./src/data/plugins.tsx) which makes it easier to maintain and keep consistent across all plugins.

To add or edit a plugin use the following procedure:

1. Fork the repo
2. Create a new branch with a name relevant to your change
3. Edit the [typescript file](./src/data/plugins.tsx) file and add the plugin to the array

    **Notes**

    * Add any relevant *tags* to the plugins to allow searching for the plugins based on a fixed list of keywords.

4. Create a PR against the `main` branch of the upstream repository

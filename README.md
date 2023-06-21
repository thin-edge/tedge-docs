# Thin-edge documentation

This repository contains [Docusaurus 2](https://docusaurus.io/) configuration files
for generating the documentation of [thin-edge](https://github.com/thin-edge/thin-edge.io).


The documentation source files are stored in the [main thin-edge.io](https://github.com/thin-edge/thin-edge.io/tree/main/docs/src) repository.

__Warning__ This is a work in progress.
Currently you have to check out the documentation from [this PR](https://github.com/thin-edge/thin-edge.io/pull/2003)

## Build the docs

Clone this repository along a clone of the main thin-edge repository.
The latter provides the doc contents, the former the tools.

```sh
git clone https://github.com/thin-edge/tedge-docs
git clone https://github.com/thin-edge/thin-edge.io
```

Build the docker container

```sh
cd tedge-docs
docker build -t docusaurus docusaurus/tedge
```

Run the docusaurus container.
Note how both this repo and the main tedge repo are made available to docusaurus,
the docs src directory being injected into the docusaurus tree.

```sh
docker run --rm -it \
  --mount "type=bind,src=$PWD/docusaurus,target=/docusaurus" \
  --mount "type=bind,src=$PWD/../thin-edge.io/docs/src,target=/docusaurus/tedge/docs" \
  -p 127.0.0.1:3000:3000/tcp \
  docusaurus
```

The static web-site is then available in `docusaurus/tedge/build`.

## Running the docs natively (without a container)

The instructions below detail how to build and serve the documentation by using nodejs installed on your local machine. It assumes you already have nodejs (>=18) installed.

1. Clone the project and change directory to the project

    ```sh
    git clone https://github.com/thin-edge/tedge-docs
    cd tedge-docs
    ```

2. Checkout the thin-edge.io

    ```sh
    just init
    ```

    Or if you want to use a different fork of the `thin-edge.io` project you can provide the url to the fork that you want to clone instead.

    ```sh
    just init https://github.com/myuser/thin-edge.io.git
    ```

3. Start the documentation

    ```sh
    just docs
    ```

    **Note**

    * The thin-edge.io repo be cloned automatically in a sibling folder (on the same level as the `tedge-docs` project)

4. You can now edit the thin-edge.io documents under the `docs/src` folder of the `thin-edge.io` repository. Any changes will be detected and the browser page will be refreshed automatically.

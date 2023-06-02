# Thin-edge documentation

This repository contains [Docusaurus 2](https://docusaurus.io/) configuration files
for generating the documentation of [thin-edge](https://github.com/thin-edge/thin-edge.io).


The documentation source files are stored in the [main thin-edge.io](https://github.com/thin-edge/thin-edge.io/tree/main/docs/src) repository.


## Build the docs

Clone this repository along a clone of the main thin-edge repository.
The latter provides the doc contents, the former the tools.

```
$ git clone https://github.com/thin-edge/tedge-docs
$ git clone https://github.com/thin-edge/thin-edge.io
```

Build the docker container

```
$ cd tedge-docs
$ docker build -t docusaurus .
```

Run the docusaurus container.
Note how both this repo and the main tedge repo are made available to docusaurus,
the docs src directory being injected into the docusaurus tree.

```
$ docker run --rm -it \
  --mount "type=bind,src=$PWD/docusaurus,target=/docusaurus" \
  --mount "type=bind,src=$PWD/../thin-edge.io/docs/src,target=/docusaurus/tedge/docs" \
  -p 127.0.0.1:3000:3000/tcp \
  docusaurus sh
```

The static web-site is then available in `docusaurus/tedge/build`.

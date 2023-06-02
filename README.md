# Thin-edge documentation

This repository contains [Docusaurus 2](https://docusaurus.io/) configuration files
for generating the documentation of [thin-edge](https://github.com/thin-edge/thin-edge.io).

## Run it

```
$ docker run --rm -it --mount "type=bind,src=$PWD/docusaurus,target=/docusaurus" -p 127.0.0.1:3000:3000/tcp docusaurus sh
```

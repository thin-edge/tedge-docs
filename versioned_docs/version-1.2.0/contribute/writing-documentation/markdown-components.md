---
title: Markdown Components
tags: [Documentation]
sidebar_position: 1
---

# Markdown components

Docusaurus provides a rich set of features to write really nice documentation. Please read their [online docs](https://docusaurus.io/docs/markdown-features) to check out the markdown features.

This page details the custom markdown extensions available when writing the documentation.

## Command block

If you what to generate the contents of a code block at build time, then you can use the special `command` directive to indicate that the code-blocks contents should be set from the output of a command.

|Property|Type|Description|
|--------|----|-----------|
|`command`|string|Command to be executed during build time. Command must return an exit code 0.|

If the code block title is not provided, then the plugin will set it to `Output`.


### Example: Simple command

For example, the following snippet will execute `ls -l` and store the command's output in the code block.

````markdown title="Markdown"
```text command="ls -l"
```
````

**Output**

```text command="ls -l"
```

### Example: Simple command with custom title

Execute a command and store the output. Use a custom title for the code block.

````markdown title="Markdown"
```text command="ls -l" title="My custom title"
```
````

**Output**

```text command="ls -l" title="My custom title"
```

### Example: Simple command with default contents

If you would like to make the code block still readable by other markdown renders (e.g. GitHub), then you can provide a sensible default value inside the code block.

Execute a command and store the output. Use a custom title for the code block.

````markdown title="Markdown"
```text command="ls -l" title="My custom title"
total 848
-rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
-rw-r--r--    1 tedge  staff    2718 Jul  4 15:31 README.md
-rw-r--r--@   1 tedge  staff      89 Jun 22 11:13 babel.config.js
drwxr-xr-x@  21 tedge  staff     672 Jul  4 15:13 build
lrwxr-xr-x@   1 tedge  staff      24 Jun 20 18:41 docs -> ../thin-edge.io/docs/src
-rw-r--r--    1 tedge  staff    6200 Jul  4 15:19 docusaurus.config.js
-rw-r--r--    1 tedge  staff    3296 Jul  3 17:36 justfile
drwxr-xr-x@ 751 tedge  staff   24032 Jul  4 09:10 node_modules
-rw-r--r--    1 tedge  staff    1363 Jul  4 09:18 package.json
-rw-r--r--@   1 tedge  staff     781 Jun 22 11:13 sidebars.js
drwxr-xr-x@   6 tedge  staff     192 Jul  1 11:08 src
drwxr-xr-x@   4 tedge  staff     128 Jun 22 11:13 static
drwxr-xr-x@   3 tedge  staff      96 Jul  4 15:22 versioned_docs
drwxr-xr-x@   3 tedge  staff      96 Jul  3 18:55 versioned_sidebars
-rw-r--r--@   1 tedge  staff      10 Jul  4 15:22 versions.json
-rw-r--r--    1 tedge  staff  394026 Jul  4 09:18 yarn.lock
```
````

**Output**

```text command="ls -l"
total 848
-rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
-rw-r--r--    1 tedge  staff    2718 Jul  4 15:31 README.md
-rw-r--r--@   1 tedge  staff      89 Jun 22 11:13 babel.config.js
drwxr-xr-x@  21 tedge  staff     672 Jul  4 15:13 build
lrwxr-xr-x@   1 tedge  staff      24 Jun 20 18:41 docs -> ../thin-edge.io/docs/src
-rw-r--r--    1 tedge  staff    6200 Jul  4 15:19 docusaurus.config.js
-rw-r--r--    1 tedge  staff    3296 Jul  3 17:36 justfile
drwxr-xr-x@ 751 tedge  staff   24032 Jul  4 09:10 node_modules
-rw-r--r--    1 tedge  staff    1363 Jul  4 09:18 package.json
-rw-r--r--@   1 tedge  staff     781 Jun 22 11:13 sidebars.js
drwxr-xr-x@   6 tedge  staff     192 Jul  1 11:08 src
drwxr-xr-x@   4 tedge  staff     128 Jun 22 11:13 static
drwxr-xr-x@   3 tedge  staff      96 Jul  4 15:22 versioned_docs
drwxr-xr-x@   3 tedge  staff      96 Jul  3 18:55 versioned_sidebars
-rw-r--r--@   1 tedge  staff      10 Jul  4 15:22 versions.json
-rw-r--r--    1 tedge  staff  394026 Jul  4 09:18 yarn.lock
```

## Generic code block tabs

Generic code block tabs can be created by adding the `tab` directive to consecutive code blocks. This allows you to display the related code blocks in a tab format which not only saves spaces, but also give the user more control over what they want to focus on.

The directive is provided by the [mrazauskas/docusaurus-remark-plugin-tab-blocks](https://github.com/mrazauskas/docusaurus-remark-plugin-tab-blocks) plugin.

### Example: Simple tabs

The following uses code blocks and uses the syntax highlighter option as the tab names. This only makes sense if you don't want to use syntax highlighting in your commands.

````markdown title="Markdown"
```systemd tab
systemctl status tedge
```

```openrc tab
service tedge status
```
````

**Output**

```systemd tab
systemctl status tedge
```

```openrc tab
rc-service tedge status
```

### Example: Tabs with custom labels

Custom labels can be added to each table by specifying the `"label"` option on the `tab` directive.

Below shows two sets of code blocks, the first being instructions how to connect the mapper to 3 different clouds, and the other set shows how to disconnect the mapper for the same clouds. By default any tabs that use the same label-name will be automatically synced.

````markdown title="Markdown"
**Connect mapper**

```sh tab={"label":"c8y"}
tedge connect c8y
```

```sh tab={"label":"az"}
tedge connect az
```

```sh tab={"label":"aws"}
tedge connect aws
```

**Disconnect mapper**

```sh tab={"label":"c8y"}
tedge disconnect c8y
```

```sh tab={"label":"az"}
tedge disconnect az
```

```sh tab={"label":"aws"}
tedge disconnect aws
```
````

**Output**

**Connect mapper**

```sh tab={"label":"c8y"}
tedge connect c8y
```

```sh tab={"label":"az"}
tedge connect az
```

```sh tab={"label":"aws"}
tedge connect aws
```

**Disconnect mapper**

```sh tab={"label":"c8y"}
tedge disconnect c8y
```

```sh tab={"label":"az"}
tedge disconnect az
```

```sh tab={"label":"aws"}
tedge disconnect aws
```

## MQTT Code block

One of the main interfaces for %%te%% is MQTT, therefore a special plugin has been created to display how to publish/subscribe to messages on an MQTT broker.

The code block only expects the writer to provide the `tedge mqtt ...` command, and the plugin will take care of the translation to the various formats. The decision was made to use the `tedge mqtt` command as the base format so that the code blocks would also still be useful when viewing the raw markdown documents.

The MQTT code block is activated by using the `te2mqtt` directive. The directive will translate the `tedge mqtt` command into the different variants and display them as a grouped tab. The reader is then able to select the tab which is relevant to their use-case and this setting will sticky (stored in their browser's local storage).

### Example: Publish MQTT message

The following shows how to document how to publish a single MQTT message.

**Markdown**

````markdown title="Markdown"
```sh te2mqtt formats=v1
tedge mqtt pub te/device/main///m/ '{"temperature": 21.3}'
```
````

**Output**

```sh te2mqtt formats=v1
tedge mqtt pub te/device/main///m/ '{"temperature": 21.3}'
```

### Example: Use legacy MQTT api

The tedge api code blocks also have the option to set which formats should be displayed, for example the legacy or new v1 api.

**Markdown**

````markdown title="Markdown"
```sh te2mqtt formats=legacy,v1
tedge mqtt pub tedge/alarms/major/temp_hi_hi/child01 '{"text": "Temperature Hi Hi"}'
```
````

**Output**

```sh te2mqtt formats=legacy,v1
tedge mqtt pub tedge/alarms/major/temp_hi_hi/child01 '{"text": "Temperature Hi Hi"}'
```

### Example: Use new MQTT api

The MQTT code block can also be written using the new MQTT api and the command will be automatically translated to the legacy (if there is an equivalent).

**Markdown**

````markdown title="Markdown"
```sh te2mqtt formats=legacy,v1
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```
````

**Output**

```sh te2mqtt formats=legacy,v1
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```

### Example: MQTT code blocks with different grouping options

The tedge api code blocks can also be grouped in different ways.

#### Grouped

**Markdown**

````markdown title="Markdown"
```sh te2mqtt formats=legacy,v1 groupTabs=true
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```
````

**Output**

```sh te2mqtt formats=legacy,v1 groupTabs=true
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```

#### Ungrouped

**Markdown**

````markdown title="Markdown"
```sh te2mqtt formats=legacy,v1 groupTabs=false
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```
````

**Output**

```sh te2mqtt formats=legacy,v1 groupTabs=false
tedge mqtt pub te/device/child01///a/temp_hi_hi '{"text": "Temperature Hi Hi", "severity": "warning"}'
```

### Example: Subscribe to MQTT messages

````markdown title="Markdown"
```sh te2mqtt formats=v1
tedge mqtt sub 'te/#'
```
````

**Output**

```sh te2mqtt formats=v1
tedge mqtt sub 'te/#'
```

### Example: Subscribe to MQTT messages and redirect the output

Any additional arguments will be automatically preserved when translating the commands. Though the `mqtt` tab will not display this information it is just meant to represent the MQTT message and does not know anything about the terminal/console.

````markdown title="Markdown"
```sh te2mqtt formats=v1
tedge mqtt sub 'te/#' > logged.tedge.messages.txt
```
````

**Output**

```sh te2mqtt formats=v1
tedge mqtt sub 'te/#' > logged.tedge.messages.txt
```

## Proposal Banner

A proposal banner is used to indicate that a page details a proposal only and is not yet implemented. The banner allows the proposal to be made public to encourage early feedback from the community as the page will be included in the public documentation.

:::note
If a proposal is not ready for public feedback, then it should be marked as a draft by setting the `draft: true` in the page's [front matter](https://docusaurus.io/docs/markdown-features#front-matter) section. Draft pages are not included in the public documentation, though they are included when building the docs locally in development mode.
:::

The proposal banner can be included in a page by adding the following markdown to the top of the page (after the [front matter](https://docusaurus.io/docs/markdown-features#front-matter) section).

````markdown title="Markdown"
import ProposalBanner from '@site/src/components/ProposalBanner'

<ProposalBanner/>
````

**Output**

import ProposalBanner from '@site/src/components/ProposalBanner'

<ProposalBanner/>

In addition to the `<ProposalBanner/>`, a proposal page should include the construction icon (🚧) before the page's title so that the page's entry in the sidebar menu clearly shows that the page is a proposal or a work in progress. The example below shows how the page's title is set via the front matter at the top of the markdown document.


````markdown title="Markdown"
---
title: 🚧 MQTT API
tags: [Reference, MQTT]
sidebar_position: 6
---
````

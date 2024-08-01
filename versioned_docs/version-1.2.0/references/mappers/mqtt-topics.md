---
title: MQTT Topics
tags: [Reference, Mappers, MQTT]
sidebar_position: 2
---

# MQTT topics

This document lists the MQTT topics that are used by the mappers.

## Cumulocity MQTT Topics

The topics follow the below format
`<protocol>/<direction><type>[/<template>][/<child id>]`

| Protocol | Direction | Type |
|----------|-----------|-------|
| s = standard  | u = upstream | s =  static (built-in)
| t = transient | d = downstream |c = custom (device-defined)
|               |  e = error| d = default (defined in connect)
|               |           | t = template
|               |           | cr = credentials

### SmartREST2.0 topics

   All Cumulocity topics have been prefixed by `c8y/`.

* Creating template topics
     c8y/s/dt
     c8y/s/ut/#

* Static templates topics
    c8y/s/us
    c8y/t/us
    c8y/q/us
    c8y/c/us
    c8y/s/ds

* Debug topics
    c8y/s/e

* Custom template topics
    c8y/s/uc/#
    c8y/t/uc/#
    c8y/q/uc/#
    c8y/c/uc/#
    c8y/s/dc/#

### C8Y JSON topics

    c8y/measurement/measurements/create
    c8y/error

You can find more information about Cumulocity topics
[Here](https://tech.forums.softwareag.com/t/cumulocity-iot-tips-and-tricks-mqtt-cheat-sheet/237187)

## Azure MQTT Topics

MQTT clients on %%te%% device must use the below topics to communicate with the Azure cloud.
The Azure topics are prefixed by `az/`.

* `az/messages/events/`  - Use this topic to send the messages from device to
 cloud. The messages are forwarded to the Azure topic named
 `devices/{device_id}/messages/events/` where device_id is the %%te%% device
 id.

* `az/messages/devicebound/#` - Use this topic to subscribe for the messages that were sent from cloud to device.
 Any message published by Azure on one the subtopics of `devices/{device_id}/messages/devicebound/#`
 is republished here.

## AWS MQTT Topics

MQTT clients on %%te%% device must use the below topics to communicate with the AWS cloud.
The AWS topics are prefixed by `aws/`.

* `aws/td/#` - Use this topic to send the messages from device to cloud. The messages are forwarded to the AWS topic
 named `thinedge/{device_id}/td` where `{device_id}` is the %%te%% device id.

* `aws/cmd/#` - Use this topic to subscribe for the messages that were sent from cloud to device. Any message published
 by AWS on one the subtopics of `thinedge/{device_id}/cmd/#` is republished here.

* `aws/shadow/#` Use this topic to interact with unnamed and named shadows of the device. It's mapped to
  `$aws/things/{device_id}/shadow`.

## Collectd topics

When the [device monitoring feature is enabled](../../start/device-monitoring.md),
monitoring metrics are emitted by `collectd` on a hierarchy of MQTT topics.

* `collectd/$HOSTNAME/#` - All the metrics collected on the device (which hostname is `$HOSTNAME`).
* `collectd/$HOSTNAME/$PLUGIN/#` - All the metrics collected by a given collectd plugin, named `$PLUGIN`.
* `collectd/$HOSTNAME/$PLUGIN/$METRIC` - The topic for a given metric, named `$METRIC`.
   All the measurements are published as a pair of a Unix timestamp in milliseconds and a numeric value
   in the format `$TIMESTAMP:$VALUE`. For example, `1623155717:98.6`.

The `collectd-mapper` daemon process ingests these measurements and emits translated messages
to the measurement topic.

* This process groups the atomic measurements that have been received during the same time-window (currently 200 ms)
* and produces a single %%te%% JSON for the whole group of measurements.

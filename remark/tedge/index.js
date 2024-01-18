/*
  Helper functions to parse meta data associated to a node
*/

import { parse } from 'shell-quote';

const MQTT_PUB = 'pub';
const MQTT_SUB = 'sub';

function parseTedgeCommand(code, format = 'legacy', debug = false) {
  const api = {
    action: MQTT_PUB,
    topic: '',
    payload: '',
    retain: false,
    qos: 0,
    // Preserve any additional arguments
    remainingArgs: '',
  };

  let args = parse(code);
  const positionalArgs = [];

  let i = 3;
  while (i < args.length) {
    if (args[i] == '-r' || args[i] == '--retain') {
      api.retain = true;
    } else if (args[i] == '--no-topic') {
      // Ignore tedge mqtt sub specific argument
    } else if (args[i] == '-q' || args[i] == '--qos') {
      i++;
      if (i < args.length) {
        api.qos = args[i];
      }
    } else {
      if (typeof args[i] === 'string') {
        positionalArgs.push(args[i]);
      } else {
        // shell operator (e.g. > or ||) are stored as an object
        positionalArgs.push(args[i].op);
      }
    }
    i++;
  }

  if (code.startsWith('tedge mqtt sub')) {
    api.action = MQTT_SUB;
    if (positionalArgs.length > 0) {
      api.topic = positionalArgs.shift();
    }
  } else if (code.startsWith('tedge mqtt pub')) {
    api.action = MQTT_PUB;
    if (positionalArgs.length > 0) {
      api.topic = positionalArgs.shift();
    }
    if (positionalArgs.length > 0) {
      api.payload = positionalArgs.shift();
    }
  } else {
    api.action = '';
  }
  if (positionalArgs.length > 0) {
    api.remainingArgs = positionalArgs.join(' ');
  }

  // Convert tedge message format
  const convertedApi = convertTedgeMessageFormat(
    api.topic,
    api.payload,
    format,
  );

  if (debug) {
    console.log('Converted api', {
      api,
      convertedApi,
      format,
    });
  }

  api.topic = convertedApi.topic;
  api.payload = convertedApi.payload;
  return api;
}

/*
Convert a tedge mqtt sub|pub command to the equivalent mosquitto command
*/
function convertToMosquitto(api) {
  if (api.action == MQTT_SUB) {
    return toMosquittoSubCli(api);
  }
  return toMosquittoPubCli(api);
}

function toMosquittoPubCli(options) {
  const command = ['mosquitto_pub'];

  if (options.retain) {
    command.push('-r');
  }
  if (options.qos) {
    command.push('-q', options.qos);
  }
  command.push('-t', `'${options.topic}'`, '-m', `'${options.payload}'`);
  if (options.remainingArgs) {
    command.push(options.remainingArgs);
  }
  return command.join(' ');
}

function toMosquittoSubCli(options) {
  const command = ['mosquitto_sub', '-t', `'${options.topic}'`];
  if (options.remainingArgs) {
    command.push(options.remainingArgs);
  }
  return command.join(' ');
}

/*
  Tedge CLI
*/
function convertToTedgeCLI(api) {
  if (api.action == MQTT_SUB) {
    return toTedgeSubCli(api);
  }
  return toTedgePubCli(api);
}

function toTedgePubCli(options) {
  const command = ['tedge', 'mqtt', 'pub'];

  if (options.retain) {
    command.push('-r');
  }
  if (options.qos) {
    command.push('-q', options.qos);
  }
  command.push(`'${options.topic}'`, `'${options.payload}'`);
  if (options.remainingArgs) {
    command.push(options.remainingArgs);
  }
  return command.join(' ');
}

function toTedgeSubCli(options) {
  const command = ['tedge', 'mqtt', 'sub', `'${options.topic}'`];
  if (options.remainingArgs) {
    command.push(options.remainingArgs);
  }
  return command.join(' ');
}

function prettify(payload) {
  try {
    const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return JSON.stringify(obj, null, '  ');
  } catch (e) {
    // don't error on non-json body, just return it as is
    return payload;
  }
}

function convertLegacyToNewAPI(topic, payload) {
  const segments = topic.split('/');

  let outTopic = topic;
  let outPayload = {};
  if (payload && typeof payload === 'string') {
    try {
      outPayload = JSON.parse(payload);
    } catch (e) {
      // ignore error
      console.log(`Could not parse json. value=${payload}, error=${e}`);
    }
  }

  if (segments[1] == 'measurements') {
    if (segments.length == 2) {
      // main device
      outTopic = [
        'te',
        'device',
        'main',
        '',
        '',
        'm',
        'ThinEdgeMeasurement',
      ].join('/');
    } else {
      // child device
      outTopic = [
        'te',
        'device',
        segments[2],
        '',
        '',
        'm',
        'ThinEdgeMeasurement',
      ].join('/');
    }
  } else if (segments[1] == 'events') {
    if (segments.length == 3) {
      // main device
      outTopic = ['te', 'device', 'main', '', '', 'e', segments[2]].join('/');
    } else {
      // child device
      outTopic = ['te', 'device', segments[3], '', '', 'e', segments[2]].join(
        '/',
      );
    }
  } else if (segments[1] == 'alarms') {
    if (segments.length == 4) {
      // main device
      outTopic = ['te', 'device', 'main', '', '', 'a', segments[3]].join('/');
      outPayload['severity'] = segments[2];
    } else {
      // child device
      outTopic = ['te', 'device', segments[4], '', '', 'a', segments[3]].join(
        '/',
      );
      outPayload['severity'] = segments[2];
    }
  } else if (segments[1] == 'health') {
    if (segments.length == 3) {
      // main device
      outTopic = [
        'te',
        'device',
        'main',
        'service',
        segments[2],
        'status',
        'health',
      ].join('/');
    } else {
      // child device
      outTopic = [
        'te',
        'device',
        segments[2],
        'service',
        segments[3],
        'status',
        'health',
      ].join('/');
    }
  }

  return {
    topic: outTopic,
    payload: prettify(outPayload),
  };
}

/*
  Convert the tedge v1 to the legacy topics/payload
*/
function convertNewToLegacyApi(topic, payload) {
  const segments = topic.split('/');
  const identifier = segments.slice(1, 5);
  const deviceName = identifier[1];
  const serviceName = identifier[3];
  const dataType = segments[5];
  const dataSubType = segments[6];

  let outTopic = topic;
  let outPayload = {};
  if (payload && typeof payload === 'string') {
    try {
      outPayload = JSON.parse(payload);
    } catch (e) {
      // ignore error
      console.log(`Could not parse json. value=${payload}, error=${e}`);
    }
  }

  // Don't perform the translation if the topic does not match the pattern
  const isValidTopic = identifier[0] == 'device';
  if (!isValidTopic) {
    return {
      topic: outTopic,
      payload: prettify(outPayload),
      error: true,
      message: 'Topic name does not conform to te/device/+/+/+/#',
    };
  }

  const isMainDevice = deviceName === 'main';

  if (dataType == 'm') {
    if (isMainDevice) {
      // main device
      outTopic = ['tedge', 'measurements'].join('/');
    } else {
      // child device
      outTopic = ['tedge', 'measurements', deviceName].join('/');
    }
  } else if (dataType == 'e') {
    if (isMainDevice) {
      // main device
      outTopic = ['tedge', 'events', dataSubType].join('/');
    } else {
      // child device
      outTopic = ['tedge', 'events', dataSubType, deviceName].join('/');
    }
  } else if (dataType == 'a') {
    const severity = outPayload['severity'] || 'major';
    if (outPayload['severity']) {
      delete outPayload['severity'];
    }
    if (isMainDevice) {
      // main device
      outTopic = ['tedge', 'alarms', severity, dataSubType].join('/');
    } else {
      // child device
      outTopic = ['tedge', 'alarms', severity, dataSubType, deviceName].join(
        '/',
      );
    }
  } else if (dataType == 'status' && dataSubType == 'health' && serviceName) {
    if (isMainDevice) {
      // main device
      outTopic = ['tedge', 'health', serviceName].join('/');
    } else {
      // child device
      outTopic = ['tedge', 'health', deviceName, serviceName].join('/');
    }
  }

  return {
    topic: outTopic,
    payload: prettify(outPayload),
  };
}

function convertTedgeMessageFormat(topic, payload, format = 'legacy') {
  if (format == 'v1' && topic.startsWith('tedge/')) {
    return convertLegacyToNewAPI(topic, payload);
  }

  if (format == 'legacy' && topic.startsWith('te/')) {
    return convertNewToLegacyApi(topic, payload);
  }

  // Either already in te/ format, or it is using a non thin-edge format, so it
  // should be left untouched
  return {
    topic,
    payload: prettify(payload),
  };
}

export default {
  convertToMosquitto,
  convertToTedgeCLI,
  parseTedgeCommand,
  convertTedgeMessageFormat,
  prettify,
};

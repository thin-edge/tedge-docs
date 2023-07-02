/*
  Helper functions to parse meta data associated to a node
*/

const parse = require('shell-quote/parse');

const MQTT_PUB = 'pub';
const MQTT_SUB = 'sub';

function parseTedgeCommand(code) {
  const api = {
    action: MQTT_PUB,
    topic: '',
    payload: '',
    retain: '',
    qos: '',
    // Preserve any additional arguments
    remainingArgs: '',
  };

  args = parse(code);
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
    i++
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
  return api;
}

/*
Convert a tedge mqtt sub|pub command to the equivalent mosquitto command
*/
function convertToMosquitto(code) {
  const api = parseTedgeCommand(code);
  if (api.action == MQTT_SUB) {
      return toMosquittoSubCli(api);
  }
  return toMosquittoPubCli(api);
}

function toMosquittoPubCli(options) {
  const command = [
      'mosquitto_pub',
  ];

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
  const command = [
      'mosquitto_sub',
      '-t', `'${options.topic}'`,
  ];
  if (options.remainingArgs) {
    command.push(options.remainingArgs);
  }
  return command.join(' ');
}

function prettify(payload) {
  try {
    const jsonText = JSON.parse(payload);
    return JSON.stringify(jsonText, null, '  ');
  } catch (e) {
    // don't error on non-json body, just return it as is
    return payload;
  }
}

module.exports = {
  convertToMosquitto,
  parseTedgeCommand,
  prettify,
};

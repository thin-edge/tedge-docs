import tedge from '.';
import {test, expect, describe} from '@jest/globals';

const apiMapping = {
    /* Measurements */
    'measurements main device': {
        v1: {
            topic: 'te/device/main///m/ThinEdgeMeasurement',
            payload: {some:{nested:10.3}},
        },
        legacy: {
            topic: 'tedge/measurements',
            payload: {some:{nested:10.3}},
        }
    },
    'measurements child device': {
        v1: {
            topic: 'te/device/child01///m/ThinEdgeMeasurement',
            payload: {some:{nested:10.3}},
        },
        legacy: {
            topic: 'tedge/measurements/child01',
            payload: {some:{nested:10.3}},
        }
    },

    /* Events */
    'events main device': {
        v1: {
            topic: 'te/device/main///e/login',
            payload: {text: 'User logged in'},
        },
        legacy: {
            topic: 'tedge/events/login',
            payload: {text: 'User logged in'},
        }
    },
    'events child device': {
        v1: {
            topic: 'te/device/child01///e/login',
            payload: {text: 'User logged in'},
        },
        legacy: {
            topic: 'tedge/events/login/child01',
            payload: {text: 'User logged in'},
        }
    },

    /* Alarms */
    'alarms main device': {
        v1: {
            topic: 'te/device/main///a/hi_temp',
            payload: {text: 'High Temperature', severity: 'major'},
        },
        legacy: {
            topic: 'tedge/alarms/major/hi_temp',
            payload: {text: 'High Temperature'},
        }
    },
    'alarms child device': {
        v1: {
            topic: 'te/device/child01///a/hi_temp',
            payload: {text: 'High Temperature', severity: 'major'},
        },
        legacy: {
            topic: 'tedge/alarms/major/hi_temp/child01',
            payload: {text: 'High Temperature'},
        }
    },

    /* Health */
    'health main device': {
        v1: {
            topic: 'te/device/main/service/nodered/status/health',
            payload: {status: 'up'},
        },
        legacy: {
            topic: 'tedge/health/nodered',
            payload: {status: 'up'},
        }
    },
    'health child device': {
        v1: {
            topic: 'te/device/child01/service/nodered/status/health',
            payload: {status: 'up'},
        },
        legacy: {
            topic: 'tedge/health/child01/nodered',
            payload: {status: 'up'},
        }
    },
};

describe('convert api from v1 to legacy', () => {
    test.each(Object.keys(apiMapping))(
        '%s',
        (key) => {
            const testcase = apiMapping[key];
            const {topic, payload} = tedge.convertTedgeMessageFormat(testcase.v1.topic, JSON.stringify(testcase.v1.payload), 'legacy');
            expect(topic).toBe(testcase.legacy.topic);
            expect(JSON.parse(payload)).toMatchObject(testcase.legacy.payload);
        },
    )
});

describe('convert api from legacy to v1', () => {
    test.each(Object.keys(apiMapping))(
        '%s',
        (key) => {
            const testcase = apiMapping[key];
            const {topic, payload} = tedge.convertTedgeMessageFormat(testcase.legacy.topic, JSON.stringify(testcase.legacy.payload), 'v1');
            expect(topic).toBe(testcase.v1.topic);
            expect(JSON.parse(payload)).toMatchObject(testcase.v1.payload);
        },
    )
});

const cliCommands = {
    'publish': {
        tedge: `tedge mqtt pub tedge/events '{"text":"hello"}'`,
        api: {
            action: 'pub',
            topic: 'tedge/events',
            payload: {
                text: 'hello',
            },
            retain: false,
            qos: 0,
            remainingArgs: '',
        },
    },
    'command with pipe': {
        tedge: `tedge mqtt pub tedge/events '{
            "text": "hello"
        }' | grep hello`,
        api: {
            action: 'pub',
            topic: 'tedge/events',
            payload: {
                text: 'hello',
            },
            retain: false,
            qos: 0,
            remainingArgs: '| grep hello',
        },
    },
    'subscribe': {
        tedge: `tedge mqtt sub 'tedge/health/+'`,
        api: {
            action: 'sub',
            topic: 'tedge/health/+',
            payload: '',
            retain: false,
            qos: 0,
            remainingArgs: '',
        },
    },
};

describe('Parse tedge cli commands to generic API object', () => {
    test.each(Object.keys(cliCommands))(
        '%s',
        (key) => {
            const testcase = cliCommands[key];
            const api = tedge.parseTedgeCommand(testcase.tedge, format='legacy');
            if (api.payload) {
                // convert json to an object for easier comparison
                api.payload = JSON.parse(api.payload);
            }
            expect(api).toMatchObject(testcase.api);
        },
    )
});

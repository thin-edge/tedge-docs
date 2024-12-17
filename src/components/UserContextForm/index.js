import React, { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import BrowserOnly from '@docusaurus/BrowserOnly';

function generateName(prefix='', len=10) {
  const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return prefix + genRanHex(len);
}

function UserContextForm(props={}) {
  const {settings = ''} = props;
  const showKeys = `${settings}`.split(',');

  // Common
  const [deviceId, setDeviceId] = useLocalStorage('DEVICE_ID', props.deviceId || generateName('tedge_'));
  useEffect(() => setDeviceId(deviceId), [deviceId]);

  // Cumulocity IoT
  const [c8yUrl, setC8yUrl] = useLocalStorage('C8Y_URL', props.c8yUrl || 'example.eu-latest.com');
  useEffect(() => updateUrl(c8yUrl), [c8yUrl]);
  const updateUrl = (url) => {
    setC8yUrl(`${url}`.replace(/^https?:\/\//i, ''))
  };

  const [c8yUser, setC8yUser] = useLocalStorage('C8Y_USER', props.c8yUser || 'jimmy@thin-edge.com');
  useEffect(() => setC8yUser(c8yUser), [c8yUser]);

  const [c8yProfileName, setC8yProfileName] = useLocalStorage('C8Y_PROFILE_NAME', props.c8yProfileName || 'second');
  useEffect(() => setC8yProfileName(c8yProfileName), [c8yProfileName]);

  const [c8yProfileUrl, setC8yProfileUrl] = useLocalStorage('C8Y_PROFILE_URL', props.c8yProfileUrl || 'other.cumulocity.com');
  useEffect(() => setC8yProfileUrl(c8yProfileUrl), [c8yProfileUrl]);

  // AWS
  const [awsUrl, setAwsUrl] = useLocalStorage('AWS_URL', props.awsUrl || 'b1a1agbpo20syc.iot.us-east-1.amazonaws.com');
  useEffect(() => setAwsUrl(awsUrl), [awsUrl]);

  const [awsRegion, setAwsRegion] = useLocalStorage('AWS_REGION', props.awsRegion || 'us-east-1');
  useEffect(() => setAwsRegion(awsRegion), [awsRegion]);

  const [awsAccountId, setAwsAccountId] = useLocalStorage('AWS_ACCOUNT_ID', props.awsAccountId || '123456789012');
  useEffect(() => setAwsAccountId(awsAccountId), [awsAccountId]);

  // Azure
  const [azureUrl, setAzureUrl] = useLocalStorage('AZURE_URL', props.azUrl || 'your-iot-hub-name.azure-devices.net');
  useEffect(() => setAzureUrl(azureUrl), [azureUrl]);

  const showStyle = (key) => {
    if (!showKeys.includes(key)) {
      return {
        'display': 'none',
      };
    }
  };

  // Control if context is expanded or not
  const [showContext, setShowContext] = useLocalStorage('SHOW_CONTEXT', true);
  useEffect(() => setShowContext(showContext), [showContext]);

  return (
    <div className='user-context'>
    <button onClick={e => setShowContext(!showContext)} style={{'width': '100%'}}>Show/hide user context</button>
    <div className="card" style={{'display': showContext ? 'inherit': 'none'}}>
        <div className="card__body">
          <div className='container'>
            <div className="row margin--xs" style={showStyle('DEVICE_ID')}>
              <div className="col col--4">
                <label htmlFor="device-id">Device ID</label>
              </div>
              <div className="col col--6">
                <input id="device-id" inputMode="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('C8Y_URL')}>
              <div className="col col--4">
                <label htmlFor="c8y-url">Cumulocity IoT URL</label>
              </div>
              <div className="col col--6">
                <input id="c8y-url" inputMode="text" value={c8yUrl} onChange={(e) => updateUrl(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('C8Y_USER')}>
              <div className="col col--4">
                <label htmlFor="c8y-user">Cumulocity IoT User</label>
              </div>
              <div className="col col--6">
              <input id="c8y-user" inputMode="text" value={c8yUser} onChange={(e) => setC8yUser(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('C8Y_PROFILE_NAME')}>
              <div className="col col--4">
                <label htmlFor="c8y-profile">Profile name</label>
              </div>
              <div className="col col--6">
              <input id="c8y-profile" inputMode="text" value={c8yProfileName} onChange={(e) => setC8yProfileName(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('C8Y_PROFILE_URL')}>
              <div className="col col--4">
                <label htmlFor="c8y-profile-url">Second Cumulocity IoT URL</label>
              </div>
              <div className="col col--6">
              <input id="c8y-profile-url" inputMode="text" value={c8yProfileUrl} onChange={(e) => setC8yProfileUrl(e.target.value)}></input>
              </div>
            </div>


            <div className="row margin--xs" style={showStyle('AWS_URL')}>
              <div className="col col--4">
                <label htmlFor="aws-url">AWS URL</label>
              </div>
              <div className="col col--6">
              <input id="aws-url" inputMode="text" value={awsUrl} onChange={(e) => setAwsUrl(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('AWS_REGION')}>
              <div className="col col--4">
                <label htmlFor="aws-region">AWS Region</label>
              </div>
              <div className="col col--6">
              <input id="aws-region" inputMode="text" value={awsRegion} onChange={(e) => setAwsRegion(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('AWS_ACCOUNT_ID')}>
              <div className="col col--4">
                <label htmlFor="aws-account-id">AWS Account ID</label>
              </div>
              <div className="col col--6">
              <input id="aws-account-id" inputMode="text" value={awsAccountId} onChange={(e) => setAwsAccountId(e.target.value)}></input>
              </div>
            </div>

            <div className="row margin--xs" style={showStyle('AZURE_URL')}>
              <div className="col col--4">
                <label htmlFor="aws-account-id">Azure URL</label>
              </div>
              <div className="col col--6">
              <input id="aws-account-id" inputMode="text" value={azureUrl} onChange={(e) => setAzureUrl(e.target.value)}></input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap component in the BrowserOnly to prevent re-hydration issues
// where the initial values from the local storage aren't accessible yet
// which results in the values being ignored when the local storage becomes
// available
export default function UserContextFormBrowserOnly(props) {
  return (
    <BrowserOnly fallback={<div>Loading user context...</div>}>
      {() => {
        return <UserContextForm {...props} />;
      }}
    </BrowserOnly>
  );
};

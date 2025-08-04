import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import { useReadLocalStorage } from 'usehooks-ts';

export default function UserContext(props = {}) {
  const { children = {}, language = "sh", title = "" } = props;
  // Common
  const deviceId = useReadLocalStorage('DEVICE_ID', props.deviceId || 'tedge001');

  // Cumulocity IoT
  const c8yUrl = useReadLocalStorage('C8Y_URL', props.c8yUrl || 'example.eu-latest.com');
  const c8yTenantId = useReadLocalStorage('C8Y_TENANT_ID', props.c8yTenantId || 't12345678');
  const c8yUser = useReadLocalStorage('C8Y_USER', props.c8yUser || 'jimmy@thin-edge.com');
  const c8yPassword = useReadLocalStorage('C8Y_PASSWORD', props.c8yPassword || 'YourTenantPassword');
  const c8yProfileName = useReadLocalStorage('C8Y_PROFILE_NAME', props.c8yProfileName || 'second');
  const c8yProfileUrl = useReadLocalStorage('C8Y_PROFILE_URL', props.c8yProfileUrl || 'other.cumulocity.com');

  // AWS
  const awsUrl = useReadLocalStorage('AWS_URL', props.awsUrl || 'b1a1agbpo20syc.iot.us-east-1.amazonaws.com');
  const awsRegion = useReadLocalStorage('AWS_REGION', props.awsRegion || 'us-east-1');
  const awsAccountId = useReadLocalStorage('AWS_ACCOUNT_ID', props.awsAccountId || '123456789012');

  // Azure
  const azureUrl = useReadLocalStorage('AZURE_URL', props.azureUrl || 'your-iot-hub-name.azure-devices.net');

  const code = `${children.props.children.props.children || children.props.children}`
    .replace(/\$DEVICE_ID/g, deviceId)
    .replace(/\$C8Y_URL/g, c8yUrl)
    .replace(/\$C8Y_TENANT_ID/g, c8yTenantId)
    .replace(/\$C8Y_USER/g, c8yUser)
    .replace(/\$C8Y_PASSWORD/g, c8yPassword)
    .replace(/\$C8Y_PROFILE_URL/g, c8yProfileUrl)
    .replace(/\$C8Y_PROFILE_NAME/g, c8yProfileName)
    .replace(/\$AWS_URL/g, awsUrl)
    .replace(/\$AWS_REGION/g, awsRegion)
    .replace(/\$AWS_ACCOUNT_ID/g, awsAccountId)
    .replace(/\$AZURE_URL/g, azureUrl)
    ;
  return (
    <div>
      <CodeBlock language={language} title={title}>
        {code}
      </CodeBlock>
    </div>
  );
}

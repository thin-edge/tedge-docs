import React from 'react';
import Admonition from '@theme/Admonition';

export default function ProposalBanner() {
  const title = "Proposal";
  return (
    <div>
      <Admonition type="info" title={title}>
        <p>This section details a proposal which is not yet implemented. The proposal is made public under the 'next' version to encourage feedback for upcoming features.</p>
        <p>If you want to provide feedback, please reach out to us on <a href="https://github.com/thin-edge/thin-edge.io">GitHub</a> or <a href="https://discord.gg/SvqWp6nrsK">Discord</a>.</p>
      </Admonition>
    </div>
  );
}

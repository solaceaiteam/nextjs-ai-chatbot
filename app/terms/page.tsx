import * as React from 'react';

export default function TermsPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-zinc-50">
        Terms of Service
      </h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Terms</h2>
        <p>
          By accessing Solace AI, you agree to be bound by these terms of
          service and agree that you are responsible for compliance with any
          applicable local laws.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use Solace AI for personal,
          non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Solace AI are provided on an &apos;as is&apos; basis.
          Solace AI makes no warranties, expressed or implied, and hereby
          disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall Solace AI or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use Solace AI.
        </p>

        <h2>5. Revisions and Errata</h2>
        <p>
          The materials appearing on Solace AI could include technical,
          typographical, or photographic errors. Solace AI does not warrant that
          any of the materials on its website are accurate, complete or current.
        </p>

        <h2>6. Links</h2>
        <p>
          Solace AI has not reviewed all of the sites linked to its website and
          is not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement by Solace AI of the
          site.
        </p>

        <h2>7. Site Terms of Use Modifications</h2>
        <p>
          Solace AI may revise these terms of use for its website at any time
          without notice. By using this website you are agreeing to be bound by
          the then current version of these Terms and Conditions of Use.
        </p>
      </div>
    </div>
  );
}

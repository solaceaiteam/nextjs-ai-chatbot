import * as React from 'react';

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when you create an
          account, including your email address and any optional profile
          information.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, communicate with you, and protect our services and
          users.
        </p>

        <h2>3. Information Sharing</h2>
        <p>
          We do not share your personal information with third parties except as
          described in this privacy policy or with your consent.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We take reasonable measures to help protect your personal information
          from loss, theft, misuse, unauthorized access, disclosure, alteration,
          and destruction.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal
          information. You can do this through your account settings or by
          contacting us.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new privacy policy on this page.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact
          us.
        </p>
      </div>
    </div>
  );
}

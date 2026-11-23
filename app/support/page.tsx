import './support.css';

export default function SupportPage() {
  return <main className="support-page">
    <div className="support-card">
      <a className="support-back" href="/">← Back to Campus Connect</a>
      <p className="support-eyebrow">CAMPUS CONNECT · SUPPORT</p>
      <h1>We're here to <em>help.</em></h1>
      <p>Having trouble signing in, found a bug, or need help using Campus Connect? Send us an email and tell us what happened.</p>
      <a className="support-button" href="mailto:pesucampusconnect@gmail.com?subject=Campus%20Connect%20support">Email support</a>
      <p className="support-address">Or write to <a href="mailto:pesucampusconnect@gmail.com">pesucampusconnect@gmail.com</a></p>
      <p className="support-note">Please don't include your PESU password in your message. The email button opens your email app; send the message from there.</p>
    </div>
  </main>;
}

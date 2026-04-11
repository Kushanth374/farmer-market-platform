import { BootstrapResponse, Role } from "./types";

type LandingScreenProps = {
  bootstrap: BootstrapResponse;
  onOpenAuth: (role: Role, screen: "login" | "signup") => void;
};

export default function LandingScreen({ bootstrap, onOpenAuth }: LandingScreenProps) {
  return (
    <div className="landing-page">
      <header className="landing-hero-new">
        <nav className="landing-nav">
          <div className="brand-block">
            <span className="brand-icon">FS</span>
            <div>
              <strong>FarmSetu</strong>
              <small>Farmer Support and Market Access</small>
            </div>
          </div>
        </nav>

        <div className="landing-grid">
          <section className="landing-copy-block">
            <p className="eyebrow">Integrated Farmer Support Ecosystem</p>
            <div className="hero-heading-row">
              <div className="mini-logo-orbit" aria-hidden="true">
                <span className="mini-logo-core">FS</span>
                <span className="mini-ring ring-one"></span>
                <span className="mini-ring ring-two"></span>
                <span className="mini-dot dot-one"></span>
                <span className="mini-dot dot-two"></span>
              </div>
              <span className="hero-side-heading">Smart Rural Finance</span>
            </div>
            <h1>Register the farmer, capture the field details, then match the right loan.</h1>
            <p className="landing-copy-text">
              This project is built around the actual farmer flow: account creation, crop and land
              details, irrigation and income capture, profile save, then immediate loan recommendations
              and related scheme support.
            </p>

            <div className="role-entry-grid">
              <button className="role-entry farmer-entry-card" onClick={() => onOpenAuth("farmer", "login")}>
                <span className="role-icon">F</span>
                <span>
                  <strong>Farmer Access</strong>
                  <small>Login or sign up</small>
                </span>
              </button>
              <button className="role-entry buyer-entry-card" onClick={() => onOpenAuth("buyer", "login")}>
                <span className="role-icon">B</span>
                <span>
                  <strong>Buyer Access</strong>
                  <small>Login or sign up</small>
                </span>
              </button>
            </div>
          </section>

          <aside className="landing-side-card">
            <p className="eyebrow">What Happens For Farmers</p>
            <ol className="steps-list">
              <li>Create the farmer account</li>
              <li>Fill crop, land acres, irrigation, income and identity details</li>
              <li>Save the profile</li>
              <li>See matched loan options and related schemes</li>
            </ol>
            <div className="signal-summary">
              <strong>{bootstrap.topSignal.crop}</strong>
              <span>Top current market signal</span>
              <small>{bootstrap.topSignal.alert}</small>
            </div>
          </aside>
        </div>
      </header>
    </div>
  );
}

import { FormEvent } from "react";
import { FarmerProfile, FarmerResponse } from "./types";

const numberFormat = new Intl.NumberFormat("en-IN");

type FarmerScreenProps = {
  data: FarmerResponse;
  formProfile: FarmerProfile;
  savingProfile: boolean;
  status: string;
  onLogout: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: <K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) => void;
};

export default function FarmerScreen({
  data,
  formProfile,
  savingProfile,
  status,
  onLogout,
  onSave,
  onUpdateField,
}: FarmerScreenProps) {
  return (
    <div className="farmer-page">
      <header className="farmer-header">
        <div>
          <p className="eyebrow">Farmer Workspace</p>
          <h1>Fill your farm details, save them, then see matched loans.</h1>
          <p className="farmer-header-copy">
            This is the core farmer workflow: registration, farm details, saved profile, then matched loan options.
          </p>
        </div>
        <button className="secondary-cta" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="farmer-summary-grid">
        <article className="summary-card">
          <span>Top market price</span>
          <strong>Rs {numberFormat.format(data.topSignal.today)}</strong>
          <small>{data.topSignal.crop} at {data.topSignal.mandi}</small>
        </article>
        <article className="summary-card">
          <span>Loan readiness</span>
          <strong>{data.loanScore}%</strong>
          <small>Score updates after the profile is complete.</small>
        </article>
        <article className="summary-card">
          <span>Matched loans</span>
          <strong>{data.matchedLoans.length}</strong>
          <small>Shown after you save required details.</small>
        </article>
      </section>

      <main className="farmer-main-grid">
        <section className="profile-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Complete farmer details</h2>
            </div>
            <span className={`completion-pill ${data.profileComplete ? "done" : "pending"}`}>
              {data.profileComplete ? "Profile complete" : "Profile incomplete"}
            </span>
          </div>
          <p className="panel-copy">
            Required fields for loan matching: crop, land acres, irrigation, district, state, and annual income.
          </p>

          <form className="profile-form" onSubmit={onSave}>
            <label>
              Farmer name
              <input value={formProfile.name} onChange={(event) => onUpdateField("name", event.target.value)} />
            </label>
            <label>
              District
              <input value={formProfile.district} onChange={(event) => onUpdateField("district", event.target.value)} />
            </label>
            <label>
              State
              <input value={formProfile.state} onChange={(event) => onUpdateField("state", event.target.value)} />
            </label>
            <label>
              Language
              <select value={formProfile.language} onChange={(event) => onUpdateField("language", event.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Kannada</option>
              </select>
            </label>
            <label>
              Crop
              <input value={formProfile.crop} onChange={(event) => onUpdateField("crop", event.target.value)} />
            </label>
            <label>
              Land acres
              <input type="number" step="0.1" value={formProfile.landAcres} onChange={(event) => onUpdateField("landAcres", event.target.value)} />
            </label>
            <label>
              Irrigation
              <select
                value={formProfile.irrigation}
                onChange={(event) => onUpdateField("irrigation", event.target.value as FarmerProfile["irrigation"])}
              >
                <option>Canal</option>
                <option>Rain-fed</option>
                <option>Drip</option>
                <option>Borewell</option>
              </select>
            </label>
            <label>
              Annual income
              <input type="number" value={formProfile.annualIncome} onChange={(event) => onUpdateField("annualIncome", event.target.value)} />
            </label>

            <div className="check-grid">
              <label><input type="checkbox" checked={formProfile.aadhaarLinked} onChange={(event) => onUpdateField("aadhaarLinked", event.target.checked)} /> Aadhaar linked</label>
              <label><input type="checkbox" checked={formProfile.soilHealthCard} onChange={(event) => onUpdateField("soilHealthCard", event.target.checked)} /> Soil health card</label>
              <label><input type="checkbox" checked={formProfile.hasKcc} onChange={(event) => onUpdateField("hasKcc", event.target.checked)} /> Existing KCC</label>
              <label><input type="checkbox" checked={formProfile.organic} onChange={(event) => onUpdateField("organic", event.target.checked)} /> Organic cultivation</label>
            </div>

            <button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save details and check loans"}
            </button>
          </form>
        </section>

        <section className="results-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Matched loan options</h2>
            </div>
          </div>

          {data.profileComplete ? (
            <div className="loan-grid">
              {data.matchedLoans.map((loan) => (
                <article className="loan-card" key={loan.id}>
                  <span className="loan-tag">Loan Match</span>
                  <h3>{loan.name}</h3>
                  <strong>{loan.amount}</strong>
                  <p>{loan.purpose}</p>
                  <small>{loan.reason}</small>
                  <div className="next-step">{loan.nextStep}</div>
                </article>
              ))}
            </div>
          ) : (
            <article className="empty-card">
              <h3>Complete the farmer profile first</h3>
              <p>Loan matches appear only after the farmer fills and saves crop, land acres, irrigation, district, state, and annual income.</p>
            </article>
          )}

          <div className="section-head subhead">
            <div>
              <p className="eyebrow">Related Support</p>
              <h2>Matched schemes</h2>
            </div>
          </div>
          <div className="scheme-grid">
            {data.matchedSchemes.map((scheme) => (
              <article className="scheme-card-new" key={scheme.id}>
                <span className="scheme-tag">{scheme.tag}</span>
                <h3>{scheme.name}</h3>
                <p>{scheme.benefit}</p>
                <small>{scheme.nextStep}</small>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="intelligence-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Market Intelligence</p>
            <h2>Current crop signals</h2>
          </div>
        </div>
        <div className="signal-grid">
          {data.priceSignals.map((signal) => (
            <article className="signal-card" key={signal.crop}>
              <div className="signal-top">
                <strong>{signal.crop}</strong>
                <span>{signal.demandIndex}/100</span>
              </div>
              <h3>Rs {numberFormat.format(signal.today)}</h3>
              <p>{signal.mandi}</p>
              <small>{signal.alert}</small>
            </article>
          ))}
        </div>
      </section>

      {status ? <p className="status-line farmer-status">{status}</p> : null}
    </div>
  );
}

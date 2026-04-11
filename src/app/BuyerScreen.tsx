import { Listing, PriceSignal } from "./types";

const numberFormat = new Intl.NumberFormat("en-IN");

type BuyerScreenProps = {
  topSignal: PriceSignal;
  listings: Listing[];
  onLogout: () => void;
};

export default function BuyerScreen({ topSignal, listings, onLogout }: BuyerScreenProps) {
  return (
    <div className="buyer-page">
      <header className="buyer-header">
        <div>
          <p className="eyebrow">Buyer Workspace</p>
          <h1>Direct sourcing with live crop visibility.</h1>
        </div>
        <button className="secondary-cta" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="buyer-grid">
        <article className="buyer-panel">
          <h2>Top signal</h2>
          <strong>{topSignal.crop}</strong>
          <p>{topSignal.alert}</p>
        </article>
        <article className="buyer-panel">
          <h2>Live listings</h2>
          <strong>{listings.length}</strong>
          <p>Direct produce listings open for buyer outreach.</p>
        </article>
      </section>

      <section className="buyer-listings">
        {listings.map((listing) => (
          <article className="buyer-card" key={listing.id}>
            <div className="buyer-card-top">
              <h3>{listing.crop}</h3>
              <span className={`badge ${listing.demand.toLowerCase()}`}>{listing.demand}</span>
            </div>
            <p>{listing.quantity}</p>
            <strong>Rs {numberFormat.format(listing.price)}/quintal</strong>
            <small>{listing.location}</small>
          </article>
        ))}
      </section>
    </div>
  );
}

export interface MandiPrice {
  commodity: string;
  price: number;
  trend: 'up' | 'down';
  variance: string;
}

export interface Mandi {
  id: number;
  name: string;
  city: string;
  state: string;
  prices: MandiPrice[];
}

export interface PriceAlert {
  id: string;
  mandi: string;
  commodity: string;
  movement: 'spike' | 'drop';
  variance: number;
  price: number;
  severity: 'high' | 'medium';
}

export const derivePriceAlerts = (mandis: Mandi[]) =>
  mandis
    .flatMap((mandi) =>
      mandi.prices.map((pricePoint) => {
        const variance = Number.parseFloat(pricePoint.variance) || 0;
        const movement: 'spike' | 'drop' = pricePoint.trend === 'up' ? 'spike' : 'drop';
        const severity: 'high' | 'medium' = variance >= 1.5 ? 'high' : 'medium';

        return {
          id: `${mandi.id}-${pricePoint.commodity}-${movement}`,
          mandi: mandi.name,
          commodity: pricePoint.commodity,
          movement,
          variance,
          price: pricePoint.price,
          severity,
        };
      }),
    )
    .filter((item) => item.variance >= 0.8)
    .sort((a, b) => b.variance - a.variance)
    .slice(0, 6);

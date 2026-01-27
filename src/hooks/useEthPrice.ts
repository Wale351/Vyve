import { useQuery } from '@tanstack/react-query';

interface PriceData {
  usd: number;
  eur: number;
  gbp: number;
  jpy: number;
  cny: number;
  krw: number;
}

export function useEthPrice() {
  return useQuery({
    queryKey: ['eth-price'],
    queryFn: async (): Promise<PriceData> => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur,gbp,jpy,cny,krw'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ETH price');
      }
      const data = await response.json();
      return data.ethereum;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function formatFiatValue(ethAmount: number, price: number, currency: string): string {
  const value = ethAmount * price;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

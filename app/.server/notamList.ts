export async function getNotamsFromEAA(): Promise<TransformedNotam[]> {
  const apiUrl = 'https://external-api.faa.gov/notamapi/v1/notams';
  const params = new URLSearchParams({
    icaoLocation: 'KOSH',
    responseFormat: 'geoJson',
    pageSize: '50',
    pageNum: '1'
  });

  const headers: Record<string, string> = {
    'client_id': 'cd4f72a622e243eea887ec4ab641b325',
    'client_secret': '7ffCE9446842440aA96e21b35fB1635F',
  };

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`, { headers, signal: AbortSignal.timeout(20000) });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return transformNotamList(data);
  } catch (error) {
      console.error('Error fetching NOTAMs:', error);
      return [];
  }
}

export interface TransformedNotam {
  id: string;
  number: string;
  type: string;
  issued: string;
  location: string;
  effectiveStart: string;
  effectiveEnd: string;
  text: string;
  classification: string;
  accountId: string;
  lastUpdated: string;
  icaoLocation: string;
  coordinates: string;
  radius: string;
}

interface RawNotamList {
  items: {
    properties: {
      coreNOTAMData: {
        notam: {
          id: string;
          number: string;
          type: string;
          issued: string;
          location: string;
          effectiveStart: string;
          effectiveEnd: string;
          text: string;
          classification: string;
          accountId: string;
          lastUpdated: string;
          icaoLocation: string;
          coordinates: string;
          radius: string;
        };
      };
    };
  }[];
}

export const transformNotamList = (rawNotamList: RawNotamList): TransformedNotam[] => {
  return rawNotamList.items
    .map(({ properties }) => ({
      id: properties.coreNOTAMData.notam.id,
      number: properties.coreNOTAMData.notam.number,
      type: properties.coreNOTAMData.notam.type,
      issued: properties.coreNOTAMData.notam.issued,
      location: properties.coreNOTAMData.notam.location,
      effectiveStart: new Date(properties.coreNOTAMData.notam.effectiveStart).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      effectiveEnd: new Date(properties.coreNOTAMData.notam.effectiveEnd).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      text: properties.coreNOTAMData.notam.text,
      classification: properties.coreNOTAMData.notam.classification,
      accountId: properties.coreNOTAMData.notam.accountId,
      lastUpdated: properties.coreNOTAMData.notam.lastUpdated,
      icaoLocation: properties.coreNOTAMData.notam.icaoLocation,
      coordinates: properties.coreNOTAMData.notam.coordinates,
      radius: properties.coreNOTAMData.notam.radius
    }))
    .filter((newNotam: TransformedNotam) => {
      const now = new Date();
      const effectiveStart = new Date(newNotam.effectiveStart);
      const effectiveEnd = new Date(newNotam.effectiveEnd);
      return effectiveStart <= now && effectiveEnd >= now;
    });
}

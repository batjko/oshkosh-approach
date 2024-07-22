// import { URLSearchParams } from 'url';

export const getNOTAMs = async () => {
  const url = 'https://external-api.faa.gov/notamapi/v1/notams';
  const params = {
    responseFormat: 'geoJson',
    icaoLocation: 'KOSH',
    // Add other query parameters as needed
  };

  const headers = {
    'client_id': 'cd4f72a622e243eea887ec4ab641b325',
    'client_secret': '7ffCE9446842440aA96e21b35fB1635F',
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching NOTAMs:', error);
  }
};
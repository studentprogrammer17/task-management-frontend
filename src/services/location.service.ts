import axios from 'axios';

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flag: string;
}

interface City {
  name: string;
  countryCode: string;
}

interface CitiesResponse {
  data: string[];
  error: boolean;
  msg: string;
}

const REST_COUNTRIES_API = `${process.env.REACT_APP_REST_COUNTRIES_API}`;
const CITIES_API = `${process.env.REACT_APP_REST_CITIES_API}`;

export const locationService = {
  async getCountries(): Promise<Country[]> {
    try {
      const response = await axios.get(`${REST_COUNTRIES_API}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  async getCities(countryCode: string): Promise<City[]> {
    try {
      const countryResponse = await axios.get(
        `${REST_COUNTRIES_API}/alpha/${countryCode}`
      );
      const countryName = countryResponse.data[0].name.common;

      const response = await axios.post<CitiesResponse>(CITIES_API, {
        country: countryName,
      });

      if (response.data.error) {
        console.error('Error from cities API:', response.data.msg);
        return [];
      }

      const cities = response.data.data.map(cityName => ({
        name: cityName,
        countryCode: countryCode,
      }));

      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', error.response?.data);
      }
      return [];
    }
  },
};

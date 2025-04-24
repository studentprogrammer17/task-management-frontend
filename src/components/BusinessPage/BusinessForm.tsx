import React, { useState, useEffect } from 'react';
import { Business, CreateBusinessDto } from '../../models/Business';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '../../services/location.service';
import './BusinessForm.css';

interface BusinessFormProps {
  isAdmin: boolean;
  business?: Business;
  onSubmit: (data: CreateBusinessDto & { image?: File }) => void;
  onClose: () => void;
}

interface City {
  name: string;
  countryCode: string;
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  isAdmin,
  business,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateBusinessDto>({
    name: '',
    employeeCount: 0,
    phoneNumber: '',
    email: '',
    country: '',
    city: '',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<{
    value: string;
    label: string;
    flag: string;
  } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: locationService.getCountries,
  });

  const countryOptions = countries.map(country => ({
    value: country.cca2,
    label: country.name.common,
    flag: country.flag,
  }));

  const { data: cities = [], isLoading: isLoadingCities } = useQuery<City[]>({
    queryKey: ['cities', selectedCountry?.value],
    queryFn: () =>
      selectedCountry
        ? locationService.getCities(selectedCountry.value)
        : Promise.resolve([]),
    enabled: !!selectedCountry,
  });

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const cityOptions = filteredCities.map(city => ({
    value: city.name,
    label: city.name,
  }));

  useEffect(() => {
    if (business) {
      setSelectedCountry({
        value: business.country,
        label: business.country,
        flag: '',
      });
      setSelectedCity({
        value: business.city,
        label: business.city,
      });
      setFormData({
        name: business.name,
        employeeCount: business.employeeCount,
        phoneNumber: business.phoneNumber,
        email: business.email,
        country: business.country,
        city: business.city,
        description: business.description,
      });
      if (business.image) {
        setPreviewUrl(
          `${process.env.REACT_APP_API_URL}/uploads/businesses/${business.image}`
        );
      }
    }
  }, [business]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      image: selectedImage || undefined,
    };
    //@ts-ignore
    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employeeCount' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCountryChange = (
    option: { value: string; label: string; flag: string } | null
  ) => {
    if (option && option.value !== selectedCountry?.value) {
      setSelectedCountry(option);
      setSelectedCity(null);
      setCitySearchTerm('');
      setFormData(prev => ({
        ...prev,
        country: option.label || '',
        city: '',
      }));
    }
  };

  const handleCityChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedCity(option);
    setFormData(prev => ({
      ...prev,
      city: option?.label || '',
    }));
  };

  const handleCityInputChange = (inputValue: string) => {
    setCitySearchTerm(inputValue);
  };

  const customCountryOption = ({ data, ...props }: any) => (
    <div className="country-option" {...props.innerProps}>
      <img
        src={`https://flagcdn.com/24x18/${data.value.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/48x36/${data.value.toLowerCase()}.png 2x`}
        width="24"
        height="18"
        alt={`${data.label} flag`}
        className="country-flag"
      />
      <span>{data.label}</span>
    </div>
  );

  return (
    <div className="business-form-overlay">
      <div className="business-form">
        <span className="close-btn-form" onClick={onClose}>
          &times;
        </span>
        <h2>{business ? 'Edit Business' : 'Create New Business'}</h2>
        {!business && !isAdmin && (
          <div className="info-banner">
            When you create a business, it will be in pending status and an admin should
            approve it.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image">Business Image</label>
            <div className="image-upload-container">
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Business preview" />
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
              <label htmlFor="image" className="image-upload-label">
                {previewUrl ? 'Change Image' : 'Upload Image'}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Business Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="employeeCount">Number of Employees</label>
            <input
              type="number"
              id="employeeCount"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <PhoneInput
              country="us"
              value={formData.phoneNumber}
              onChange={value =>
                setFormData(prev => ({ ...prev, phoneNumber: value }))
              }
              inputProps={{
                name: 'phoneNumber',
                required: true,
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <Select
              id="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              options={countryOptions}
              isSearchable
              placeholder="Select a country"
              isLoading={isLoadingCountries}
              components={{ Option: customCountryOption }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <Select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              onInputChange={handleCityInputChange}
              options={cityOptions}
              isSearchable
              placeholder={
                isLoadingCities ? 'Loading cities...' : 'Search for a city'
              }
              isDisabled={!selectedCountry || isLoadingCities}
              isLoading={isLoadingCities}
              required
              noOptionsMessage={() => {
                if (isLoadingCities) return 'Loading cities...';
                if (!selectedCountry) return 'Please select a country first';
                if (cities.length === 0)
                  return 'No cities available for this country';
                if (filteredCities.length === 0)
                  return 'No cities match your search';
                return 'No cities found';
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {business ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessForm;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Business } from '../../models/Business';
import { BusinessService } from '../../services/business.service';
import './UniqueBusiness.css';

interface UniqueBusinessProps {
  showMyBusinesses: boolean;
  isAdmin: boolean;
  onEdit: (business: Business) => void;
  onDelete: (id: string, name: string) => void;
  refetchKey?: number;
}

const UniqueBusiness: React.FC<UniqueBusinessProps> = ({
  showMyBusinesses,
  isAdmin,
  onEdit,
  onDelete,
  refetchKey,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        if (id) {
          const response = await BusinessService.getBusinessById(id);
          if (response.success) {
            setBusiness(response.data);
          } else {
            setError('Business does not exist');
          }
        }
      } catch (err) {
        setError('Business does not exist');
        console.error('Error fetching business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, refetchKey]);

  const handleEdit = () => {
    if (business) {
      onEdit(business);
    }
  };

  const handleDelete = () => {
    if (business) {
      onDelete(business.id, business.name);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!business) return <div className="error">Business not found</div>;

  return (
    <div className="unique-business">
      <div className="business-header-unique">
        <button
          className="btn btn-secondary back-button"
          onClick={() => navigate('/business')}
        >
          ← Back to Businesses
        </button>
        <h1>{business.name}</h1>
        {(showMyBusinesses || isAdmin) && (
          <div className="business-actions-unique">
            <button className="btn btn-warning" onClick={handleEdit}>
              ✎ Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              × Delete
            </button>
          </div>
        )}
      </div>

      <div className={`business-content ${!business.image ? 'no-image' : ''}`}>
        {business.image && (
          <div className="business-image-container">
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/businesses/${business.image}`}
              alt={business.name}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-business.jpg';
              }}
            />
          </div>
        )}

        <div className="business-details">
          <div className="detail-section">
            <h2>Owner Information</h2>
            <p>
              <strong>Owner Name:</strong> {business.ownerFullName}
            </p>
            <p>
              <strong>Email:</strong> {business.email}
            </p>
            <p>
              <strong>Phone:</strong> {business.phoneNumber}
            </p>
          </div>

          <div className="detail-section">
            <h2>Business Information</h2>
            <p>
              <strong>Location:</strong> {business.city}, {business.country}
            </p>
            <p>
              <strong>Number of Employees:</strong> {business.employeeCount}
            </p>
          </div>

          {business.description && (
            <div className="detail-section">
              <h2>Description</h2>
              <p>{business.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniqueBusiness;

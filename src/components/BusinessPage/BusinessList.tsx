import React from 'react';
import { Business } from '../../models/Business';
import { useNavigate } from 'react-router-dom';
import { BusinessService } from '../../services/business.service';
import './BusinessList.css';

interface BusinessListProps {
  businesses: Business[];
  isAdmin: boolean;
  onEdit: (business: Business) => void;
  onDelete: (id: string, name: string) => void;
  onChangeStatus: (id: string, name: string) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  isAdmin,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent, businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  const handleEditClick = (e: React.MouseEvent, business: Business) => {
    e.stopPropagation();
    onEdit(business);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onDelete(id, name);
  };

  const handleStatusChange = (
    e: React.MouseEvent,
    id: string,
    status: string
  ) => {
    e.stopPropagation();
    onChangeStatus(id, status);
  };

  return (
    <div className="business-list">
      {businesses.map(business => (
        <div
          key={business.id}
          className="business-card"
          onClick={e => handleCardClick(e, business.id)}
        >
          {business.image && (
            <div className="business-image">
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
          <div className="business-info">
            <h3>{business.name}</h3>
            <p>
              <strong>Status:</strong> {business.status.toUpperCase()}
            </p>
            <p>
              <strong>Owner:</strong> {business.ownerFullName}
            </p>
            <p>
              <strong>Employees:</strong> {business.employeeCount}
            </p>
            <p>
              <strong>Location:</strong> {business.city}, {business.country}
            </p>
            <p>
              <strong>Contact:</strong> {business.phoneNumber}
            </p>
            <p>
              <strong>Email:</strong> {business.email}
            </p>
            {business.description && (
              <p>
                <strong>Description:</strong> {business.description}
              </p>
            )}
          </div>

          <div className="business-actions">
            <button
              className="btn btn-warning"
              onClick={e => handleEditClick(e, business)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={e => handleDeleteClick(e, business.id, business.name)}
            >
              Delete
            </button>

            {isAdmin && business.status === 'pending' && (
              <div className="status-buttons">
                <button
                  className="btn btn-success"
                  onClick={e => handleStatusChange(e, business.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={e => handleStatusChange(e, business.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            )}

            {isAdmin && business.status === 'rejected' && (
              <div className="status-buttons">
                <button
                  className="btn btn-success"
                  onClick={e => handleStatusChange(e, business.id, 'approved')}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessList;

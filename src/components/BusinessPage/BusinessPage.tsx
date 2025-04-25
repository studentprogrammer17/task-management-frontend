import React, { useState, useEffect } from 'react';
import {
  Business,
  CreateBusinessDto,
  UpdateBusinessDto,
} from '../../models/Business';
import { BusinessService } from '../../services/business.service';
import BusinessList from './BusinessList';
import BusinessForm from './BusinessForm';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import UniqueBusiness from '../UniqueBusiness/UniqueBusiness';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './BusinessPage.css';
import { useLocation } from 'react-router-dom';

interface BusinessPageProps {
  isAdmin: boolean;
}

const BusinessPage: React.FC<BusinessPageProps> = ({ isAdmin }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    businessId: string | null;
    businessName: string;
  }>({
    isOpen: false,
    businessId: null,
    businessName: '',
  });
  const [refetchKey, setRefetchKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchBusinesses = async () => {
    try {
      let response;
      if (isAdmin && location.pathname.includes('pending-businesses')) {
        response = await BusinessService.getBusinessesByStatus('pending');
      } else if (isAdmin && location.pathname.includes('rejected-businesses')) {
        response = await BusinessService.getBusinessesByStatus('rejected');
      } else {
        if (isAdmin) {
          response = await BusinessService.getBusinessesByStatus('approved');
        } else {
          response = await BusinessService.getAllBusinesses();
        }
      }
      setBusinesses(response.data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [location.pathname]);

  useEffect(() => {
    if (isFormOpen || editingBusiness || deleteConfirmation.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFormOpen, editingBusiness, deleteConfirmation.isOpen]);

  // const fetchBusinesses = async () => {
  //   try {
  //     const response = await BusinessService.getAllBusinesses();
  //     setBusinesses(response.data || []);
  //   } catch (error) {
  //     console.error('Error fetching businesses:', error);
  //     setBusinesses([]);
  //   }
  // };

  const handleCreateBusiness = async (
    businessData: CreateBusinessDto & { image?: File }
  ) => {
    try {
      await BusinessService.createBusiness(businessData);
      fetchBusinesses();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating business:', error);
    }
  };

  const handleUpdateBusiness = async (
    id: string,
    businessData: UpdateBusinessDto & { image?: File }
  ) => {
    try {
      await BusinessService.updateBusiness(id, businessData);
      fetchBusinesses();
      setEditingBusiness(null);
      setRefetchKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating business:', error);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      businessId: id,
      businessName: name,
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await BusinessService.changeStatus(id, newStatus);
      fetchBusinesses();
    } catch (error) {
      console.error('Error changing business status:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.businessId) {
      try {
        await BusinessService.deleteBusiness(deleteConfirmation.businessId);
        fetchBusinesses();
        navigate('/business');
      } catch (error) {
        console.error('Error deleting business:', error);
      }
      setDeleteConfirmation({
        isOpen: false,
        businessId: null,
        businessName: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      businessId: null,
      businessName: '',
    });
  };

  const handleSubmit = (data: CreateBusinessDto) => {
    const businessData = {
      ...data,
      description: data.description || '',
      image: typeof data.image === 'string' ? undefined : data.image,
    };
    if (editingBusiness) {
      handleUpdateBusiness(editingBusiness.id, businessData);
    } else {
      handleCreateBusiness(businessData);
    }
  };

  return (
    <div className="business-page">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="business-header">
                <div className="header-content">
                  <h1>
                    {location.pathname.includes('pending-businesses') &&
                      'Pending Businesses'}
                    {location.pathname.includes('rejected-businesses') &&
                      'Rejected Businesses'}
                    {!location.pathname.includes('pending-businesses') &&
                      !location.pathname.includes('rejected-businesses') &&
                      'Business Management'}
                  </h1>

                  <div className="header-buttons">
                    {isAdmin && (
                      <>
                        <button
                          className="btn btn-danger"
                          onClick={() => navigate('/rejected-businesses')}
                          disabled={location.pathname.includes(
                            'rejected-businesses'
                          )}
                        >
                          Rejected Businesses
                        </button>

                        <button
                          className="btn btn-pending"
                          onClick={() => navigate('/pending-businesses')}
                          disabled={location.pathname.includes(
                            'pending-businesses'
                          )}
                        >
                          Pending Businesses
                        </button>

                        <button
                          className="btn btn-approved"
                          onClick={() => navigate('/business')}
                          disabled={location.pathname === '/business'}
                        >
                          Approved Businesses
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-primary"
                      onClick={() => setIsFormOpen(true)}
                    >
                      Add New Business
                    </button>
                  </div>
                </div>
              </header>

              <main className="business-main">
                <BusinessList
                  businesses={businesses}
                  isAdmin={isAdmin}
                  onEdit={setEditingBusiness}
                  onDelete={handleDeleteClick}
                  onChangeStatus={handleStatusChange}
                />
              </main>
            </>
          }
        />
        <Route
          path="/:id"
          element={
            <UniqueBusiness
              onEdit={setEditingBusiness}
              onDelete={handleDeleteClick}
              refetchKey={refetchKey}
            />
          }
        />
      </Routes>

      {(isFormOpen || editingBusiness) && (
        <BusinessForm
          isAdmin={isAdmin}
          business={editingBusiness || undefined}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBusiness(null);
          }}
        />
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Business"
        message={`Are you sure you want to delete "${deleteConfirmation.businessName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default BusinessPage;

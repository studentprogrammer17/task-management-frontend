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
  const [viewMode, setViewMode] = useState<
    'all' | 'my' | 'approved' | 'pending' | 'rejected'
  >('all');

  const fetchBusinesses = async () => {
    try {
      let response;

      switch (viewMode) {
        case 'my':
          response = await BusinessService.getAllUserBusinesses();
          break;
        case 'pending':
          response = await BusinessService.getBusinessesByStatus('pending');
          break;
        case 'rejected':
          response = await BusinessService.getBusinessesByStatus('rejected');
          break;
        case 'approved':
          response = await BusinessService.getBusinessesByStatus('approved');
          break;
        case 'all':
        default:
          response = await BusinessService.getAllBusinesses();
          break;
      }

      setBusinesses(response.data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [viewMode]);

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
                    {viewMode === 'pending' && 'Pending Businesses'}
                    {viewMode === 'rejected' && 'Rejected Businesses'}
                    {viewMode === 'approved' && 'Approved Businesses'}
                    {viewMode === 'my' && 'My Businesses'}
                    {viewMode === 'all' && 'All Businesses'}
                  </h1>

                  <div className="header-buttons">
                    <button
                      className={`btn ${viewMode === 'all' ? 'btn-active' : ''}`}
                      onClick={() => setViewMode('all')}
                      disabled={viewMode === 'all'}
                    >
                      All Businesses
                    </button>

                    <button
                      className={`btn ${viewMode === 'my' ? 'btn-active' : ''}`}
                      onClick={() => setViewMode('my')}
                      disabled={viewMode === 'my'}
                    >
                      My Businesses
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          className={`btn ${viewMode === 'rejected' ? 'btn-active' : ''}`}
                          onClick={() => setViewMode('rejected')}
                          disabled={viewMode === 'rejected'}
                        >
                          Rejected Businesses
                        </button>

                        <button
                          className={`btn ${viewMode === 'pending' ? 'btn-active' : ''}`}
                          onClick={() => setViewMode('pending')}
                          disabled={viewMode === 'pending'}
                        >
                          Pending Businesses
                        </button>

                        <button
                          className={`btn ${viewMode === 'approved' ? 'btn-active' : ''}`}
                          onClick={() => setViewMode('approved')}
                          disabled={viewMode === 'approved'}
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
                  showMyBusinesses={viewMode === 'my'}
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
              showMyBusinesses={viewMode === 'my'}
              isAdmin={isAdmin}
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

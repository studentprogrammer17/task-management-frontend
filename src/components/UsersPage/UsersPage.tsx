import React, { JSX, useEffect, useState } from 'react';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { Navigate } from 'react-router-dom';
import './UsersPage.css';
import UserForm from './UserForm';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const USERS_PER_PAGE = 5;

  const fetchUsers = async (query = '', page = 1) => {
    try {
      const me = await AuthService.getMe();
      if (me.role !== 'admin') {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      const response = await UserService.getAllUsers(
        query,
        page,
        USERS_PER_PAGE
      );
      setUsers(response.edges);
      setTotal(response.pageInfo.total);
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchQuery, currentPage);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    if (showForm || showConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showConfirm]);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!userToDelete) return;
    await UserService.deleteUser(userToDelete.id);
    fetchUsers(searchQuery, currentPage);
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    fetchUsers(searchQuery, currentPage);
    setShowForm(false);
  };

  const totalPages = Math.ceil(total / USERS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  if (loading) return <div>Loading...</div>;

  if (isAdmin === false) {
    return <Navigate to="/" />;
  }

  const renderPagination = () => {
    const pages: JSX.Element[] = [];

    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)}>
          {'<'}
        </button>
      );
    }

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(currentPage - page) <= 1
      ) {
        pages.push(
          <button
            key={page}
            className={page === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        );
      } else if (page === currentPage - 2 || page === currentPage + 2) {
        pages.push(<span key={`ellipsis-${page}`}>...</span>);
      }
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" onClick={() => setCurrentPage(currentPage + 1)}>
          {'>'}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="users-page">
      <h2>Users</h2>
      <div className="top-bar">
        <button className="create-btn" onClick={handleCreate}>
          Create User
        </button>
        <input
          type="text"
          placeholder="Search by name, email, role..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => handleEdit(u)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => confirmDelete(u)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">{renderPagination()}</div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default UsersPage;

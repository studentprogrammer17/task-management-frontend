import React, { useEffect, useState } from 'react';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { Navigate } from 'react-router-dom';
import './UsersPage.css';
import UserForm from './UserForm';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const me = await AuthService.getMe();
        if (me.role !== 'admin') {
          setIsAdmin(false);
          return;
        }

        setIsAdmin(true);
        const fetchedUsers = await UserService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
    setUsers(users.filter(u => u.id !== userToDelete.id));
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
    const updatedUsers = await UserService.getAllUsers();
    setUsers(updatedUsers);
    setShowForm(false);
  };

  if (loading) return <div>Loading...</div>;

  if (isAdmin === false) {
    return <Navigate to="/" />;
  }

  return (
    <div className="users-page">
      <h2>Users</h2>
      <button className="create-btn" onClick={handleCreate}>
        Create User
      </button>
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

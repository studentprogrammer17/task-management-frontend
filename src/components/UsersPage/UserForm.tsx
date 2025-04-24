import React, { useState, useEffect } from 'react';
import { User, CreateUserByAdminDto, UpdateUserDto } from '../../models/User';
import { UserService } from '../../services/user.service';
import './UserForm.css';

interface Props {
  user: User | null;
  onClose: () => void;
  onSubmit: () => void;
}

const UserForm = ({ user, onClose, onSubmit }: Props) => {
  const [formData, setFormData] = useState<CreateUserByAdminDto | UpdateUserDto>({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      await UserService.updateUser(user.id, formData);
    } else {
      await UserService.createUser(formData as CreateUserByAdminDto);
    }

    onSubmit();
  };

  return (
    <div className="user-form-modal">
      <div className="user-form-content">
        <h3>{user ? 'Edit User' : 'Create User'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />
          {!user && (
            <input name="password" placeholder="Password" type="password" value={(formData as any).password || ''} onChange={handleChange} required />
          )}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="form-buttons">
            <button type="submit">{user ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { AuthService } from '../../services/auth.service';
import { User, ChangePasswordDto } from '../../models/User';
import { UserService } from '../../services/user.service';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const data = await AuthService.getMe();
      setUser(data);
      setFormData({ name: data.name, email: data.email });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (showPasswordModal || showConfirmDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPasswordModal, showConfirmDialog]);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValidName = (name: string) => name.length >= 2 && name.length <= 24;
  const hasChanges =
    user && (user.name !== formData.name || user.email !== formData.email);
  const isFormValid =
    isValidEmail(formData.email) && isValidName(formData.name);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsEditing(true);
    setUpdateError('');
  };

  const handleUpdate = async () => {
    if (!user) return;

    const updateData: Partial<typeof formData> = {};
    if (formData.name !== user.name) updateData.name = formData.name;
    if (formData.email !== user.email) updateData.email = formData.email;

    try {
      const updatedUser = await UserService.updateUser(user.id, updateData);
      setUser(updatedUser);
      setIsEditing(false);
      setUpdateError('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update user';
      setUpdateError(errorMsg);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      setIsEditing(false);
      setUpdateError('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/sign-up';
  };

  const handleDelete = async () => {
    if (user) {
      await UserService.deleteUser(user.id);
      localStorage.removeItem('token');
      window.location.href = '/sign-up';
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    try {
      await AuthService.changePassword(passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password';
      setPasswordError(errorMsg);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>

      <div className="info-section">
        <label>Name</label>
        <input name="name" value={formData.name} onChange={handleInputChange} />

        <label>Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />

        {updateError && <p className="error-text">{updateError}</p>}

        {isEditing && hasChanges && (
          <div className="button-group">
            <button
              className="update-btn"
              onClick={handleUpdate}
              disabled={!isFormValid}
            >
              Update
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="actions-page">
        <button
          className="password-btn"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
        <button
          className="delete-btn"
          onClick={() => setShowConfirmDialog(true)}
        >
          Delete Account
        </button>
      </div>

      {showConfirmDialog && (
        <ConfirmationDialog
          isOpen={true}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action is irreversible."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="password-modal">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Old Password"
              value={passwordForm.oldPassword}
              onChange={e =>
                setPasswordForm({
                  ...passwordForm,
                  oldPassword: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={e =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
            <div className="modal-buttons">
              <button onClick={handleChangePassword}>Submit</button>
              <button onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

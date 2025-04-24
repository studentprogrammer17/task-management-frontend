import React, { useState, useEffect, useRef } from 'react';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import ProfileIcon from '../../assets/ProfileIcon.svg';
import './ProfileInfo.css';
import { useNavigate } from 'react-router-dom';

const ProfileInfo = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AuthService.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/sign-up';
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  return (
    <div
      className="profile-info"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="profile-icon" onClick={() => navigate('/profile')}>
        <img src={ProfileIcon} alt="Profile" />
      </div>
      {dropdownOpen && user && (
        <div className="dropdown-menu show">
          <p>{user.name}</p>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;

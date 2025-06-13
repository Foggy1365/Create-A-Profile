const API_URL = 'http://localhost:3000/api';

// Utility functions
const setToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => {
  return localStorage.getItem('token');
};

const removeToken = () => {
  localStorage.removeItem('token');
};

const showError = (message) => {
  const errorElement = document.getElementById('errorMessage') || document.getElementById('message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.className = 'error-message';
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
};

const showSuccess = (message) => {
  const messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = 'message';
    messageElement.style.display = 'block';
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
};

// Check current page
const isProfilePage = window.location.pathname.includes('profile.html');
const isUpdatePage = window.location.pathname.includes('update.html');
const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';

// Authentication check
if ((isProfilePage || isUpdatePage) && !getToken()) {
  window.location.href = 'index.html';
} else if (isIndexPage && getToken()) {
  window.location.href = 'profile.html';
}

// Profile page functionality (Display only)
if (isProfilePage) {
  // Load user profile data
  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Display user data (not in form inputs)
        document.getElementById('username').textContent = userData.username || '-';
        document.getElementById('email').textContent = userData.email || '-';
        document.getElementById('firstName').textContent = userData.firstName || '-';
        document.getElementById('lastName').textContent = userData.lastName || '-';
        document.getElementById('birthday').textContent = userData.birthday ? new Date(userData.birthday).toLocaleDateString() : '-';
        document.getElementById('biography').textContent = userData.biography || '-';
        document.getElementById('favoriteNumber').textContent = userData.favoriteNumber || '-';
        
        // Use Username as the header
        const headerUsername = document.getElementById('headerUsername');
        if (headerUsername) {
          headerUsername.textContent = userData.username || 'User';
        }
        // Load profile picture if exists
        if (userData.profilePicture) {
          // If the profilePicture is already a full URL, use it directly
          // Otherwise, prepend the server URL
          const imageUrl = userData.profilePicture.startsWith('http') 
            ? userData.profilePicture 
            : `http://localhost:3000${userData.profilePicture}`;
          document.getElementById('profilePicture').src = imageUrl;
        }
      } else {
        showError('Failed to load profile data');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Load profile error:', error);
    }
  };

  // Load profile when page loads
  document.addEventListener('DOMContentLoaded', loadProfile);

  // Edit button functionality
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.location.href = 'update.html';
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      removeToken();
      window.location.href = 'index.html';
    });
  }
}

// Update page functionality
if (isUpdatePage) {
  // Load user profile data for editing
  const loadProfileForEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Populate form fields with user data
        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('birthday').value = userData.birthday ? userData.birthday.split('T')[0] : '';
        document.getElementById('biography').value = userData.biography || '';
        document.getElementById('favoriteNumber').value = userData.favoriteNumber || '';
        
        // Load profile picture if exists
        if (userData.profilePicture) {
          // If the profilePicture is already a full URL, use it directly
          // Otherwise, prepend the server URL
          const imageUrl = userData.profilePicture.startsWith('http') 
            ? userData.profilePicture 
            : `http://localhost:3000${userData.profilePicture}`;
          document.getElementById('profilePicture').src = imageUrl;
        }
      } else {
        showError('Failed to load profile data');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Load profile error:', error);
    }
  };

  // Load profile when page loads
  document.addEventListener('DOMContentLoaded', loadProfileForEdit);

  // Cancel button functionality
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  // Profile update form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        birthday: document.getElementById('birthday').value,
        biography: document.getElementById('biography').value,
        favoriteNumber: document.getElementById('favoriteNumber').value
      };

      try {
        const response = await fetch(`${API_URL}/user`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          showSuccess('Profile updated successfully!');
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 1500);
        } else {
          showError(data.message || 'Failed to update profile');
        }
      } catch (error) {
        showError('Network error. Please try again.');
        console.error('Update profile error:', error);
      }
    });
  }

  // Profile picture upload
  const uploadBtn = document.getElementById('uploadBtn');
  const pictureInput = document.getElementById('pictureInput');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      pictureInput.click();
    });
  }

  if (pictureInput) {
    pictureInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (file.type !== 'image/jpeg') {
        showError('Please upload a JPEG image');
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await fetch(`${API_URL}/user/picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          // The response should contain the full URL
          const imageUrl = data.profilePicture.startsWith('http') 
            ? data.profilePicture 
            : `http://localhost:3000${data.profilePicture}`;
          document.getElementById('profilePicture').src = imageUrl;
          showSuccess('Profile picture updated successfully!');
        } else {
          showError(data.message || 'Failed to upload picture');
        }
      } catch (error) {
        showError('Network error. Please try again.');
        console.error('Upload picture error:', error);
      }
    });
  }
}

// Index page (Login/Register)
if (isIndexPage) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');

  // Toggle between login and register
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
    });
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          setToken(data.token);
          window.location.href = 'profile.html';
        } else {
          showError(data.message || 'Login failed');
        }
      } catch (error) {
        showError('Network error. Please try again.');
      }
    });
  }

  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        birthday: document.getElementById('birthday').value,
        biography: document.getElementById('biography').value,
        favoriteNumber: document.getElementById('favoriteNumber').value
      };

      console.log('Sending registration data:', formData);

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (response.ok) {
          setToken(data.token);
          window.location.href = 'profile.html';
        } else {
          showError(data.message || 'Registration failed');
        }
      } catch (error) {
        showError('Network error. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }
}
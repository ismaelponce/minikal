import React from 'react';

const UserDisplay = ({ user }) => {
  return (
    <div className="text-gray-600 font-light">
      Logged in as: <span className="font-medium">{user.email}</span>
    </div>
  );
};

export default UserDisplay;
import React, { Suspense } from 'react';
import AdminsClientPage from './page.client';

// This is a simple server component wrapper that delegates to the client component
const AdminPage = () => {
  return (
    <Suspense fallback={<div>Loading admin management...</div>}>
      <AdminsClientPage />
    </Suspense>
  );
};

export default AdminPage;

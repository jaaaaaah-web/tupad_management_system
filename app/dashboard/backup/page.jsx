import React from 'react';
import BackupPageClient from './BackupPageClient';
import { getCurrentUser, isSystemAdmin } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

const BackupPage = async () => {
  // Get the current user
  const user = await getCurrentUser();
  
  // Check if user is system_admin
  if (!user || !isSystemAdmin(user)) {
    redirect('/dashboard');
  }
  
  return <BackupPageClient />;
}

export default BackupPage;
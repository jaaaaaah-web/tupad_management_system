import React from 'react';
import { fetchUsers } from '@/app/lib/data';
import UsersPageClient from './UsersPageClient';

const UsersPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  const { count, users } = await fetchUsers(q, page, sort, direction, rowCount);
      
  return <UsersPageClient users={users} count={count} />;
}

export default UsersPage;
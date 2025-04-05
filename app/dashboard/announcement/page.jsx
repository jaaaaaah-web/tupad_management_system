import React from 'react';
import { fetchAnnoucements } from '@/app/lib/data';
import AnnouncementPageClient from './AnnouncementPageClient';

const AnnouncementPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  const { count, announcements } = await fetchAnnoucements(q, page, sort, direction, rowCount);
      
  return <AnnouncementPageClient announcements={announcements} count={count} />;
}

export default AnnouncementPage;
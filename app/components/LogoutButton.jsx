"use client"

import { logout } from "@/app/lib/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button 
        type="submit" 
        className="logout-button"
      >
        Logout
      </button>
    </form>
  );
}
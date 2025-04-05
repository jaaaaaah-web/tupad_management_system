"use client";

import React, { useState, useEffect } from "react";
import styles from "./search.module.css";
import { MdSearch } from "react-icons/md";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Search = ({ placeholder, onSearch, defaultValue = "" }) => {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  // Initialize the search term from URL on component mount
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
  }, [searchParams]);

  // Handle input change
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission with debounce
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If onSearch is provided use it (for client components)
    if (onSearch) {
      onSearch(searchTerm);
      return;
    }
    
    // Otherwise use the router (for server components)
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    
    router.push(`${pathname}?${params}`);
  };

  // Handle enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <MdSearch className={styles.searchIcon} onClick={handleSubmit} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className={styles.input} 
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className={styles.searchButton}>Search</button>
    </form>
  );
};

export default Search;

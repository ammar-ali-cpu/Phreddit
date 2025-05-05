
import React, { useEffect } from 'react';

const Header = ({ currentPage, setCurrentPage, setSearchTerm }) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = event.target.querySelector(".searchInput")?.value.trim() || "";
    if (searchTerm.length > 0) {
      setSearchTerm(searchTerm); 
      setCurrentPage("searchResults"); 
    }
  };

  return (
    <div className="header">
      <div id="heading" onClick={() => setCurrentPage("homePage")} style={{ cursor: "pointer" }}>
        phreddit
      </div>

      <form id="searchForm" onSubmit={handleSearch}>
        <div className="searchbar">
          <span className="searchIcon material-symbols-outlined">search</span>
          <input
            type="search"
            className="searchInput"
            placeholder="Search Phreddit..."
          />
        </div>
      </form>

      <div className={`createPost ${currentPage === "createPostPage" ? "activeButton" : ""}`}>
        <button type="button" className="createPostButton"  onClick={() => setCurrentPage("createPostPage")}>
          Create Post
        </button>
      </div>
    </div>    
  );
};

export default Header;

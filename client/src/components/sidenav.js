import React from "react";
import CommunityList from "./communityList.js";

export default function Sidenav({ currentPage, setCurrentPage, communities}) {
  
  return (
    <nav className="sideNav">
      <a className={`homeButton ${currentPage === 'homePage' ? 'activeButton' : ''}`} onClick={() => setCurrentPage('homePage')}>Home</a>
      <hr className="solid" />
      <p id="comsHeader">COMMUNITIES</p>
      <a className={`homeButton ${currentPage === 'createComPage' ? 'activeButton' : ''}`} onClick={() => setCurrentPage('createComPage')}>Create Community</a>
      <CommunityList communities={communities} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    </nav>
  )
}
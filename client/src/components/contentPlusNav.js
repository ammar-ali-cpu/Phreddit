import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidenav from './sidenav';
import Content from './content';

export default function ContentPlusNav({ currentPage, setCurrentPage, searchTerm }) {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {

    axios.get('http://127.0.0.1:8000/communities')
      .then(res => setCommunities(res.data))
      .catch(() => console.log('Could not get communities'));
  }, []);

  return (
    <div className="contentPlusNav">
      <Sidenav currentPage={currentPage} setCurrentPage={setCurrentPage} communities={communities}/>
      <Content currentPage={currentPage} setCurrentPage={setCurrentPage} searchTerm={searchTerm} communities={communities} setCommunities={setCommunities}/>
      </div>
  );
}
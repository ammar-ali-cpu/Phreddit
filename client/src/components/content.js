import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomePage from './homePage.js';
import SearchResults from './searchResults.js';
import CommunityPage from './communityPage.js';
import PostPage from './postPage.js';
import NewCommunityPage from './createComPage.js';
import CreatePostPage from "./createPostPage.js";
import NewCommentPage from "./newCommentPage.js";
import ProfilePage from './profilePage.js';

  
export default function Content({ currentPage, setCurrentPage, pageProps, searchTerm }) {

  const [selectedPost, setSelectedPost] = useState(null);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/communities")
      .then(response => {
          setCommunities(response.data);
      })
      .catch(err => {
          console.log("Error fetching communities in content page");
      });
}, []);


if (currentPage === 'createComPage') {
  
  return (
    <div className="content">
    <NewCommunityPage setCurrentPage={setCurrentPage} communities={communities} setCommunities={setCommunities}/>
    </div>
  );
}

if (currentPage === "createPostPage") {
    
  return (
    <div className="content">
    <CreatePostPage communities={communities} setCurrentPage={setCurrentPage}/>
    </div>
  );
}

if (currentPage === 'profilePage') {

  return (
  <div className="content">
    <ProfilePage setCurrentPage={setCurrentPage}/>
    </div>
  );
}


if (currentPage.startsWith("newCommentPage:")) {

  const parts = currentPage.split(":");
  const postID = parts[1];
  const parentCommentID = parts[2];  
    
    return (
      <div className="content">
      <NewCommentPage postID={postID} parentCommentID={parentCommentID} setCurrentPage={setCurrentPage}/>
      </div>
    );
}


if (currentPage.startsWith('postPage:')) {

  const postID = currentPage.split(':')[1];
    
  return (
    <PostPage postID={postID} setCurrentPage={setCurrentPage} setPost={setSelectedPost}/>
  );

}


if (currentPage.startsWith("editPost:")) {
  
  const postID = currentPage.split(":")[1];
  
  return (
    <div className="content">
      <CreatePostPage communities={communities} setCurrentPage={setCurrentPage} editPostID={postID}/>
    </div>
  );
}

if (currentPage.startsWith("editCommunity:")) {
  
  const communityID = currentPage.split(":")[1];
  
  return (
    <div className="content">
      <NewCommunityPage communities={communities} setCommunities={setCommunities} setCurrentPage={setCurrentPage} editCommunityID={communityID}/>
    </div>
  );
}


if (currentPage.startsWith("editComment:")) {
  
  const commentID = currentPage.split(":")[1];
  
  return (
    <div className="content">
      <NewCommentPage postID={null} parentCommentID={null} editCommentID={commentID} setCurrentPage={setCurrentPage}/>
    </div>
  );
}
 
  const community = communities.find(c => c._id === currentPage);

  if (community) {

    return (
      <div className="content">
      <CommunityPage communityID={community._id} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
      </div>
    );
    
  }

  const pages = {
    homePage: <HomePage setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>,
    // createComPage: <CreateComPage setCurrentPage={setCurrentPage}/>,
    searchResults: <SearchResults searchTerm={searchTerm} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>,
    communityPage: <CommunityPage {...pageProps} />,
    postPage: <PostPage {...pageProps} setPost={setSelectedPost}/>,
    // newCommentPage: <NewCommentPage setCurrentPage={setCurrentPage} />,
    // createPostPage: <CreatePostPage setCurrentPage={setCurrentPage} />,
  };


  // const pages = {
  //   homePage: ( <HomePage setCurrentPage={setCurrentPage} selectedPost={selectedPost}/> ),
  //   searchResults: (<SearchResults searchTerm={searchTerm} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>),
  // };


  return <div className="content">{pages[currentPage] || (<HomePage setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>)}</div>
  
}

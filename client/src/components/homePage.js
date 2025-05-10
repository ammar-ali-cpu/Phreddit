import PostList from './postList.js';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { sortActive, sortNewest, sortOldest } from './utils.js';
import { useUser } from './UserContext';

export default function HomePage({setCurrentPage, selectedPost}) {
  const [posts, setPosts] = useState([]);
  //const [communities, setCommunities] = useState([]);
  const [comments, setComments] = useState([]);
  const [sortMode, setSortMode] = useState('newest');
  const { user } = useUser();


  useEffect(() => {
    axios.get("http://127.0.0.1:8000/posts")
        .then(response => {
            const sorted = sortNewest(response.data);
            setPosts(sorted);
        })
        .catch(err => {
            console.log("Error fetching posts in home page");
        });

    axios.get("http://127.0.0.1:8000/comments")
        .then(response => {
            setComments(response.data);
        })
        .catch(err => {
            console.log("Error fetching comments in home page");
        });
}, []);

  // // // const sortedPosts = sortNewest(posts);
  // // // useEffect(() => {
  // // //   setPosts(sortedPosts);
  // // // }, []);

  // const handleSortNewest = () => {
  //   setPosts(prevPosts => sortNewest([...prevPosts])); 
  // };

  // const handleSortOldest = () => {
  //   setPosts(prevPosts => sortOldest([...prevPosts])); 
  // };

  // const handleSortActive = () => {
  //   setPosts(prevPosts => sortActive([...prevPosts], comments)); 
  // };

  const handleSort = (mode) => {
    setSortMode(mode);
    if (mode === 'newest') setPosts(prev => sortNewest([...prev]));
    else if (mode === 'oldest') setPosts(prev => sortOldest([...prev]));
    else if (mode === 'active') setPosts(prev => sortActive([...prev], comments));
  };

  const joined = user?.joinedCommunities || [];
  console.log('joined comm',joined);

  let joinedPosts = posts.filter(post => joined.includes(post.communityID));
  let otherPosts = posts.filter(post => !joined.includes(post.communityID));


  if (sortMode === 'newest') {
    joinedPosts = sortNewest(joinedPosts);
    otherPosts = sortNewest(otherPosts);
  } else if (sortMode === 'oldest') {
    joinedPosts = sortOldest(joinedPosts);
    otherPosts = sortOldest(otherPosts);
  } else if (sortMode === 'active') {
    joinedPosts = sortActive(joinedPosts, comments);
    otherPosts = sortActive(otherPosts, comments);
  }

  return (
    <div id="homePage">
    <div className="allPosts">
      <h3>All Posts</h3>
      <div className="allPostButtons">
        {/* <button className="apbuttons" onClick={handleSortNewest}>Newest</button>
        <button className="apbuttons" onClick={handleSortOldest}>Oldest</button>
        <button className="apbuttons" onClick={handleSortActive}>Active</button> */}
        <button className="apbuttons" onClick={() => handleSort('newest')}>Newest</button>
        <button className="apbuttons" onClick={() => handleSort('oldest')}>Oldest</button>
        <button className="apbuttons" onClick={() => handleSort('active')}>Active</button>
      </div>
    </div>
    <p id="numPosts">{posts.length} Posts</p>
    <hr className="solid"/>
    <div id="postList"></div>
    {/* <PostList posts={posts} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/> */}
    <div id="postList">
      {user?.role === "guest" ? (
          <PostList posts={posts} setCurrentPage={setCurrentPage} selectedPost={selectedPost} />
        ) : (
          <>
        {joinedPosts.length > 0 && (
          <>
            <h4 className="postSectionHeader">Posts from My Communities</h4>
            <PostList posts={joinedPosts} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
          </>
        )}
        <hr className="solid"/>
        {otherPosts.length > 0 && (
          <>
            <h4 className="postSectionHeader">Other Posts</h4>
            <PostList posts={otherPosts} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
          </>
        )}
        </>
      )}
    </div>
  </div>  );
}
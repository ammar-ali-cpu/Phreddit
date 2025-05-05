import PostList from './postList.js';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { sortActive, sortNewest, sortOldest } from './utils.js';

export default function HomePage({setCurrentPage, selectedPost}) {
  const [posts, setPosts] = useState([]);
//   const [communities, setCommunities] = useState([]);
  const [comments, setComments] = useState([]);


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

  // const sortedPosts = sortNewest(posts);
  // useEffect(() => {
  //   setPosts(sortedPosts);
  // }, []);

  const handleSortNewest = () => {
    setPosts(prevPosts => sortNewest([...prevPosts])); 
  };

  const handleSortOldest = () => {
    setPosts(prevPosts => sortOldest([...prevPosts])); 
  };

  const handleSortActive = () => {
    setPosts(prevPosts => sortActive([...prevPosts], comments)); 
  };

  return (
    <div id="homePage">
    <div className="allPosts">
      <h3>All Posts</h3>
      <div className="allPostButtons">
        <button className="apbuttons" onClick={handleSortNewest}>Newest</button>
        <button className="apbuttons" onClick={handleSortOldest}>Oldest</button>
        <button className="apbuttons" onClick={handleSortActive}>Active</button>
      </div>
    </div>
    <p id="numPosts">{posts.length} Posts</p>
    <hr className="solid"/>
    <div id="postList"></div>
    <PostList posts={posts} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
  </div>  );
}
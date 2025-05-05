import PostList from './postList.js';
import React, { useState, useEffect } from "react";
import { sortActive, sortNewest, sortOldest } from './utils.js';
import axios from 'axios';

export default function SearchResults({searchTerm, setCurrentPage, selectedPost}) {
  const [matchingPosts, setMatchingPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [allPosts, setAllPosts] = useState([]);


  useEffect(() => {
        axios.get("http://127.0.0.1:8000/comments")
          .then(response => {
              setComments(response.data);
          })
          .catch(err => {
              console.log("Error fetching comments in search results page");
          });

        axios.get("http://127.0.0.1:8000/posts")
          .then(response => {
              setAllPosts(response.data);
          })
          .catch(err => {
              console.log("Error fetching posts in search results page");
          });
    }, []);

    useEffect(() => {
        if (searchTerm && allPosts.length > 0) {
          const terms = searchTerm.toLowerCase().split(" ");
      
          const filteredPosts = allPosts.filter(post => {
            const postText = `${post.title} ${post.content}`.toLowerCase();
            return terms.some(term => postText.includes(term));
          });
      
          setMatchingPosts(sortNewest(filteredPosts)); 
        }
      }, [searchTerm, allPosts]);
  
  
    const handleSortNewest = () => {
      setMatchingPosts(prevPosts => sortNewest([...prevPosts])); 
    };
  
    const handleSortOldest = () => {
      setMatchingPosts(prevPosts => sortOldest([...prevPosts])); 
    };
  
    const handleSortActive = () => {
      setMatchingPosts(prevPosts => sortActive([...prevPosts], comments)); 
    };

  return (
    <div className="searchResults">
      <div className='searchButtons'>
        <h3>{matchingPosts.length > 0 ? `Results for: "${searchTerm}"` : `No results found for: "${searchTerm}"`}</h3>
        <div className="allPostButtons">
        <button className="apbuttons" onClick={handleSortNewest}>Newest</button>
        <button className="apbuttons" onClick={handleSortOldest}>Oldest</button>
        <button className="apbuttons" onClick={handleSortActive}>Active</button>
      </div>
      </div>
      <p className='searchResultLength'>{matchingPosts.length} Posts</p>
      <hr className="solid" />
      <PostList posts={matchingPosts} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
    </div>
  );
}
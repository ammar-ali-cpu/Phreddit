import { formatTimeStamp } from './utils.js';
import { sortActive, sortNewest, sortOldest } from './utils.js';
import React, { useState, useEffect } from "react";
import PostList from './postList.js';
import axios from 'axios';

export default function CommunityPage({communityID, setCurrentPage, selectedPost}) {
    const [communities, setCommunities] = useState([]);
    const [comments, setComments] = useState([]);

    const [allPosts, setAllPosts] = useState([]);
    const [posts, setPosts] = useState([]);
  
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/communities")
          .then(response => {
              setCommunities(response.data);
          })
          .catch(err => {
              console.log("Error fetching communities in communityPage");
          });
  
        axios.get("http://127.0.0.1:8000/comments")
          .then(response => {
              setComments(response.data);
          })
          .catch(err => {
              console.log("Error fetching comments in communityPage");
          });

        axios.get("http://127.0.0.1:8000/posts")
          .then(response => {
              setAllPosts(response.data);
          })
          .catch(err => {
              console.log("Error fetching posts in communityPage");
          });
    }, []);
  
  const community = communities.find(c => c._id === communityID);

 //let [posts, setPosts] = useState([]);
  
//   let postsFromComm = Model.getPostsByCom(communityID);
//   let sortedPosts = sortNewest(postsFromComm);
//     useEffect(() => {
//       setPosts(sortedPosts);
//     }, [communityID]);

useEffect(() => {
    if (community && allPosts.length > 0) {
      const postsFromComm = allPosts.filter(post =>
        community?.postIDs.includes(post._id)
      );
      const sortedPosts = sortNewest(postsFromComm);
      setPosts(sortedPosts);
    }
  }, [community, allPosts]);



  
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
    <div className='communityPage'>
      <div className='communityTop'>
        <h3 className="communityName" >{community?.name}</h3>
        <div class="allPostButtons">
          <button class="apbuttons" id="Newest">Newest</button>
          <button class="apbuttons" id="Oldest">Oldest</button>
          <button class="apbuttons" id="Active">Active</button>
        </div>
      </div>
      <div className='communityDescription' dangerouslySetInnerHTML={{ __html: community?.description }} />
      <p className='communityPageDateAndCount'>Created {formatTimeStamp(community?.startDate)}</p>
      <p className='communityPageDateAndCount'>{community?.postIDs.length} Posts  &nbsp;&nbsp;&nbsp;&nbsp; {community?.memberCount} Members</p>
      <hr class="solid"></hr>
      <PostList posts={posts} com={'yes'} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
    </div>
   
  );
}
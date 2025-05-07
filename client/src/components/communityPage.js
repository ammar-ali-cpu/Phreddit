import { formatTimeStamp } from './utils.js';
import { sortActive, sortNewest, sortOldest } from './utils.js';
import React, { useState, useEffect } from "react";
import PostList from './postList.js';
import axios from 'axios';
import { useUser } from './UserContext';

export default function CommunityPage({communityID, setCurrentPage, selectedPost}) {
    const [communities, setCommunities] = useState([]);
    const [comments, setComments] = useState([]);

    const [allPosts, setAllPosts] = useState([]);
    const [posts, setPosts] = useState([]);

    const [creator, setCreator] = useState(null);
    const { user, login } = useUser(); 
    const [isMember, setIsMember] = useState(false);

  
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

  // useEffect(() => {
  //   if (community?.createdBy) {
  //     axios.get(`http://127.0.0.1:8000/users`)
  //       .then(res => 
  //       {const communityCreator = res.data.find(user => user._id === community.createdBy);
  //       setCreator(communityCreator);})
  //       .catch(err => console.log("Error fetching community creator", err));
  //   }
  // }, [community]);
  useEffect(() => {
    if (community?.createdBy) {
      axios.get(`http://127.0.0.1:8000/users/${community.createdBy}`)
        .then(res => setCreator(res.data))
        .catch(err => console.log("Error fetching community creator", err));
    }
  }, [community]);

  // console.log('creator', creator);

  useEffect(() => {
    if (user.isLoggedIn && community) {
      setIsMember(user.joinedCommunities.includes(community._id));
    } else {
      setIsMember(false);
    }
  }, [user, community]);


  
    const handleSortNewest = () => {
      setPosts(prevPosts => sortNewest([...prevPosts])); 
    };
  
    const handleSortOldest = () => {
      setPosts(prevPosts => sortOldest([...prevPosts])); 
    };
  
    const handleSortActive = () => {
      setPosts(prevPosts => sortActive([...prevPosts], comments)); 
    };

    const handleJoin = async () => {
      try {
        await axios.post(`http://127.0.0.1:8000/communities/${community._id}/join`, {
          userId: user.userId,
        });
        // add user to communities member list, add community to users joined communities list
        // setIsMember(true);
        // login({ ...user, joinedCommunities: [...user.joinedCommunities, community._id] }); // update context
      } catch (err) {
        console.error("Error joining community", err);
      }
    };
    
    const handleLeave = async () => {
      try {
        await axios.post(`http://127.0.0.1:8000/communities/${community._id}/leave`, {
          userId: user.userId,
        });
        // remove user to communities member list, remove community to users joined communities list
        // setIsMember(false);
        // login({ ...user, joinedCommunities: user.joinedCommunities.filter(id => id !== community._id) }); // update context
      } catch (err) {
        console.error("Error leaving community", err);
      }
    };

  return (
    <div className='communityPage'>
      <div className='communityTop'>
        <h3 className="communityName" >{community?.name}</h3>
        <div className="allPostButtons">
          <button className="apbuttons" id="Newest">Newest</button>
          <button className="apbuttons" id="Oldest">Oldest</button>
          <button className="apbuttons" id="Active">Active</button>
        </div>
      </div>
      <div className='communityDescription' dangerouslySetInnerHTML={{ __html: community?.description }} />
      <p className='communityPageDateAndCount'>Created {formatTimeStamp(community?.startDate)}   by {creator?.displayName || 'Unknown'}</p>
      <p className='communityPageDateAndCount'>{community?.postIDs.length} Posts  &nbsp;&nbsp;&nbsp;&nbsp; {community?.memberCount} Members</p>
      {user.isLoggedIn && (
        isMember ? (
          <button className="joinLeaveBtn" onClick={handleLeave}>Leave Community</button>
        ) : (
          <button className="joinLeaveBtn" onClick={handleJoin}>Join Community</button>
        )
      )}
      <hr className="solid"></hr>
      <PostList posts={posts} com={'yes'} setCurrentPage={setCurrentPage} selectedPost={selectedPost}/>
    </div>
   
  );
}
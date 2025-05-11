import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import ProfilePageAdmin from './profilePageAdmin';

export default function ProfilePage({ setCurrentPage }) {

  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('posts'); 


useEffect(() => {

  axios
    .get(`http://127.0.0.1:8000/users/${user.userId}/profile`)
    .then(({ data }) => {
     setProfile(data);
    })
    .catch(err => {
     console.error("Profile did not load", err);
});}, [user.userId]);
  


if (user.role === 'admin') {
  return <ProfilePageAdmin setCurrentPage={setCurrentPage} />;
}

    if (profile === null) {
      return <div>Loading profile</div>;
    }

  const deletePost = async (postID) => {
    
    try {
      await axios.delete(
        `http://127.0.0.1:8000/users/${user.userId}/posts/${postID}`
      );

    const { data } = await axios.get(
        `http://127.0.0.1:8000/users/${user.userId}/profile`
    );

      setProfile(data);

    } catch (err) {
      console.error('Post did not delete');
    }
  };

  const deleteCommunity = async (communityID) => {
    
    if (!window.confirm("All posts and comments will delete if you delete the community. Are you sure?")) {
        return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/users/${user.userId}/communities/${communityID}`
      );

    const { data } = await axios.get(
        `http://127.0.0.1:8000/users/${user.userId}/profile`
    );

      setProfile(data);
    } catch (err) {
      console.error('Community did not delete');
    }
  };

  const deleteComment = async (commentID) => {

    try {
      await axios.delete(
        `http://127.0.0.1:8000/users/${user.userId}/comments/${commentID}`
        
      );

    const { data } = await axios.get(
        `http://127.0.0.1:8000/users/${user.userId}/profile`
    );

      setProfile(data);
      
    } catch (err) {
    console.error('Comments did not delete');
    }
  };

  const editPost = (postID) => setCurrentPage(`editPost:${postID}`);
  const editCommunity = (communityID) => setCurrentPage(`editCommunity:${communityID}`);
  const editComment = (commentID) => setCurrentPage(`editComment:${commentID}`);

  
  const listings = {

    posts: profile.posts.map(post => (
    <li key={post._id}>
    <a href="#" onClick={() => editPost(post._id)}> {post.title} </a>
    <button onClick={() => deletePost(post._id)}> Delete </button>
    </li>
    )),

    communities: profile.communities.map(community => (
    <li key={community._id}>
    <a href="#" onClick={() => editCommunity(community._id)}> {community.name} </a>
    <button onClick={() => deleteCommunity(community._id)}> Delete </button>
    </li>
    )),

    comments: profile.comments.map(comment => (
    <li key={comment._id}>
    <a href="#" onClick={() => { setCurrentPage(`editComment:${comment._id}`);}}> {comment.postTitle}  — {comment.content.slice(0, 20)}</a>
    <button onClick={() => deleteComment(comment._id)}> Delete </button>
    </li>
    )),
  
};

  return (
    <div className="profilePage">
     
    <h1>My Profile</h1>

    <p><>Display name:</> {profile.displayName}</p>
    <p><>Email:</> {profile.email}</p>
    <p><>Member since:</>{' '} {new Date(profile.createdAt).toLocaleDateString()}</p>
    <p><>Reputation:</> {profile.reputation}</p>

    <div className="profile-tabs">
    <button className={(view === 'posts' && 'active') || ''} onClick={() => setView('posts')}> My Posts </button>
    <button className={(view === 'communities' && 'active') || ''} onClick={() => setView('communities')}> My Communities </button>    
    <button className={(view === 'comments' && 'active') || ''} onClick={() => setView('comments')}> My Comments </button>
    </div>

    <div className="profile-content">
    {view === "posts" && listings.posts.length === 0 && <p> You have not posted anything</p>}
    {view === "posts" && listings.posts.length > 0 && <ul className="profile-list">{listings.posts}</ul>}
    
    {view === "communities" && listings.communities.length === 0 && <p>You have not created any communities</p>}
    {view === "communities" && listings.communities.length > 0 && <ul className="profile-list">{listings.communities}</ul>}
    
    {view === "comments" && listings.comments.length === 0 && <p>You have not commented anything</p>}
    {view === "comments" && listings.comments.length > 0 && <ul className="profile-list">{listings.comments}</ul>}
    </div>
    
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {formatTimeStamp} from './utils';
import {useUser} from './UserContext';
import axios from 'axios';

export default function ProfilePageAdmin({setCurrentPage}) {


  const [view, setView] = useState('users');
  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const [chooseUserId, setChooseUserId] = useState(null);
  
  const [ownData, setOwnData] = useState({
    communities: [],
    posts: [],
    comments: []
  });


  const [chooseData, setChooseData] = useState({
    displayName: '',
    email: '',
    createdAt: '',
    communities: [],
    posts: [],
    comments: []
  });

  
  useEffect(() => {

    async function fetchData() {
      try {

    const usersPromise = axios.get('http://127.0.0.1:8000/users');
        const profilePromise = axios.get(`http://127.0.0.1:8000/users/${user.userId}/profile`);
        
    const usersResponse = await usersPromise;
    const profileResponse = await profilePromise;
        
    setUsers(usersResponse.data);
    setOwnData(profileResponse.data);
     
    } catch {
        console.error('Failed to load admin data');
      }
    }

    fetchData();
  }, [user.userId]);


  useEffect(() => {
   
    if (chooseUserId == null) { 
        return;
    }

    axios
      .get(`http://127.0.0.1:8000/users/${chooseUserId}/profile`)
      .then(({data}) => setChooseData(data))
      .catch(() => console.error('Failed to load user profile'));
  }, [chooseUserId]);


  if (user.role !== 'admin') {
    return <div>You must be an admin to view this page.</div>;
  }

  const handleDelete = async (type, id) => {
    
if (!window.confirm('Are you sure?')) {
    return;
}


let who;
if (chooseUserId !== null && chooseUserId !== undefined) {
  who = chooseUserId;
} else {
  who = user.userId;
}

const path = `http://127.0.0.1:8000/users/${who}/${type}/${id}`;
await axios.delete(path);

    
    if (chooseUserId) {

      const { data } = await axios.get(`http://127.0.0.1:8000/users/${chooseUserId}/profile`);

      setChooseData(data);

    } else {

    if (type === 'users') {
     setUsers(us => us.filter(user => user._id !== id));
        
    } else if (type === 'communities') {
     setOwnData(data => ({...data, communities: data.communities.filter(community => community._id !== id)}));
          
    } else if (type === 'posts') {
     setOwnData(data => ({...data, posts: data.posts.filter(post => post._id !== id)}));
    
    } else if (type === 'comments') {
     setOwnData(data => ({...data,comments: data.comments.filter(comment => comment._id !== id)}));
    }

}
  };

  const tabs = ['communities','posts','comments'];

  if (chooseUserId == null) {
  tabs.unshift('users');
}

let data = ownData;
let title = 'Admin Profile';

if (chooseUserId) {
  data = chooseData;
  title = `Profile: ${chooseData.displayName}`;
}

  return (

    <div className="profilePageAdmin">
    
    <h2>{title}</h2>
    {chooseUserId && (<button onClick={() => setChooseUserId(null)}> Back to Admin</button>)}
    <>
    <p>Name: {user.username}</p>
    <p>Email:{user.email}</p>
    <p>Member since: {formatTimeStamp(user.createdAt)}</p>
    <p>Reputation: {user.reputation}</p>
    </>
    
      
    <div className="tabs"> {tabs.map(tab => (
    <button key={tab} className={view === tab && 'active'} onClick={() => setView(tab)}> {tab.charAt(0).toUpperCase() + tab.slice(1)} </button>))}
    </div>

    <div className="list">
    {view === 'users' && !chooseUserId && users.map(user => (<div key={user._id} className="listItem">
    <a href="#" onClick={() => setChooseUserId(user._id)}> {user.displayName} ({user.email}) — Rep: {user.reputation}</a>
    <button onClick={() => handleDelete('users', user._id)}>Delete</button>
    </div>))}
        
    {view === 'communities' && data.communities.map(community => (<div key={community._id} className="listItem">
    <a href="#" onClick={() => setCurrentPage(`editCommunity:${community._id}`)}>{community.name}</a>
    <button onClick={() => handleDelete('communities', community._id)}>Delete</button>
    </div>))}
        
    {view === 'posts' && data.posts.map(post => (<div key={post._1d} className="listItem">
    <a href="#" onClick={() => setCurrentPage(`editPost:${post._id}`)}> {post.title}</a>
    <button onClick={() => handleDelete('posts', post._id)}>Delete</button>
    </div>))}
        
    {view === 'comments' && data.comments.map(comment => (<div key={comment._id} className="listItem">
    <a href="#" onClick={() => setCurrentPage(`editComment:${comment._id}`)}> {comment.postTitle}: “{comment.content.slice(0, 20)}…” </a>
    <button onClick={() => handleDelete('comments', comment._id)}>Delete</button>
    </div>))}

    {view === 'users' && !chooseUserId && (users.length == null) && <p>No users found.</p>}
    {view === 'communities' && (data.communities.length == null) && <p>No communities.</p>}
    {view === 'posts' && (data.posts.length == null) && <p>No posts.</p>}
    {view === 'comments' && (data.comments.length == null) && <p>No comments.</p>}
    
    </div>
</div>
);
}

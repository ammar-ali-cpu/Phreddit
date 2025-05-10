import React from "react";
import CommunityList from "./communityList.js";
import { useUser } from './UserContext';

export default function Sidenav({ currentPage, setCurrentPage, communities}) {
  const {user, logout} = useUser();

  // const sortedCommunities = [...communities].sort((a, b) => {
  //   const aJoined = user.joinedCommunities?.includes(a.name);
  //   const bJoined = user.joinedCommunities?.includes(b.name);

  //   if (aJoined && !bJoined) return -1;
  //   if (!aJoined && bJoined) return 1;
  //   return a.name.localeCompare(b.name); 
  // });

  const joinedCommunities = communities.filter(c => user.joinedCommunities?.includes(c._id));
  // console.log('user name:', user.username);
  // console.log('user :', user);
  // console.log('joined comms:', joinedCommunities);
  const otherCommunities = communities.filter(c => !user.joinedCommunities?.includes(c._id));

  
  return (
    <nav className="sideNav">
      <a className={`homeButton ${currentPage === 'homePage' ? 'activeButton' : ''}`} onClick={() => setCurrentPage('homePage')}>Home</a>
      <hr className="solid" />
      <p id="comsHeader">COMMUNITIES</p>
      <div className={`createComButton ${user.role === 'guest' ? 'guest-disabled' : ''}`}>
        <a className={`homeButton ${currentPage === 'createComPage' ? 'activeButton' : ''}`} onClick={() => setCurrentPage('createComPage')}>Create Community</a>
      </div>
      {/* {joinedCommunities.length > 0 && (
        <>
          <p className="community-subheader">Joined</p>
          <CommunityList
            communities={user.joinedCommunities}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )} */}
      <div className="joinedCommunities">
        <CommunityList className="joinedComms" communities={joinedCommunities} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
      <div className="notJoinedCommunities">
        <CommunityList communities={otherCommunities} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div> 
    </nav>
  )
}
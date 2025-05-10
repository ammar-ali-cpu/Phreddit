import {useState, useEffect} from 'react';
import axios from 'axios';

export default function CommunityList({communities, currentPage, setCurrentPage}) 
{
  //const [communities, setCommunities] = useState([]);

//   useEffect(() => {
//     axios.get("http://127.0.0.1:8000/communities")
//         .then(response => {
//             setCommunities(response.data);
//         })
//         .catch(err => {
//             console.log("Community list load failed");
//         });
// }, []);


  return (
    <div className="communityList">
        {communities.map(community => (  
        <a
        key={community._id} 
        href="#"
        className={`communityLink ${currentPage === community._id ? 'activeLink' : ''}`}
        onClick={() => setCurrentPage(community._id)}
        >
        {community.name}
      </a>  
        ))}
    </div>
  
  );
}
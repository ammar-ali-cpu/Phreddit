import { formatTimeStamp } from './utils';
import { useState, useEffect } from 'react';
import axios from 'axios';


export default function Post({post, com, setCurrentPage}) {
    const [communities, setCommunities] = useState([]);
    const [comments, setComments] = useState([]);
    const [flair, setFlairs] = useState([]);


    useEffect(() => {
      axios.get("http://127.0.0.1:8000/communities")
        .then(response => {
            setCommunities(response.data);
        })
        .catch(err => {
            console.log("Error fetching communities in posts");
        });

      axios.get("http://127.0.0.1:8000/comments")
        .then(response => {
            setComments(response.data);
        })
        .catch(err => {
            console.log("Error fetching comments in posts");
        });

      axios.get("http://127.0.0.1:8000/flairs")
        .then(response => {
            setFlairs(response.data);
        })
        .catch(err => {
            console.log("Error fetching flair in posts");
        });
  }, []);
  
  const community = communities.find(c => c.postIDs.includes(post._id));

  const flairObj = post.linkFlairID
    ? flair.find(f => f._id.toString() === post.linkFlairID.toString())
    : null;
  
  const [views, setViews] = useState(post.views);

  useEffect(() => {
    setViews(post.views); 
  }, [post.views]);


  return (
    <div className="post" onClick={() => setCurrentPage(`postPage:${post._id}`)}  key={post.views}>
        {com === 'yes' ? <p className='postTopLine'>{post.postedBy} • {formatTimeStamp(post.postedDate)}</p> 
            : <p className='postTopLine'>{community?.name} • {post.postedBy} • {formatTimeStamp(post.postedDate)}</p>}
        <h3 className='postTitle'>{post.title}</h3>
        {flairObj && <p className='flair'>{flairObj.content}</p>}
        <p className='first80' dangerouslySetInnerHTML={{ __html: post.content.substring(0, 80) + "..." }} />
        <p className='viewAndComment'>{post.votes} votes &nbsp;&nbsp;&nbsp;&nbsp; {post.views} views   &nbsp;&nbsp;&nbsp;&nbsp;   {post.commentIDs.length} comments</p>

    </div>
  
  );
}
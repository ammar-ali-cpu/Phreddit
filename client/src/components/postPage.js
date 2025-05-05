import { formatTimeStamp } from './utils.js';
import { useEffect, useState } from 'react';
import Post from './post.js';
import axios from 'axios';

function Comment({ comment, allComments, postID, setCurrentPage }) {
  
  const replies = allComments.filter(c => comment.commentIDs.includes(c._id))
    .sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate));

  const handleReply = () => { 
    setCurrentPage(`newCommentPage:${postID}:${comment._id}`);
  };

  return (
  <div className="comment" style={{ marginLeft: "20px", marginTop: "10px" }}>
  <p className="commentHeader">
  {comment.commentedBy} • {formatTimeStamp(comment.commentedDate)}
  </p>
    <div className="commentContent" dangerouslySetInnerHTML={{ __html: comment.content }} />
    <button onClick={handleReply}>Reply</button>
    {replies.map(reply => (
    <Comment key={reply._id} comment={reply} allComments={allComments} postID={postID} setCurrentPage={setCurrentPage}/>
    ))}
    </div>
  );
}



export default function PostPage({postID, setCurrentPage, setPost}) {
  const [views, setViews] = useState(0);
  const [post, setInnerPost] = useState(null);
  const [community, setCommunity] = useState(null);
  const [flair, setFlair] = useState(null);
  const [comments, setComments] = useState([]);
  const [allComments, setAllComments] = useState([]);



    useEffect(() => {
        //console.log("Trying to fetch post with ID:", postID);

        axios.get('http://127.0.0.1:8000/posts')
            .then(res => {
            const allPosts = res.data;
            const foundPost = allPosts.find(p => p._id === postID);

            if (foundPost) {
                setInnerPost(foundPost);
                setViews(foundPost.views);
                //setPost(foundPost);
                //the line above caused a weird error where the post i clicked was the only post showing up on post list
            } else {
                console.log("Post not found in client-side filtering.");
            }
            })
            .catch(err => {
            console.log("Error fetching all posts:", err);
            });

        axios.get('http://127.0.0.1:8000/communities')
            .then( res => {
                const communities = res.data;
                const thisComm = communities.find(c => c.postIDs.includes(postID))
                setCommunity(thisComm);
            })
            .catch(err => {
                console.log("Error fetching community in post page");
            });

        axios.get('http://127.0.0.1:8000/comments')
            .then( res => {
                setAllComments(res.data);
            })
            .catch(err => {
                console.log("Error fetching comments in post page");
            });
        
      

        axios.post(`http://127.0.0.1:8000/posts/incrementViews/${postID}`)
            .then(res => setViews(res.data.updatedViews))
            .catch(err => console.error("Failed to increment views", err));

    }, [postID, setPost]);

    console.log("post:", post);

    useEffect(() => {
      
      if (!post || post.linkFlairID === "") {
        return;
      } 
      axios.get(`http://127.0.0.1:8000/flairs`)
        .then(res => {
          
        const match = res.data.find(
        f => String(f._id) === String(post.linkFlairID)
      );
      
      if (match !== undefined && match !== null) {
        setFlair(match);
      } else {
        setFlair(null);
      }
    
  })
    .catch(console.error("Issue with the flairs"));
    
  }, [post]);   
  

  useEffect(() => {
    if (post && allComments.length > 0) {
      const topLevel = allComments.filter(c => post.commentIDs.includes(c._id))
        .sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate));;
      setComments(topLevel);
    }
  }, [post, allComments]);





  return (
    <div className='postPage'>
      <p className='comDateAuthor'>{community?.name} • {formatTimeStamp(post?.postedDate)}</p>
      <p className='comDateAuthor'>Posted by: {post?.postedBy}</p>
      <h3 className='postHeader'>{post?.title}</h3>
      {flair ? <p className='flair'>{flair?.content}</p> : ""}

      <div className="postCont" dangerouslySetInnerHTML={{ __html: post?.content }} />
      <p className='viewAndComment'> {post?.views} Views &nbsp;&nbsp;&nbsp;&nbsp; {post?.commentIDs.length} Comments</p>
      <button className='addCommentButton'onClick={() => setCurrentPage(`newCommentPage:${postID}`)}>Add a Comment</button>
      <hr className="solid" />
      <div className="commentsSection">
      {comments?.length > 0 && (comments.map(comment => (<Comment 
      key={comment._id} comment={comment} allComments={allComments} postID={postID} setCurrentPage={setCurrentPage}/>
)))}
    </div>

    </div>
  );
}
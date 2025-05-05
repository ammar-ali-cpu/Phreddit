
import Post from './post.js';

export default function PostList({posts, com, setCurrentPage, selectedPost}) {

  return (
    <div className="postList">
        {posts.map(post => (  
        <Post key={post._id} post={selectedPost && selectedPost.postID === post.postID ? selectedPost : post} com={com} setCurrentPage={setCurrentPage}/>  
        ))}
    </div>
  
  );
}

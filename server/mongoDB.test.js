const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


const Post = require('./models/posts');
const Comment = require('./models/comments');

let mongod;

beforeAll(async () => {
  
    mongod = await MongoMemoryServer.create();
  
  await mongoose.connect(mongod.getUri());

  
});

afterAll(async () => {
  
await mongoose.disconnect();
  await mongod.stop();
});

test('deleting post and comments', async () => {
  const post = await Post.create({
    title: 'Test Post',
    content: 'Hello',
    commentIDs: []
  });

  const comment1 = await Comment.create({
    content: 'First',
    commentedDate: Date.now(),
    
    commentIDs: []
  });
  post.commentIDs.push(comment1._id);
  await post.save();


  const reply = await Comment.create({
    
    content: 'Reply',
    commentedDate: Date.now(),
    commentIDs: []


  });
  
  comment1.commentIDs.push(reply._id);
  await comment1.save();

 
  await Post.findByIdAndDelete(post._id);
  await Comment.findByIdAndDelete(comment1._id);
 


  const foundPost = await Post.findById(post._id);
  const foundC1 = await Comment.findById(comment1._id);

  const foundReply = await Comment.findById(reply._id);

  expect(foundPost).toBeNull();
  expect(foundC1).toBeNull();
  expect(foundReply).toBeNull();

});

// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const cors = require('cors');
const https = require('https');
const mongoose = require('mongoose');
const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const Flair = require('./models/linkflairs');
const Users = require('./models/users')
const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");


const app = express();
app.use(cors());
app.use(express.json());

const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';
mongoose.connect(mongoDB).then(() => console.log("Connected to MongoDB..."));

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!" + new Date().toString())
});


app.get("/communities", async (req, res) => {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (error) {
        console.log("Server side problem loading communities for commList")
    }
})

app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        console.log("Server side problem loading posts for homePage")
    }
})

app.get('/communities/:id', async (req, res) => {
    
    try {
      const communities = await Community.findById(req.params.id);
      
      if (communities == null) {
        return res.sendStatus(404);
      }

      res.json(communities);
    } catch (err) {
      console.error('Could not get community');
    }
  });

  app.post("/communities", async (req, res) => {
    try {

        const { 
            name, 
            description, 
            creatorId 
        } = req.body;
      
        const community = new Community({
            name,
            description,
            members: [creatorId],     
            postIDs: []           
        });

      const saved = await community.save();

    await Users.findByIdAndUpdate(creatorId, {    
     $push: { createdCommunities: saved._id }
    });

      
    return res.status(201).json(saved);
  
    } catch (err) {

      if (err.code === 11000) {
        return res.status(400).json({ error: "Community name already exists" });
      }

      console.error("Error creating community:", err);
    }
  });





  app.post("/linkflairs", async (req, res) => {
    try {
      
    const { 
        content 
    } = req.body;
      
    const flair = new Flair({ content });
    const saved = await flair.save();
    res.status(201).json(saved);
    
    } catch (err) {
        console.log("Server side problem loading link flairs for homePage")
    }
  });

  app.post("/posts", async (req, res) => {
    try {
      
    const {
        title,
        content,
        postedBy,
        communityID,
        linkFlairID  
    } = req.body;
  
    const post = new Post({
        title,
        content,
        postedBy,
        postedDate: Date.now(),
        views: 0,
        commentIDs: [],
        linkFlairID: linkFlairID || undefined
    });
     
    const savedPost = await post.save();
  
    await Community.findByIdAndUpdate(communityID, {
    $push: { postIDs: savedPost._id }
    });
  
    const creatorUser = await Users.findOne({displayName: postedBy});
    
    if (creatorUser) {
      await Users.findByIdAndUpdate(creatorUser._id, {
        $push: { createdPosts: savedPost._id }
      });
    }

    res.status(201).json(savedPost);

    } catch (err) {
        console.log("Server side problem loading posts for homePage")
    }
  });


  app.get('/users/:id/profile', async (req, res) => {
    
    try {

    const user = await Users.findById(req.params.id).lean();

      if (user == null) {
         return res.sendStatus(404);
      }

      const [communities, posts] = await Promise.all([
        Community.find({ _id: { $in: user.createdCommunities } }),
        Post.find({ _id: { $in: user.createdPosts }})
      ]);
  
      const rawComments = await Comment.find({ _id: { $in: user.createdComments } });
    
      const comments = await Promise.all(rawComments.map(async comment => {
        let root = comment;

        while (true) {
          const parent = await Comment.findOne({ commentIDs: root._id });

        if (parent == null) {
         break;
        }

          root = parent;
        }
      
        const parentPost = await Post.findOne({ commentIDs: root._id });
      
        return {
          _id: comment._id,
          content: comment.content,
          commentedDate: comment.commentedDate,
          postId: parentPost && parentPost._id,
          postTitle: (parentPost && parentPost.title) || 'Unknown post'
        };
        
      }
    ));
  
      res.json({
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
        reputation: user.reputation,
        communities,
        posts,
        comments
      });


    } catch (err) {

      console.error(err);
    }
  });






  app.get("/comments", async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        console.log("Server side problem loading comments for homePage")
    }
})

  app.get("/comments/:commentid", async (req, res) => {
    
    try {
      
        const comment = await Comment.findById(req.params.commentid);
      
      if (comment == null) {
        return res.sendStatus(404);
      }

      return res.json(comment);

    } catch (err) {
      console.error(err);

    }
  });
  
  app.put("/comments/:cid", async (req, res) => {
   
    try {

    const updated = await Comment.findByIdAndUpdate(req.params.cid,{content: req.body.content },{new: true}
      
    );
      
    if (updated == null) {

    return res.status(404).end();
    
}
      return res.json(updated);

    } catch (err) {
      console.error(err);
    }
  });

app.post("/comments", async (req, res) => {
    try {

    const { 
        content, 
        commentedBy, 
        parentType, 
        parentID,
        userId
    } = req.body;
  
    const comment = new Comment({
        content,
        commentedBy,
        commentIDs: [],     
        commentedDate: Date.now()
      });

      const saved = await comment.save();
      console.log("saved id: ", saved._id);
  
     
    if (parentType === "post" && parentID) {
        await Post.findByIdAndUpdate(parentID, { $push: { commentIDs: saved._id } });
      } else if (parentType === "comment" && parentID) {
        await Comment.findByIdAndUpdate(parentID, { $push: { commentIDs: saved._id } });
      }
  
    if (userId) {
    await Users.findByIdAndUpdate(req.body.userId, {
        $push: { createdComments: saved._id }
    });
    }
    
    return res.status(201).json(saved);
    
    } catch (err) {
        console.log("Server side problem loading comments for homePage");
    }

  });


app.get("/flairs", async (req, res) => {
    try {
        const flairs = await Flair.find();
        res.json(flairs);
    } catch (error) {
        console.log("Server side problem loading flair for homePage")
    }
})


app.post('/posts/incrementViews/:id', async (req, res) => {
    
    const postID = req.params.id;
  
    try {
      const updatedPost = await Post.findByIdAndUpdate(
        postID,
        { $inc: { views: 1 } },
        { new: true } 
      );
  
      if (updatedPost == null) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      res.json({ updatedViews: updatedPost.views });
      
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

app.post('/users', async (req, res) => {
    try {
        const { firstName, lastName, displayName, email, password } = req.body;

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new Users({ firstName, lastName, displayName, email, passwordHash, reputation:100});
        const saved = await user.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("User registration error:", err);
        res.status(500).json({error: "Failed to register user."});
    }
});

app.post('/users/check-email-and-display', async (req, res) => {
    const { email, displayName } = req.body;

    try {
        const emailExists = await Users.findOne({ email });
        const displayNameExists = await Users.findOne({ displayName });
        return res.json({
            emailExists: emailExists !== null,
            displayNameExists: displayNameExists !== null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error checking for email/displayName.' });
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try{
        const user = await Users.findOne({email});
        if (!user) {
            console.log('No account with that email.');
            return res.status(400).json({error: "No account with that email." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password." });
        }
        const { passwordHash, isAdmin, reputation, createdAt, ...rest } = user.toObject();
      res.status(200).json({...rest,reputation,isAdmin,role: isAdmin ? 'admin' : 'user',createdAt});
    } catch (err) {
        res.status(500).json({ error: "Server error during login." });
    }
});



  app.delete('/users/:userid/communities/:communityid', async (req, res) => {

    const {communityid} = req.params;
    const posts = await Post.find({communityID: communityid});

    await Promise.all(
     posts.map(p => Comment.deleteMany({ _id: { $in: p.commentIDs } }))
    );
   
    await Post.deleteMany({communityID: communityid });
    await Community.findByIdAndDelete(communityid);
    await Users.findByIdAndUpdate(req.params.userid, {$pull: {createdCommunities: communityid} });
    
    res.sendStatus(204);
  });


  app.delete('/users/:userid/posts/:postid', async (req, res) => {
    
    const { userid, postid } = req.params;
    
    try {
      const post = await Post.findById(postid);
      
      if (post == null) {
        return res.sendStatus(404);
      }

      await Comment.deleteMany({ _id: { $in: post.commentIDs } });
      await Post.findByIdAndDelete(postid);
      await Users.findByIdAndUpdate(userid, { $pull: { createdPosts: postid} });
      
      return res.sendStatus(204);

    } catch (err) {
      console.error('Error while deleting');
    }
  });
  

  app.delete('/users/:userid/comments/:commentid', async (req, res) => {
    
    const { userid, commentid } = req.params;
    
    try {

      async function deleteWithReplies(commentId) {
        const comment = await Comment.findById(commentId);
        
        if (comment == null) {
            return;
        }

        for (let childId of comment.commentIDs) {
          await deleteWithReplies(childId);
        }

        await Comment.findByIdAndDelete(commentId);
      }

      await deleteWithReplies(commentid);
      await Users.findByIdAndUpdate(userid, { $pull: { createdComments: commentid } });
      return res.sendStatus(204);

    } catch (err) {
      console.error('Error while deleting comments');
    }
  });


  app.get("/posts/:id", async (req, res) => {
    
    try {
      const post = await Post.findById(req.params.id);
    
    if (post == null) {
        return res.sendStatus(404);
      }

      return res.json(post);
    } catch (err) {
      console.error('Error getting post');
    }
  });
  

  app.put("/posts/:id", async (req, res) => {
    
    const postid = req.params.id;
    const { title, content, linkFlairID, communityID: newCommunityID } = req.body;
  
    try {
    
      const oldCommunity = await Community.findOne({ postIDs: postid });
      
      let oldCommunityID;
        
      if (oldCommunity != null) {
        oldCommunityID = oldCommunity._id.toString();
    } else {
        oldCommunityID = undefined; 
    }
  

      if (newCommunityID && oldCommunityID !== newCommunityID) {
        
        if (oldCommunityID) {
          await Community.findByIdAndUpdate(oldCommunityID, {$pull: { postIDs: postid }});
        }


        await Community.findByIdAndUpdate(newCommunityID, {
          $push: { postIDs: postid }
        });
      }
  

      const updated = await Post.findByIdAndUpdate( postid, {title, content, linkFlairID},{new: true});
  
      if (updated == null) {
        return res.sendStatus(404);
      }

      return res.json(updated);
  
    } catch (err) {
        console.error('Error');
      }
  });


  app.put("/communities/:id", async (req, res) => {
    
    try {

      const community = await Community.findById(req.params.id);
      
      if (community == null) {
        return res.sendStatus(404);
      }
  
      community.name = req.body.name;
      community.description = req.body.description;

      const updated = await community.save();

      if (updated == null)  {
        return res.status(404).end();
      }


      res.json(updated);

    } catch (err) {

      if (err.code === 11000) {

        return res.status(400).json({ error: "Community name already exists" });
      }
      console.error('Error updating community');
    }
  });




  app.post('/communities/:id/join', async (req, res) => {
    
    const {id: commID} = req.params;
    const {userId} = req.body;


    try {

      const updatedComm = await Community.findByIdAndUpdate( commID,
      { $addToSet: { members: userId }, $inc: { memberCount: 1 } },
      { new: true }
      );

      const updatedUser = await Users.findByIdAndUpdate( userId,
      { $addToSet: { joinedCommunities: commID } },
      { new: true }
      );

     
      return res.status(200).json(updatedComm);
    
    }
    catch {
        console.error('Error joining community');
    }
});

app.post('/communities/:id/leave', async (req, res) => {
   
    const {id: commID} = req.params;
    const {userId} = req.body;

    try {

    const updatedComm = await Community.findByIdAndUpdate (commID,
    { $pull: { members: userId }, $inc: { memberCount: -1 } },
    { new: true }
    );
      
    const updatedUser = await Users.findByIdAndUpdate (userId,
      { $pull: { joinedCommunities: commID } },
      { new: true }
      );

    
      return res.status(200).json(updatedComm);


    }
    catch {
        console.error('Error leaving community');
        res.sendStatus(500);
    }
});



  async function checkCanVote(userId) {
    
    const user = await Users.findById(userId);

    if (user == null || user.reputation < 50) {
      throw { status: 403, msg: 'Need greater than or equal to 50 rep to vote' };
    }
  }
  
  
  app.post('/posts/:id/vote', async (req, res) => {
    
    const { id } = req.params;
    const { userId, vote } = req.body; 

    try {

      await checkCanVote(userId);
      const post = await Post.findById(id);
     
      if (post == null) {
        return res.sendStatus(404);
      }
      
      const existing = post.voters.find(v => String(v.userId) === userId);
      
      if (existing) {
        return res.status(400).json({ error: 'Already voted' });
      }

      post.voters.push({ userId, vote });
      post.voteCount += vote;

      await post.save();
    
      const poster = await Users.findOne({ displayName: post.postedBy });
      
      if (poster) {
        poster.reputation += (vote === 1 && 5) || -10;
        await poster.save();
      }

      res.json({ voteCount: post.voteCount });
    } catch {
      res.sendStatus(err.status || 500);
    }
  });


app.post('/comments/:id/vote', async (req, res) => {
  
  const { id } = req.params;
  const { userId, vote } = req.body; 

  try {
    
    await checkCanVote(userId);

  
    const comment = await Comment.findById(id);


    if (comment.voters.find(v => String(v.userId) === userId)) {
      return res.status(400).json({ error: 'Already voted' });
    }


    comment.voters.push({ userId, vote });
    comment.voteCount += vote;
    await comment.save();


    const commenter = await Users.findOne({ displayName: comment.commentedBy });
    
    if (commenter) {
      commenter.reputation += (vote === 1 && 5) || -10;
      await commenter.save();
    }

  
    res.json({ voteCount: comment.voteCount });

  } catch {
    res.sendStatus(err.status || 500);
  }
});


app.get('/users', async (req, res) => {
  
  try {
    
  const all = await Users.find().lean();
  res.json(all);

  } catch {
    console.error('Error fetching all users');
  }

});


app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
   
    const comms = await Community.find({ creatorId: id });
    const communityIds = comms.map(c => c._id);

    const postsInComm = await Post.find({communityID: { $in: communityIds }});
    const allCommentIds = postsInComm.flatMap(post => post.commentIDs);
    const postIds = userPosts.map(post => post._id);


    await Comment.deleteMany({ _id: { $in: allCommentIds } });
    await Post.deleteMany({ communityID: { $in: communityIds } });
    await Community.deleteMany({ _id: { $in: communityIds } });

    
    const userPosts = await Post.find({ postedById: id });
    
    await Comment.deleteMany({ _id: { $in: allCommentIds } });
    await Post.deleteMany({ _id: { $in: postIds } });


   async function deleteWithReplies(commentId) {
      
    const commen = await Comment.findById(commentId);
      
    if (commen == null) { 
     return;
    }
      
    for (let childId of commen.commentIDs) {
      await deleteWithReplies(childId);
    }
      
    await commen.remove();
    
    }
    
    const user = await Users.findById(id);
    
    for (let cid of (user.createdComments || [])) {
      await deleteWithReplies(cid);
    }

   
    await Users.findByIdAndDelete(id);
    res.sendStatus(204);

  } catch {
    console.error('Error deleting user and their content');
  }
});



app.listen(8000, () => {console.log("Server listening on port 8000...");});

process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log("Server closed. Database instance disconnected.");
    process.exit(0);
});

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


app.post("/communities", async (req, res) => {
    try {
      
    const { 
        name, 
        description, 
        creator 
    } = req.body;
  
    const community = new Community({
        name,
        description,
        members: [creator],     
        postIDs: []           
    });
  
    const saved = await community.save();
    res.status(201).json(saved);

    } catch (err) {
        console.log("Server side problem loading new communities for homePage")
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
  
    res.status(201).json(savedPost);

    } catch (err) {
        console.log("Server side problem loading posts for homePage")
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


app.post("/comments", async (req, res) => {
    try {

    const { 
        content, 
        commentedBy, 
        parentType, 
        parentID 
    } = req.body;
  
    const comment = new Comment({
        content,
        commentedBy,
        commentIDs: [],     
        commentedDate: Date.now()
      });

      const saved = await comment.save();
      console.log("saved id: ", saved._id);
  
     
    if (parentType === "post") {
        await Post.findByIdAndUpdate(parentID, { $push: { commentIDs: saved._id } });
      } else {
        await Comment.findByIdAndUpdate(parentID, { $push: { commentIDs: saved._id } });
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
  
      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      res.json({ updatedViews: updatedPost.views });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ error: "Server error" });
    }
  });



app.listen(8000, () => {console.log("Server listening on port 8000...");});

process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log("Server closed. Database instance disconnected.");
    process.exit(0);
});
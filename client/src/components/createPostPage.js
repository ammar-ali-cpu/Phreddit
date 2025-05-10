import React, { useState, useEffect } from "react";
import axios from "axios";

function checkForLinks(text) {

    let newText = "";
    let error = "";
    let current = 0;
  
    while (true) {
      
      let bracket1 = text.indexOf("[", current);
      if (bracket1 === -1) {
        newText += text.substring(current);
        break;
      }
      
      newText += text.substring(current, bracket1);
      
      let bracket2 = text.indexOf("]", bracket1);
      if (bracket2 === -1) {
        newText += text.substring(bracket1);
        break;
      }
      
      let parentheses1 = text.indexOf("(", bracket2);
      let parentheses2 = text.indexOf(")", parentheses1);
  
      if (parentheses1 === -1 || parentheses2 === -1) {
        newText += text.substring(bracket1);
        break;
      }
      
      let linkText = text.substring(bracket1 + 1, bracket2).trim();
      let url = text.substring(parentheses1 + 1, parentheses2).trim();
    
        if (linkText === "") {
          error = "Text can't be empty.";
          break;
        }
  
        if (url === "") {
          error = "URL can't be empty";
          break;
        }
        
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          error = "URL must start with http:// or https://";
          break;
        }
    
        newText += "<a href=\"" + url + "\">" + linkText + "</a>";
  
        current = parentheses2 + 1;
      
    }
    
      return {error, newText};
    }

export default function CreatePostPage({ communities, setCurrentPage }) {

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [selectedCom, setSelectedCom] = useState("");
  const [flairs, setFlairs] = useState([]);
  const [existingFlair, setExistingFlair] = useState("");
  const [newFlair, setNewFlair] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/flairs')
      .then(res => setFlairs(res.data))
      .catch(err => console.error('Error fetching flairs:', err));
  }, []); 

  const checkForErrors = () => {
    const errors = {};

    if (!selectedCom) {
        errors.community = "Select a community";
    }

    if (title === "") {
        errors.title = "A title is required";
    } else if (title.length > 100) {
        errors.title = "Max 100 characters max for the Title";
    }

    if (body === "") {
        errors.body = "Body is required";
    }

    if (postedBy === "") {
        errors.postedBy = "A username is required";
    }

    if (newFlair && newFlair.length > 30) {
        errors.newFlair = "Max 30 characters max for the flair";
    }
    return errors;
  };

  const onSubmit = async function() {

    const er = checkForErrors();
    const {error: linkError, newText} = checkForLinks(body);

    if (Object.keys(er).length) { 
        return setErrors(er);
    }
    
    if (linkError) {
      return setErrors(prev => ({ ...prev, bodyLink: linkError}));
    }

    try {
      let flairID = existingFlair;
     
      if (!existingFlair && newFlair) {
        const { data: flair } = await axios.post(
          "http://127.0.0.1:8000/linkflairs",
          { content: newFlair }
        );

        flairID = flair._id;
        setFlairs(prev => [...prev, flair]);
      }

      const { data: post } = await axios.post(
        "http://127.0.0.1:8000/posts",
        {
          title,
          content: newText,
          postedBy,
          communityID: selectedCom,
          linkFlairID: flairID
        }
      );

     
    setCurrentPage(`postPage:${post._id}`);
    console.log('created')
    
} catch (er) {
    console.log("Client side problem with posts")
}
  };

  return (

    <div id="createPostPage">
    <h3>Create a New Post</h3>
    
    <div id="newPostForm">
    {errors.form && <p className="error">{errors.form}</p>}
    <form onSubmit={onSubmit} className="newPostsForm">
    
    <div className="form-group">   
    <label className="newPostLabels" htmlFor="communitySelect">Select Community </label>   
    <select id="communitySelect" value={selectedCom} onChange={e => setSelectedCom(e.target.value)}>   
    <option value="">choose</option>   
    {communities.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
    </select>
    {errors.community && <p className="error">{errors.community}</p>}
    </div>

    <div className="form-group">
    <label className="newPostLabels" htmlFor="postTitle">Title (max 100 characters)</label>
    <input id="postTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={100}/>
    {errors.title && <p className="error">{errors.title}</p>}
    </div>

    <div className="form-group">
    <label className="newPostLabels" htmlFor="postContent">Body</label>
    <textarea id="postContent" value={body} onChange={e => setBody(e.target.value)}/>
    {errors.body && <p className="error">{errors.body}</p>}
    </div>

    <div className="form-group">
    <label className="newPostLabels" htmlFor="postUsername"> Posted by</label>
    <input id="postUsername" type="text" value={postedBy} onChange={e => setPostedBy(e.target.value)}/>
    {errors.postedBy && <p className="error">{errors.postedBy}</p>}
    </div>

    <div className="form-group">
    <label className="newPostLabels" htmlFor="existingFlair"> Choose Flair</label>
    <select id="existingFlair" value={existingFlair} onChange={e => { setExistingFlair(e.target.value); setNewFlair("");}}>
    <option value="">--none--</option>
    {flairs.map(flair => (<option key={flair._id} value={flair._id}>{flair.content}</option>))}
    </select>
    </div>

    <div className="form-group">
    <label className="newPostLabels" htmlFor="newFlair">Or create new Flair (max 30 characters)</label>
    <input id="newFlair" type="text" value={newFlair} onChange={e => {setNewFlair(e.target.value);setExistingFlair("");}} maxLength={30}/>
    {errors.newFlair && <p className="error">{errors.newFlair}</p>}
    </div>

    <button id="submit" type="submit">Submit Post</button>
        
    </form>
    </div>
</div>
);
}
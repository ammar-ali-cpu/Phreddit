import React, { useState } from 'react';
import axios from 'axios';

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

export default function NewCommentPage({postID, parentCommentID, setCurrentPage}) {
  
  const [content,setContent] = useState("");
  const [author,setAuthor] = useState("");
  const [errors,setErrors] = useState({});

  const checkForErrors = () => {
    
    const errors = {};

    if (content === "") {
        errors.content   = "Comment cannot be empty.";
    } else if (content.length > 500) {
        errors.content = "500 characters max for content.";
    }

    if (author === "") {     
        errors.author = "A username is required.";
    }

    return errors;
  };

  const onSubmit = async function() {

    const er = checkForErrors();
    const {error: linkError, newText} = checkForLinks(content);
    let parentType;

    if (Object.keys(er).length) {
        return setErrors(er);
    }
    
    if (linkError) {
      return setErrors(prev => ({ ...prev, content: linkError }));
    }
    
    if (parentCommentID) {
      parentType = "comment";
    } else {
      parentType = "post";
    }

    try {
      await axios.post("http://127.0.0.1:8000/comments", {
        content: newText,
        commentedBy: author,
        parentType,
        parentID: parentCommentID || postID
      });
      
      setCurrentPage(`postPage:${postID}`);
    } catch (err) {
        console.log("Client side problem with new comments.")
    }
  };

  return (

    <div id="newComForm">
   
    <div id="newComHeader">
    <h2>New Comment</h2>
    </div>

    {errors.form && <p className="error">{errors.form}</p>}

    <form id="newCommentForm" onSubmit={onSubmit}>
    <label className="newComLabels">Comment</label>
    <textarea id="commentCont" value={content} onChange={e => setContent(e.target.value)}/>
    {errors.content && <p className="error">{errors.content}</p>}

    <label className="newComLabels">Username</label>
    <input id="user" type="text" value={author} onChange={e => setAuthor(e.target.value)}/>
    {errors.author && <p className="error">{errors.author}</p>}
    </form>

    <button id="newComSubmit" type="submit" form="newCommentForm"> Submit Comment</button>

    </div>
  );
}
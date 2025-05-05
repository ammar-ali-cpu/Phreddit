
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
  

export default function NewCommunityPage({ setCurrentPage, communities, setCommunities }) {
    
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('');
  const [errors, setErrors] = useState({});

  const checkForErrors = () => {

    const errors = {};

    if (name === "") {
        errors.name = ' A name is required';
    } else if (name.length > 100) {
        errors.name = '100 characters max for the Name';
    }
    
    if (description === "") {
        errors.description = 'A description is required';
    } else if (description.length > 500) {
        errors.description = '500 characters max for the Description';
    }

    if (creator === "") {
        errors.creator = 'A username is required';
    }

    return errors;
  };


  const onSubmit = async function() {
    
    const er = checkForErrors();
    const {error: linkError, newText} = checkForLinks(description);

    if (Object.keys(er).length) {
        return setErrors(er);
    }
    
    if (linkError) {
      return setErrors(prev => ({ ...prev, descLink: linkError }));
    }

    try {

      const { data: newComm } = await axios.post(
        'http://127.0.0.1:8000/communities',
        { name, description: newText, creator }
      );

      setCommunities([...communities, newComm ]);
      setCurrentPage(newComm._id); 

    } catch (er) {
      console.log("Client side problem with new communities")
    }
  };


  return (

    <div id="newComForm">
    <h2>New Community</h2>
    {errors.form && <p className="error">{errors.form}</p>}
    <form onSubmit={onSubmit}>
        
    <label className="newComLabels">Name</label>
    <input id="communityName" placeholder="100 characters max" value={name} onChange={e=>setName(e.target.value)} />
    {errors.name && <p className="error">{errors.name}</p>}

    <label className="newComLabels">Description</label>
    <textarea id="communityDescription" placeholder="500 characters max" value={description} onChange={e=>setDescription(e.target.value)} />
    {errors.description && <p className="error">{errors.description}</p>}
    {errors.descLink && <p className="error">{errors.descLink}</p>}

    <label className="newComLabels">Username</label>
    <input id="creatorUsername" value={creator} onChange={e=>setCreator(e.target.value)} />
    {errors.creator && <p className="error">{errors.creator}</p>}

    <button id="newComSubmit" type="submit">Engender Community</button>
    </form>
    
    </div>
  );
}

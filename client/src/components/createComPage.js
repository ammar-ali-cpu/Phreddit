
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from "./UserContext";

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
  

export default function NewCommunityPage({ setCurrentPage, communities, setCommunities, editCommunityID }) {
    
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const { user } = useUser();
  const creatorId = user.userId;      
  
  useEffect(() => {

    axios
      .get(`http://127.0.0.1:8000/communities/${editCommunityID}`)
      .then(({ data }) => { setName(data.name); setDescription(data.description);})
      .catch(console.error);
  }, [editCommunityID]);


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

    const sameName = communities.find(c => c.name.toLowerCase() === name.toLowerCase() && c._id !== editCommunityID);
    
    if (sameName) {
      errors.name = "That community name is already taken";
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
      
    if (editCommunityID) {

    const { data: newCommunity } = await axios.put(
    `http://127.0.0.1:8000/communities/${editCommunityID}`,
    { name, description }
    );

    setCommunities(prev => prev.map(c => {
    if (c._id === newCommunity._id) {
      return newCommunity
    } else {
      return c
    }
}
))
    
  setCurrentPage('profilePage');
  
  } else {

  const { data: newComm } = await axios.post(
    'http://127.0.0.1:8000/communities',
     { name, description, creatorId }
    );

      setCommunities([...communities, newComm ]);
      setCurrentPage(newComm._id); 

      }
    } catch (err) {
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

    <button id="newComSubmit" type="submit">Engender Community</button>
    </form>
    
    </div>
  );
}

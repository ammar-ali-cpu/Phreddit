import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import Header from './header.js'; 
import ContentPlusNav from './contentPlusNav.js';
//import { set } from 'mongoose';

export default function WelcomePage() {
    const [currentPage, setCurrentPage] = useState("home"); 
    const [searchTerm, setSearchTerm] = useState("");

    const [mode, setMode] = useState("welcome"); //possoble values welcome, register, and login
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    
    const { login } = useUser();

    const validPassword = (password, firstName, lastName, displayName, email) =>
    {
        let lowPass = password.toLowerCase();
        if(lowPass.includes(firstName.toLowerCase()) ||
        lowPass.includes(lastName.toLowerCase()) ||
        lowPass.includes(displayName.toLowerCase()) ||
        lowPass.includes(email.toLowerCase())){
            return "Password cannot contain name, display name, or email.";
        }
        return "";
    };

    const handleRegister = async (e) => {
        setError("");
        e.preventDefault();
        const { firstName, lastName, displayName, email, password, confirmPassword } = form;

        if(password !== confirmPassword){
            return setError("Passwords don't match");
        }

        const passErr = validPassword(password, firstName, lastName, displayName, email);
        if (passErr) {
            return setError(passErr);
        }

        try{
            // //figure out later why custom email or display name post method not working
            // const resp = await axios.post('http://127.0.0.1:8000/users/check-email-and-display', {
            //     email,
            //     displayName
            // });
            // const {emailExists, displayNameExists} = resp.data;
            // if(emailExists)
            // {
            //     return setError('Email in use');
            // }
            // if(displayNameExists)
            // {
            //     return setError('Display name in use');
            // }

            await axios.post('http://127.0.0.1:8000/users', {
                firstName,
                lastName,
                displayName,
                email,
                password
              });
            setMode("welcome");
            setForm({
              firstName: '', lastName: '', displayName: '', email: '', password: '', confirmPassword: ''
            });
        } 
        catch (err) {
            setError("Registration failed! Email or display name already in use.");
        }
    }

    const handleLogin = async (e) => {
        setError("");
        setForm({ email: '', password: '' });
        e.preventDefault();

        const { email, password } = form;

        try{
            const response = await axios.post('http://127.0.0.1:8000/login', {email, password});

            const userInfo = {
                username: response.data.displayName, 
                role: response.data.isAdmin || 'user',
                userId: response.data.id, 
                joinedCommunities: response.data.joinedCommunities
            };

            console.log("Login successful:", response.data);
            login(userInfo);
            setMode("homepage");
        } catch(err) {
            setError("Login failed.");
        }
    }

        
    if (mode === "register"){
        return(
            <div className="welcomeDiv">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>} {/* Error message */}
                <form className='registrationForm' onSubmit={handleRegister}>
                    <table>
                        <tbody>
                            <tr>
                                <td><label htmlFor="firstName">First Name:</label></td>
                                <td><input type="text" name="firstName" id="firstName" 
                                value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="lastName">Last Name:</label></td>
                                <td><input type="text" name="lastName" id="lastName" 
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="email">Email:</label></td>
                                <td><input type="email" name="email" id="email" 
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="displayName">Display Name:</label></td>
                                <td><input type="text" name="displayName" id="displayName" 
                                value={form.displayName}
                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="password">Password:</label></td>
                                <td><input type="password" name="password" id="password" 
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="confirmPassword">Confirm Password:</label></td>
                                <td><input type="password" name="confirmPassword" id="confirmPassword" 
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}/></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="submit">Register</button>
                    <button onClick={() => setMode("welcome")}>Back</button>
                </form>
            </div>
        )
    }
    else if(mode === "login"){
        return(
            <div className="welcomeDiv">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>} {/* Error message */}
                <form className='loginForm' onSubmit={handleLogin}>
                    <table>
                        <tbody>
                            <tr>
                                <td><label htmlFor="loginEmail">Email:</label></td>
                                <td><input type="email" name="loginEmail" id="loginEmail" 
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></td>
                            </tr>
                            <tr>
                                <td><label htmlFor="loginPassword">Password:</label></td>
                                <td><input type="password" name="loginPassword" id="loginPassword" 
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}/></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="submit">Login</button>
                    <button onClick={() => setMode("welcome")}>Back</button>
                </form>
            </div>
        )
    }
    else if (mode === "homepage") {
        return (
            <section className="phreddit">
                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm} />
                <hr className="solid" />
                <ContentPlusNav currentPage={currentPage} setCurrentPage={setCurrentPage} searchTerm={searchTerm}/>
            </section>
        );
    }
    else if (mode === "guest") {
        return (
            <section className="phreddit">
                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm} />
                <hr className="solid" />
                <ContentPlusNav currentPage={currentPage} setCurrentPage={setCurrentPage} searchTerm={searchTerm}/>
            </section>
        );
    }


    return (
    <div className="welcomeDiv">
        <h2>Welcome to Phreddit!</h2>
        <button onClick={() => setMode("login")}>Log in</button>
        <button onClick={() => setMode("register")}>Register</button>
        <button onClick={() => setMode("guest")}>Continue as Guest</button>
    </div>
  );
}

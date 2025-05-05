import React, { useState } from 'react';
import axios from 'axios';

export default function WelcomePage() {

    const [mode, setMode] = useState("welcome"); //possoble values welcome, register, and login

        
    if (mode === "register"){
        return(
            <div className="welcomeDiv">
                <h2>Register</h2>
                <form>
                    <input type="text" name="firstName"/>
                    <input type="text" name="lastName"/>
                    <input type="email" name="email"/>
                    <input type="text" name="displayName"/>
                    <input type="password" name="password"/>
                    <input type="password" name="confirmPassword"/>
                    <button type="submit">Register</button>

                </form>
            </div>
        )
    }


    return (
    <div className="welcomeDiv">
        <h2>Welcome to Phreddit!</h2>
        <button>Log in</button>
        <button onClick={() => setMode("register")}>Register</button>
        <button>Continue as Guest</button>
    </div>
  );
}

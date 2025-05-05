// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import React, { useContext, createContext, useState } from "react";
import './stylesheets/App.css';
import Header from "./components/header.js"
import ContentPlusNav from "./components/contentPlusNav.js";
import Phreddit from './components/phreddit.js'
import WelcomePage from "./components/welcomePage.js";
import { UserProvider } from './components/UserContext';

function App() {
  const [currentPage, setCurrentPage] = useState("homePage");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    // <section className="phreddit">
    //   {/* <Phreddit /> */}
    //   <Header currentPage={currentPage} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm}/>
    //   <hr className="solid"></hr>
    //   <ContentPlusNav currentPage={currentPage} setCurrentPage={setCurrentPage} searchTerm={searchTerm}/>
    // </section>
    <UserProvider>
      <section>
        <WelcomePage/>
      </section>
    </UserProvider>
  );
}

export default App;

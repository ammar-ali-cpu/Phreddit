import { createContext, useState, useContext } from 'react';

export const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}
  
export function UserProvider({ children }) {
    const [user, setUser] = useState({
      isLoggedIn: false,
      role: 'guest', //  'guest' | 'user' | 'admin'
      username: null,
      userId: null,
      joinedCommunities: [],
    });
    const login = (userData) => {
        setUser({
          isLoggedIn: true,
          role: userData.role,
          username: userData.username,
          userId: userData.userId,
          joinedCommunities: userData.joinedCommunities || [],
        });
      };
    
      const logout = () => {
        setUser({
          isLoggedIn: false,
          role: 'guest',
          username: null,
          userId: null,
          joinedCommunities: [],
        });
      };
    
      return (
        <UserContext.Provider value={{ user, login, logout }}>
          {children}
        </UserContext.Provider>
      );
    }
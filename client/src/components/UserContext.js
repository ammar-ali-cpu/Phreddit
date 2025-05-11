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
      reputation: 0,
      joinedCommunities: [],
    });
    const login = (userData) => {
        setUser({
          isLoggedIn: true,
          role: userData.role,
          username: userData.username,
          userId: userData.userId,
          reputation: userData.reputation,
          isAdmin:   userData.isAdmin,
          createdAt: userData.createdAt,
          email: userData.email
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

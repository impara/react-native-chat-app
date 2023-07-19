import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import firebaseInstance from './Firebase'; // Adjust the path based on your project structure
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User,
} from '@firebase/auth';

type AuthContextType = {
  user: User | null;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseInstance.auth.onAuthStateChanged(
      authUser => {
        setUser(authUser);
      },
      error => {
        console.log('Auth state change error:', error); // Log the error here
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithFacebook = async (accessToken: string) => {
    console.log('Attempting to log in with Facebook...');
    try {
      const credential = FacebookAuthProvider.credential(accessToken);
      const auth = getAuth();
      const userCredential = await signInWithCredential(auth, credential);
      console.log('Facebook login result:', userCredential);
      if (userCredential.user) {
        console.log('Logged in user:', userCredential.user); // Log the logged-in user
      }
    } catch (error) {
      console.log('Facebook login error:', error);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    console.log('Attempting to log in with Google...');
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const auth = getAuth();
      const userCredential = await signInWithCredential(auth, credential);
      if (userCredential.user) {
        console.log('Logged in user:', userCredential.user); // Log the logged-in user
      }
    } catch (error) {
      console.log('Google login error:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseInstance.auth.signOut();
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{user, loginWithFacebook, loginWithGoogle, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

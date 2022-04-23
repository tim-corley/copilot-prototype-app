import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type IAuthProviderProps = {
    children: ReactNode;
};

interface ILogin {
  email: string,
  password: string
}

interface ITokenResponse {
  refresh: string;
  access: string;
  }

interface IUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_admin: boolean;
    username: string;
  }

export interface IAuthContextProps {
    isAuthenticated: boolean;
    loading: boolean;
    user: IUser | null;
    error: string | null;
    login: (email: string, password: string) => {};
    logout: () => void;
    getToken: () => Promise<string | null>;
    clearErrors: () => void;
}

// // Intended to pass into createContext but not sure how to define default vals for
// // login & getToken (i.e. returns Promise, not void)
// const authContextDefaultValues: IAuthContextProps = {
//     isAuthenticated: false,
//     loading: true,
//     user: null,
//     login: () => {},
//     logout: () => {},
//     getToken: () => {}
// };

const AuthContext = createContext<Partial<IAuthContextProps>>({});

export const AuthProvider = ({ children }: IAuthProviderProps) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [accessToken, setAccessToken] = useState<string>("");
    const [refreshToken, setRefreshToken] = useState<string>("");
    const [error, setError] = useState(null);
  
    const router = useRouter();
  
    const setNotAuthenticated = (): void => {
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
    };
  
    const accessTokenIsValid = async (): Promise<boolean> => {
      if (accessToken === "") {
        return false;
      }
      const resp = await axios.post("api/auth/verify", {
        accessToken
      })
      return resp.data.isAuthenticated
    }
  
    const initAuth = async (): Promise<void> => {
      setLoading(true);
      if (!accessTokenIsValid()) {
        console.log("Invalid access token so refetching")
        await fetchNewToken();
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      initAuth();
    }, []);

    const initUser = async (token: string): Promise<void> => {
      const resp = await axios.get("api/auth/user", {
        headers: {
          'Authorization': `JWT ${accessToken}`
        }
      });
      const user = await resp.data.user;
      setUser(user);
    }

    // PASSING VALID REFRESH TOKEN TO refresh/ RETURNS NEW ACCESS TOKEN
    const fetchNewToken = async (): Promise<string | null> => {
      setLoading(true);
      const resp = await axios.post("api/auth/refresh", {
        refreshToken
      })
      if (!resp.data.success) {
        setNotAuthenticated();
        return null;
      }
      const tokenData = await resp.data.tokenData;
      handleNewToken(tokenData);
      if (user === null) {
        console.log("No user loaded so loading from refreshed token");
        await initUser(tokenData.access);
      }
      return tokenData.access;
    }
  
    const handleNewToken = (data: ITokenResponse): void => {
      setAccessToken(data.access);
      setRefreshToken(data.refresh)
      setIsAuthenticated(true);
      setLoading(false);
    }

    const login = async (email: string, password: string): Promise<void> => {
        try {
            setLoading(true);
            const res = await axios.post("api/auth/token", {
              email,
              password,
            });
            if (res.data.success) {
              const tokenData = await res.data.tokenData
              handleNewToken(tokenData);
              await initUser(tokenData.access);
              // router.push("/");
            } else {
              setIsAuthenticated(false);
              setLoading(false);
            }
      } catch (error) {
        setLoading(false);
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    };
  
    const getToken = async (): Promise<string | null> => {
      // Returns an access token if there's one or refetches a new one
      console.log("Getting access token..");
      if (await accessTokenIsValid()) {
        console.log("Getting access token.. existing token still valid");
        return Promise.resolve(accessToken);
      } else if (loading) {
        while (loading) {
          console.log("Getting access token.. waiting for token to be refreshed");
        }
        // Assume this means the token is in the middle of refreshing
        return Promise.resolve(accessToken);
      } else {
        console.log("Getting access token.. getting a new token");
        const token = await fetchNewToken();
        return token;
      }
    }
  
    const logout = (): void => {
      setAccessToken("");
      setRefreshToken("");
      setNotAuthenticated();
    };

    const clearErrors = () => {
      setError(null);
    };

    const value = {
      isAuthenticated,
      user,
      loading,
      error,
      login,
      logout,
      getToken,
      clearErrors,
    };
  
    return (
      <AuthContext.Provider
        value={value}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
export const useAuth = (): any => useContext(AuthContext);


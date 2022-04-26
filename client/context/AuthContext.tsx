import axios from "axios";
import { useRouter } from "next/router";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

type IAuthProviderProps = {
  children: ReactNode;
};

interface ILogin {
  email: string;
  password: string;
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

  const verifyAccessToken = async (): Promise<boolean> => {
    const resp = await axios.post("api/auth/verify", {
      accessToken,
    });
    return resp.data.isAuthenticated;
  };

  const accessTokenIsValid = (): boolean | Promise<boolean> => {
    if (accessToken === "") {
      return false;
    } else {
      return verifyAccessToken();
    }
  };

  const initAuth = async (): Promise<void> => {
    setLoading(true);
    if (!accessTokenIsValid()) {
      console.log("Invalid or missing access token so refetching");
      await fetchNewToken();
    } else {
      console.log("INIT AUTH FAIL - NO TOKENS");
      setIsAuthenticated(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const initUser = async (accessToken: string): Promise<void> => {
    const resp = await axios.post("api/auth/user", {
      accessToken,
    });
    const user = await resp.data.user;
    setUser(user);
  };

  // GET REFRESH TOKEN FROM COOKIE
  const fetchRefreshCookie = async (): Promise<void> => {
    const resp = await axios.get("api/auth/refresh");
    // TODO HANDLE CASE FOR NO REFRESH TOKEN IN COOKIE - USER MUST LOGIN
    if (resp.data.refresh) {
      setRefreshToken(resp.data.refresh);
    }
  };

  // PASSING VALID REFRESH TOKEN TO refresh/ RETURNS NEW ACCESS TOKEN
  // REFRESHTOKEN STATE VALUE IS SET TO EMPTY ON PAGE RELOADS
  // WILL CHECK STATE & THEN COOKIE FOR REFRESH TOKEN
  // IF NO REFRESH TOKENS FOUND, USER MUST LOGIN (TODO)
  const fetchNewToken = async (): Promise<void | null> => {
    setLoading(true);
    if (refreshToken === "") {
      await fetchRefreshCookie();
    }
    // TODO HANDLE CASE FOR NO REFRESH TOKEN IN COOKIE - USER MUST LOGIN
    if (refreshToken !== "") {
      // TODO FIX HERE
      const resp = await axios.post("api/auth/refresh", {
        refreshToken,
      });
      if (!resp.data.tokenData) {
        console.log("---here---");
        setNotAuthenticated();
        return null;
      }
      handleNewToken(resp.data.tokenData);
      if (user === null) {
        console.log("No user loaded so loading from refreshed token");
        await initUser(resp.data.tokenData.access);
      }
      return resp.data.tokenData.access;
    } else {
      console.log("OOPS");
    }
  };

  const handleNewToken = (data: ITokenResponse): void => {
    console.log("HANDLING NEW TOKEN...");
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.post("api/auth/token", {
        email,
        password,
      });
      if (res.data.success) {
        const tokenData = await res.data.tokenData;
        handleNewToken(tokenData);
        await initUser(tokenData.access);
        router.push("/");
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
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.post("api/auth/logout");
      if (res.data.success) {
        setAccessToken("");
        setRefreshToken("");
        setNotAuthenticated();
      } else {
        setLoading(false);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): any => useContext(AuthContext);

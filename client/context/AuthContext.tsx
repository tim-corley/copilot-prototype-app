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
  getToken: () => Promise<string | undefined>;
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
  const [error, setError] = useState(null);

  const router = useRouter();

  // IF NO ACCESS TOKEN, FALSE
  // IF ACCESS TOKEN, SEND TO VERIFY ENDPOINT
  const accessTokenIsValid = async (): Promise<boolean> => {
    if (accessToken === "") {
      return false;
    }
    const resp = await axios.post("api/auth/verify", {
      accessToken,
    });
    return resp.data.isAuthenticated;
  };

  // CHECK IF ACCESS TOKEN (IN MEMORY) IS VALID
  // IF SO SET IS AUTH
  // IF NOT, GET A NEW TOKEN
  const initAuth = async (): Promise<void> => {
    setLoading(true);
    if (!!accessTokenIsValid()) {
      console.log("Invalid access token. Attempting to refresh.");
      await refreshAccessToken();
    } else {
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
  const fetchRefreshCookie = async (): Promise<string | undefined> => {
    const resp = await axios.get("api/auth/refresh");
    // TODO HANDLE CASE FOR NO REFRESH TOKEN IN COOKIE - USER MUST LOGIN
    if (resp.data.refresh) {
      return resp.data.refresh;
    } else {
      return;
    }
  };

  // USE REFRESH TOKEN TO GET NEW ACCESS TOKEN
  const refreshAccessToken = async (): Promise<string | undefined> => {
    setLoading(true);
    const cookie_resp = await fetchRefreshCookie();
    // NO REFRESH COOKIE IS SET
    if (!cookie_resp) {
      setNotAuthenticated();
      return;
    }
    const token_resp = await axios.post("api/auth/refresh", {
      cookie_resp,
    });
    if (!token_resp.data.tokenData) {
      setNotAuthenticated();
      return;
    }
    handleNewToken(token_resp.data.tokenData.access);
    if (user === null) {
      console.log("No user loaded. Fetching user data from refreshed token");
      await initUser(token_resp.data.tokenData.access);
    }
    return token_resp.data.tokenData.access;
  };

  const handleNewToken = (accessToken: string): void => {
    setAccessToken(accessToken);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const setNotAuthenticated = (): void => {
    setIsAuthenticated(false);
    setLoading(false);
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.post("api/auth/token", {
        email,
        password,
      });
      if (res.data.success) {
        const accessToken = res.data.tokenData.access;
        handleNewToken(accessToken);
        await initUser(accessToken);
        router.push("/");
      } else {
        setNotAuthenticated();
      }
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
  };

  const getToken = async (): Promise<string | undefined> => {
    // Returns an access token if there's one or refetches a new one
    console.log("Getting access token..");
    if (await accessTokenIsValid()) {
      console.log("Getting access token.. existing token still valid");
      return accessToken;
    } else if (loading) {
      while (loading) {
        console.log("Getting access token.. waiting for token to be refreshed");
      }
      // Assume this means the token is in the middle of refreshing
      return Promise.resolve(accessToken);
    } else {
      console.log("Getting access token.. getting a new token");
      return refreshAccessToken();
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.post("api/auth/logout");
      if (res.data.success) {
        setLoading(false);
        setAccessToken("");
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

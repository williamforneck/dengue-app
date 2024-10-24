import {
  storageAuthTokenGet,
  storageAuthTokenRemove,
  storageAuthTokenSave,
} from "@storage/storageAuthToken";
import {
  storageUserGet,
  storageUserPointsSave,
  storageUserRemove,
  storageUserSave,
} from "@storage/storageUser";
import * as Location from "expo-location";
import { ReactNode, createContext, useEffect, useState } from "react";

import { Loading } from "@components/Loading";
import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";

export type AuthContextDataProps = {
  user: UserDTO;
  location: Location.LocationObject | undefined
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPoints: () => Promise<void>;
  isLoadingUserStorageData: boolean;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [location, setLocation] = useState<Location.LocationObject>();

  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);

  async function updateUserAndToken(userData: UserDTO, token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  }

  async function storageUserAndTokenSave(
    userData: UserDTO,
    token: string,
    refresh_token: string
  ) {
    try {
      setIsLoadingUserStorageData(true);

      await storageUserSave(userData);
      await storageAuthTokenSave({ token, refresh_token });
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post("sessions", { email, password });

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(
          data.user,
          data.token,
          data.refresh_token
        );
        updateUserAndToken(data.user, data.token);
      }
    } catch (error) {
      throw error;
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const { token } = await storageAuthTokenGet();

      if (userLogged._id && token) {
        updateUserAndToken(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserPoints() {
    try {
      const { data } = await api.get("rank/points");
      await storageUserPointsSave(data.pontos);
      setUser((old) => ({
        ...old,
        pontos: data.pontos,
      }));
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);
      setUser({} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser(userUpdated);
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  const getPosition = async () => {
    const permissions = await Location.getForegroundPermissionsAsync();

    if (!permissions.granted) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
    }

    const lastPosition = await Location.getLastKnownPositionAsync();

    if (lastPosition) {
      setLocation(lastPosition);
    } else {
      console.log(
        "nenhuma posicao anterior fornecida, carregando posição atual",
      );

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.BestForNavigation,
      });
      setLocation(loc);
    }
  };


  useEffect(() => {
    getPosition();
    loadUserData();
  }, []);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    return () => {
      subscribe();
    };
  }, []);

  if (isLoadingUserStorageData) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isLoadingUserStorageData,
        updateUserProfile,
        updateUserPoints,
        location
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_STORAGE } from "./storageConfig";
import { UserDTO } from "@dtos/UserDTO";

export async function storageUserPointsSave(pontos: number) {
  const usuarioAtual = await storageUserGet();

  await AsyncStorage.setItem(
    USER_STORAGE,
    JSON.stringify({ ...usuarioAtual, pontos })
  );
}

export async function storageUserSave(user: UserDTO) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export async function storageUserGet() {
  const storage = await AsyncStorage.getItem(USER_STORAGE);
  const user: UserDTO = storage ? JSON.parse(storage) : {};
  return user;
}

export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE);
}

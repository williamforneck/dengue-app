import { HStack, Icon, Text, VStack } from "native-base";

import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { TouchableOpacity } from "react-native";
import { UserPhoto } from "./UserPhoto";

export function HomeHeader() {
  const { user, signOut } = useAuth();

  return (
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center">
      <UserPhoto
        size={16}
        source={
          user.avatar
            ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
            : defaultUserPhotoImg
        }
        alt="Imagem do usuário"
        mr={4}
      />
      <VStack flex={1}>
        <Text numberOfLines={1} fontSize="md" color="gray.100">
          Olá,{" "}
          <Text fontSize="md" fontFamily="heading" color="gray.100">
            {user.name}
          </Text>
        </Text>

        <Text fontSize="sm" color="gray.200">
          {user.pontos
            ? `${user.pontos} pontos`
            : "Você ainda não possui pontos"}
        </Text>
      </VStack>
      <TouchableOpacity onPress={signOut}>
        <Icon as={MaterialIcons} name="logout" color="gray.200" size={7} />
      </TouchableOpacity>
    </HStack>
  );
}

import { RankDTO } from "@dtos/RankDTO";
import { api } from "@services/api";
import { HStack, Image, Text, VStack } from "native-base";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { useAuth } from "@hooks/useAuth";

type Props = {
  data: RankDTO;
  position: number;
  mb?: number;
};

export function RankCard({ data, position, mb = 3 }: Props) {
  const { user } = useAuth();

  return (
    <HStack
      w="full"
      px={5}
      py={4}
      mb={mb}
      bg={"gray.600"}
      borderColor={"green.500"}
      borderWidth={user.id === data.id ? 1 : 0}
      rounded="md"
      alignItems="center"
      justifyContent="space-between"
      position="relative"
    >
      <Text
        position="absolute"
        top={0}
        left={1}
        color="gray.300"
        fontSize="sm"
        fontFamily="heading"
        p={0}
      >
        {position} &#176;
      </Text>
      <Image
        source={
          data.avatar
            ? { uri: `${api.defaults.baseURL}/avatar/${data.avatar}` }
            : defaultUserPhotoImg
        }
        defaultSource={defaultUserPhotoImg}
        alt="Foto do usuario"
        borderWidth={2}
        borderColor="gray.400"
        w={16}
        h={16}
        rounded="full"
      />
      <VStack ml={4} flex={1}>
        <Text
          fontFamily="heading"
          color="gray.200"
          fontSize="md"
          numberOfLines={1}
        >
          {data.name}
        </Text>
        <Text color="gray.300" fontSize="sm" numberOfLines={1}>
          {data.cidade} - {data.uf}
        </Text>
      </VStack>
      <Text
        fontFamily="heading"
        color="white"
        fontSize="lg"
        textTransform="capitalize"
      >
        {data.pontos}
      </Text>
    </HStack>
  );
}

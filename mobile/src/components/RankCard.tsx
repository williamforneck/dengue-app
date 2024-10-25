import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { RankDTO } from "@dtos/RankDTO";
import { useAuth } from "@hooks/useAuth";
import { HStack, Image, Text, VStack } from "native-base";

type Props = {
  data: RankDTO;
  position: number;
  mb?: number;
  firstPosition: boolean
};

export function RankCard({ data, position, mb = 3, firstPosition }: Props) {
  const { user } = useAuth();

  return (
    <HStack
      w="full"
      px={5}
      py={4}
      mb={mb}
      bg={user._id === data._id ? 'gray.400' : "gray.600"}
      borderColor={user._id === data._id ? "green.500" : firstPosition ? 'yellow.500' : 'gray.400'}
      borderWidth={user._id === data._id ? 2 : 1}
      rounded="md"
      alignItems="center"
      justifyContent="space-between"
      position="relative"
    >
      <Text
        position="absolute"
        top={0}
        left={1}
        color={'gray.300'}
        fontSize="sm"
        fontFamily="heading"
        p={0}
      >
        {position} &#176;
      </Text>
      <Image
        source={
          data.avatar
            ? { uri: data.avatar }
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
          color={user._id === data._id ? 'gray.100' : "gray.200"}
          fontSize="md"
          numberOfLines={1}
        >
          {data.name}
        </Text>
      </VStack>
      <Text
        fontFamily="heading"
        fontSize="lg"
        textTransform="capitalize"
        color={'gray.100'}
      >
        {data.pontos}
      </Text>
    </HStack>
  );
}

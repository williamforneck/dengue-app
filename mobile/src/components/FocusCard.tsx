import { HStack, Icon, Image, Text, VStack } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

import { Entypo } from "@expo/vector-icons";
import { FocusDto } from "@dtos/FocusDTO";
import { api } from "@services/api";
import DefaultImage from "@assets/userPhotoDefault.png";
import CheckSvg from "@assets/check.svg";
import ExclamationSvg from "@assets/exclamation.svg";

type Props = TouchableOpacityProps & {
  data: FocusDto;
};

export function FocusCard({ data, ...rest }: Props) {
  return (
    <TouchableOpacity {...rest}>
      <HStack
        bg="gray.500"
        alignItems="center"
        rounded="md"
        p={2}
        pr={4}
        mb={4}
      >
        <Image
          source={{
            uri: `${api.defaults.baseURL}/avatar/${data.filename}`,
          }}
          defaultSource={DefaultImage}
          alt="Imagem do foco"
          w={16}
          h={16}
          rounded="md"
          mr={4}
          resizeMode="cover"
        />
        <VStack flex={1}>
          <Text fontSize="sm" color="gray.200" numberOfLines={1}>
            Criado por: <Text fontFamily="heading">{data.name}</Text>
          </Text>
          <Text fontSize="sm" color="white" numberOfLines={2}>
            {data.descricao}
          </Text>
        </VStack>
        <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
        {data.concluido ? (
          <CheckSvg
            width={12}
            height={12}
            color={"#00875F"}
            style={{ position: "absolute", top: 8, right: 8 }}
          />
        ) : (
          <ExclamationSvg
            width={12}
            height={12}
            color={"#ec942c"}
            style={{ position: "absolute", top: 8, right: 8 }}
          />
        )}
      </HStack>
    </TouchableOpacity>
  );
}

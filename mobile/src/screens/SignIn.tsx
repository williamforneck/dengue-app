import {
  Center,
  HStack,
  Heading,
  Image,
  ScrollView,
  Text,
  VStack,
  useToast,
} from "native-base";
import { Controller, useForm } from "react-hook-form";

import { AppError } from "@utils/AppError";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import BackgroundImage from "@assets/background1.png";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import LogoSvg from "@assets/logo.svg";
import { useAuth } from "@hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

type FormData = {
  email: string;
  password: string;
};

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const { signIn } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleNewAccount = () => {
    navigation.navigate("signUp");
  };

  const handleSignIn = async ({ email, password }: FormData) => {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível entrar. Tente novamente mais tarde.";

      setLoading(false);

      toast.show({
        title,
        bgColor: "red.500",
        placement: "top",
      });
    } finally {
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImage}
          defaultSource={BackgroundImage}
          alt="Mosquito da Dengue"
          resizeMode="contain"
          position="absolute"
        />
        <Center my={24} mb={4}>
          <HStack alignItems={"center"}>
            <LogoSvg width={40} color={"#00875F"} />
            <Heading ml={4} color="gray.100" fontSize={24} fontFamily="heading">
              Caça Dengue
            </Heading>
          </HStack>
          <Text color="gray.100" fontSize="sm">
            Unidos contra a dengue
          </Text>
        </Center>
        <Center>
          <Heading color="gray.100" fontSize="xl" fontFamily="heading" mb={6}>
            Acesse sua conta
          </Heading>
          <Controller
            control={control}
            name="email"
            rules={{ required: "Informe o E-mail" }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          ></Controller>

          <Controller
            control={control}
            name="password"
            rules={{ required: "Informe a senha" }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          ></Controller>

          <Button
            title="Acessar"
            onPress={handleSubmit(handleSignIn)}
            isLoading={loading}
          />
        </Center>
        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>
          <Button
            onPress={handleNewAccount}
            title="Criar conta"
            variant="outline"
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}

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

import BackgroundImage from "@assets/background1.png";
import LogoSvg from "@assets/logo_2.svg";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { useAuth } from "@hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import { AppError } from "@utils/AppError";
import { useState } from "react";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
      <VStack flex={1} pb={16}>
        <Image
          source={BackgroundImage}
          defaultSource={BackgroundImage}
          alt="Mosquito da Dengue"
          resizeMode="cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        />
        <Center my={24} mt={12} mb={4}>
          <HStack alignItems={"center"}>
            <LogoSvg width={200} height={200} color={"#00875F"} />
          </HStack>
          <Text color="gray.100" fontSize="sm">
            Unidos contra a dengue
          </Text>
        </Center>
        <KeyboardAwareScrollView
          enableAutomaticScroll
          keyboardOpeningTime={0}
          extraHeight={Platform.select({})}
        >
          <Center px={10}>
            <Heading color="gray.100" fontSize="xl" fontFamily="heading" mb={2}>
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
          <Center px={10} mt={12}>
            <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
              Ainda não tem acesso?
            </Text>
            <Button
              onPress={handleNewAccount}
              title="Criar conta"
              variant="outline"
            />
          </Center>
        </KeyboardAwareScrollView>
      </VStack>
    </ScrollView>
  );
}

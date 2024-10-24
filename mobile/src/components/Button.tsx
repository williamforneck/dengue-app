import { Button as ButtonNativeBase, IButtonProps, Text } from "native-base";

type Props = IButtonProps & {
  title: string;
  variant?: "solid" | "outline";
  type?: 'error' | 'normal'
};

export function Button({ title, type = 'normal', variant = "solid", ...rest }: Props) {
  return (
    <ButtonNativeBase
      w="full"
      h={14}
      opacity={rest.disabled ? 0.3 : 1}
      bg={variant === "outline" ? "transparent" : "green.700"}
      borderWidth={variant === "outline" ? 1 : 0}
      borderColor={type === 'normal' ? 'green.500' : 'red.500'}
      {...rest}
      rounded="sm"
      _pressed={{
        bg: variant === "outline" ? "gray.500" : "green.500",
      }}
    >
      <Text
        color={variant === "outline" && type === 'normal' ? "green.500" : type === 'error' && variant === 'outline' ? 'red.500' : "white"}
        fontFamily="heading"
        fontSize="sm"
      >
        {title}
      </Text>
    </ButtonNativeBase>
  );
}

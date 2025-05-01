import { Message } from "@/components/auth/form-message";

export interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  searchParams?: Message;
}

export interface AuthPageProps {
  searchParams: Promise<Message>;
}

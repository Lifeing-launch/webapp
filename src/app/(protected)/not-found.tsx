import ErrorTemplate from "@/components/layout/error";

export default function NotFound() {
  return (
    <ErrorTemplate
      heading="Page Not Found 😔"
      description=" Sorry, we can't find the page you're looking for."
    />
  );
}

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/subscription/manage");
  return null;
}

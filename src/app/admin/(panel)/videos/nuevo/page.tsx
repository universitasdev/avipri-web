import { redirect } from "next/navigation";

export default function NewVideoRedirectPage() {
  redirect("/admin");
}

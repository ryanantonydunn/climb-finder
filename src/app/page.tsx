import { PasswordDialog } from "@/components/PasswordDialog";
import { Layout } from "@/components/search-climbs/Layout";
import { cookies } from "next/headers";

export default function Home() {
  const cookiesStore = cookies();
  const loginCookies = cookiesStore.get(process.env.PAGE_PASSWORD_COOKIE!);
  const isLoggedIn = !!loginCookies?.value;

  if (!isLoggedIn) {
    return <PasswordDialog />;
  } else {
    return <Layout />;
  }
}

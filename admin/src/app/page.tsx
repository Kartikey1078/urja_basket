import { redirect } from "next/navigation";

/** Root must not be fully static so `/` always participates correctly with auth redirects. */
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("/dashboard");
}

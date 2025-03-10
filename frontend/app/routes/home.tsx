import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { TrpcTest } from "../components/TrpcTest";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8">
      <Welcome />
      <TrpcTest />
    </div>
  );
}

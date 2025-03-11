import { TrpcTest } from "../components/TrpcTest";

export function meta() {
  return [
    { title: "Admin Dashboard" },
    { name: "description", content: "Admin Dashboard for Testing" },
  ];
}

export default function Admin() {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <TrpcTest />
    </div>
  );
} 
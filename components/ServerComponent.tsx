import ClientComponent from "@/components/ClientComponent";

export default function ServerComponent() {
  return (
    <div>
      Server Component <ClientComponent message="Hello from server" />
    </div>
  );
}

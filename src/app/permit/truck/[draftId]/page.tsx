import { TruckForm } from "@/components/TruckForm/TruckForm";

export default function Step2Page({ params }: any) {
  const { draftId } = params;

  if (!draftId) {
    return <p>Missing draft ID. Please start from Step 1.</p>;
  }

  return (
    <main className="container">
      <h1>Truck Information</h1>
      <TruckForm draftId={draftId} />
    </main>
  );
}

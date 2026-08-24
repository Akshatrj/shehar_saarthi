import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper">
      <Spinner label="Loading SheharSaarthi" />
    </div>
  );
}

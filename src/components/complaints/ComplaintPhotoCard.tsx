import { Card } from "@/components/ui/Card";
import { ComplaintPhoto } from "@/components/complaints/ComplaintPhoto";

type ComplaintPhotoCardProps = {
  src: string;
  alt?: string;
};

export function ComplaintPhotoCard({ src, alt }: ComplaintPhotoCardProps) {
  return (
    <Card className="self-start overflow-hidden p-0">
      <ComplaintPhoto src={src} alt={alt} />
    </Card>
  );
}

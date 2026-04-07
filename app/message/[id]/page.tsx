import { MessageDetailPage } from "@/components/pages/message-detail-page";

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  return <MessageDetailPage id={id} />;
}

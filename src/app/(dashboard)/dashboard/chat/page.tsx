import { AIChat } from "@/components/chat/ai-chat";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold">Mentor IA</h1>
        <p className="text-brand-muted-gray">
          Tu asistente contextual entrenado con la documentación de tu empresa
        </p>
      </div>
      <AIChat />
    </div>
  );
}

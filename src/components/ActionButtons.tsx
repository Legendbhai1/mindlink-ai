interface ActionButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
}

const ActionButton = ({ icon, title, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all duration-200 hover:scale-105 text-left w-full"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium text-foreground">{title}</span>
  </button>
);

interface ActionButtonsProps {
  onAction: (action: string, prompt?: string) => void;
}

export const ActionButtons = ({ onAction }: ActionButtonsProps) => {
  const actions = [
    {
      icon: "🖼️",
      title: "Create image",
      action: "create-image",
      prompt: "Create an image of"
    },
    {
      icon: "💡",
      title: "Brainstorm",
      action: "brainstorm",
      prompt: "Help me brainstorm ideas about"
    },
    {
      icon: "💬",
      title: "Get advice",
      action: "advice",
      prompt: "I need advice on"
    },
    {
      icon: "⚡",
      title: "Code",
      action: "code",
      prompt: "Help me write code for"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {actions.map((action) => (
        <ActionButton
          key={action.action}
          icon={action.icon}
          title={action.title}
          onClick={() => onAction(action.action, action.prompt)}
        />
      ))}
    </div>
  );
};
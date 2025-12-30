import { MessageCircle } from 'lucide-react';

const FloatingContactButton = () => {
  const handleContact = () => {
    // Placeholder link - can be updated to actual customer service URL
    window.open('https://t.me/support', '_blank');
  };

  return (
    <button
      onClick={handleContact}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 animate-pulse"
      style={{ animationDuration: '2s' }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="font-medium">联系客服</span>
    </button>
  );
};

export default FloatingContactButton;

import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, languageNames } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'header' | 'sidebar';
}

const LanguageSwitcher = ({ variant = 'header' }: LanguageSwitcherProps) => {
  const { lang, setLang } = useLanguage();

  const languages: Language[] = ['zh', 'en'];

  if (variant === 'sidebar') {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        {languages.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              lang === l
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-muted-foreground/10 text-muted-foreground'
            }`}
          >
            {languageNames[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-white/10 gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[lang]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l)}
            className={lang === l ? 'bg-secondary/10' : ''}
          >
            {languageNames[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

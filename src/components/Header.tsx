
import React from 'react';
import { Sparkles, History, Library, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onToggleHistory?: () => void;
  showHistoryButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleHistory, 
  showHistoryButton = false 
}) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="border-b border-border bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Análise IA</h1>
                <p className="text-xs text-muted-foreground">Inteligência Documental</p>
              </div>
            </Link>

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Análise
                </Link>
                <Link
                  to="/library"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/library' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Biblioteca
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Navigation */}
            {user && (
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <span className="sr-only">Menu</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/">Análise</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/library">Biblioteca</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* History Toggle (only on index page) */}
            {showHistoryButton && onToggleHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleHistory}
                className="hidden md:flex"
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

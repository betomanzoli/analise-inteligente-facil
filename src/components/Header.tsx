
import React from 'react';
import { FileText, User, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleHistory?: () => void;
  showHistoryButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory, showHistoryButton }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-surface-elevated border-b border-border shadow-subtle">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Análise Inteligente</h1>
                <p className="text-sm text-subtle">Consultoria automatizada com IA</p>
              </div>
            </div>
            
            {user && showHistoryButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleHistory}
                className="ml-4"
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      {user.user_metadata?.full_name || 'Usuário'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm">
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

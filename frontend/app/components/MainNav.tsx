import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MessageSquare, Book } from 'lucide-react';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link
        href="/"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Overview
      </Link>
      <Link
        href="/documents"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/documents' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Documents
      </Link>
      <Link
        href="/chat"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary flex items-center',
          pathname === '/chat' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        AI Chat
      </Link>
      <Link
        href="/admin/knowledge-base"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary flex items-center',
          pathname === '/admin/knowledge-base'
            ? 'text-primary'
            : 'text-muted-foreground'
        )}
      >
        <Book className="w-4 h-4 mr-1" />
        Knowledge Base
      </Link>
    </nav>
  );
}

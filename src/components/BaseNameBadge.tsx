import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Hexagon } from 'lucide-react';

interface BaseNameBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Visual indicator for users with Base/ENS resolved names.
 * Shows that the identity is decentralized and verified on-chain.
 */
const BaseNameBadge = ({ className = '', size = 'sm' }: BaseNameBadgeProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`
            gap-1 border-blue-500/30 bg-blue-500/10 text-blue-400 
            hover:bg-blue-500/20 cursor-help
            ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}
            ${className}
          `}
        >
          <Hexagon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          <span>Base</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-center">
        <p className="text-xs">This identity is resolved directly from Base/ENS on-chain</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default BaseNameBadge;

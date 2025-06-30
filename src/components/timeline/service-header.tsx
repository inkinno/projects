'use client';

import * as React from 'react';
import type { Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { updateService } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ServiceHeaderProps {
  service: Service;
}

export function ServiceHeader({ service }: ServiceHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(service.name);
  const [emoji, setEmoji] = React.useState(service.emoji);
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (name.trim() === '' || emoji.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Service name and emoji cannot be empty.',
      });
      // Revert changes
      setName(service.name);
      setEmoji(service.emoji);
      return;
    }
    
    if (name !== service.name || emoji !== service.emoji) {
      await updateService(service.id, { name, emoji });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(service.name);
      setEmoji(service.emoji);
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  
  React.useEffect(() => {
    setName(service.name);
    setEmoji(service.emoji);
  }, [service]);


  return (
    <th
      className="min-w-48 border-b border-r p-2 text-sm font-semibold"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-12 p-1 text-center text-lg"
            maxLength={2}
          />
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8 flex-grow"
          />
        </div>
      ) : (
        <div className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md hover:bg-accent/20">
          <span className="text-lg">{emoji}</span>
          <span className="truncate">{name}</span>
        </div>
      )}
    </th>
  );
}

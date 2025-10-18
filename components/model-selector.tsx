'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { ALL_CHAT_MODEL_IDS } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const availableChatModels = chatModels.filter((chatModel) =>
    ALL_CHAT_MODEL_IDS.includes(chatModel.id),
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ),
    [optimisticModelId, availableChatModels],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;
          const isSolace2 = id === 'chat-model-2';

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                if (isSolace2) return; // Prevent selection if Solace 2.0
                setOpen(false);
                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={id === optimisticModelId}
              asChild
              disabled={isSolace2}
            >
              <button
                type="button"
                className={`gap-4 group/item flex flex-row justify-between items-center w-full${isSolace2 ? ' opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSolace2}
                title={isSolace2 ? 'Premium only (coming soon)' : ''}
              >
                <div className="flex flex-col gap-1 items-start">
                  <div className="flex items-center gap-2">
                    {chatModel.name}
                    {isSolace2 && (
                      <span className="inline-block rounded-full bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 text-xs font-semibold ml-1 border border-yellow-300 dark:border-yellow-500">
                        Premium only
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chatModel.description}
                  </div>
                </div>
                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

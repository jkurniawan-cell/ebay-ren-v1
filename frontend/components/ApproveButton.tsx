/**
 * Approve Button Component
 * Button to approve and freeze current planning cycle as snapshot
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApproveButtonProps {
  planningCycle: string;
  onApprove: (cycle: string) => Promise<void>;
  disabled?: boolean;
}

export function ApproveButton({
  planningCycle,
  onApprove,
  disabled = false
}: ApproveButtonProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(planningCycle);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Button
      onClick={handleApprove}
      disabled={disabled}
      className="bg-green-600 hover:bg-green-700 text-xs h-7 px-4"
      size="sm"
    >
      ✓ Approve {planningCycle}
    </Button>
  );
}

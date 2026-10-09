import { useState, useCallback, useRef } from 'react';

export function useConfirm() {
  const resolverRef = useRef(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Delete',
    type: 'danger'
  });

  const confirm = useCallback(({ title, description, confirmLabel = 'Delete', type = 'danger' }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({
        isOpen: true,
        title,
        description,
        confirmLabel,
        type
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return {
    confirm,
    confirmState: {
      ...confirmState,
      onConfirm: handleConfirm,
      onClose: handleClose
    },
    handleClose
  };
}

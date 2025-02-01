import { useState, useCallback } from "react";

export type ModalType = "info" | "success" | "warning" | "error";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
}

const initialState: ModalState = {
  isOpen: false,
  title: "",
  message: "",
  type: "info",
};

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const showModal = useCallback(
    (title: string, message: string, type: ModalType) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    [],
  );

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showModal,
    hideModal,
  };
};

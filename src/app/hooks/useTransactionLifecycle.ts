"use client";

import { useCallback, useRef, useState } from "react";
import { TransactionContext, TransactionLifecycle } from "@/app/types/transaction";
import { mapTransactionError } from "@/app/utils/transactionErrors";

type StateTransition =
  | { type: "START_BUILD"; context: TransactionContext }
  | { type: "BUILD_SUCCESS" }
  | { type: "AWAIT_SIGNATURE" }
  | { type: "SIGNATURE_SUCCESS" }
  | { type: "SUBMIT" }
  | { type: "SUBMIT_SUCCESS"; txHash: string }
  | { type: "CONFIRM" }
  | { type: "CONFIRM_SUCCESS" }
  | { type: "ERROR"; error: unknown }
  | { type: "RESET" }
  | { type: "RETRY" };

const initialState: TransactionLifecycle = {
  state: "idle",
  context: { operation: "" },
  error: null,
  txHash: null,
  startedAt: null,
  completedAt: null,
};

export function useTransactionLifecycle() {
  const [lifecycle, setLifecycle] = useState<TransactionLifecycle>(initialState);
  const submitLock = useRef(false);

  const transition = useCallback((action: StateTransition) => {
    setLifecycle((prev) => {
      if (action.type === "SUBMIT" && submitLock.current) {
        return prev;
      }

      switch (action.type) {
        case "START_BUILD":
          submitLock.current = false;
          return {
            ...initialState,
            state: "building",
            context: action.context,
            startedAt: Date.now(),
          };

        case "BUILD_SUCCESS":
          if (prev.state !== "building") return prev;
          return { ...prev, state: "awaiting-signature" };

        case "AWAIT_SIGNATURE":
          if (prev.state !== "building" && prev.state !== "idle") return prev;
          return { ...prev, state: "awaiting-signature" };

        case "SIGNATURE_SUCCESS":
          if (prev.state !== "awaiting-signature") return prev;
          return { ...prev, state: "submitting" };

        case "SUBMIT":
          if (prev.state !== "submitting" || submitLock.current) return prev;
          submitLock.current = true;
          return { ...prev, state: "submitting" };

        case "SUBMIT_SUCCESS":
          if (prev.state !== "submitting") return prev;
          return { ...prev, state: "confirming", txHash: action.txHash };

        case "CONFIRM":
          if (prev.state !== "submitting" && prev.state !== "confirming")
            return prev;
          return { ...prev, state: "confirming" };

        case "CONFIRM_SUCCESS":
          submitLock.current = false;
          return {
            ...prev,
            state: "success",
            completedAt: Date.now(),
          };

        case "ERROR":
          submitLock.current = false;
          return {
            ...prev,
            state: "error",
            error: mapTransactionError(action.error),
            completedAt: Date.now(),
          };

        case "RETRY":
          submitLock.current = false;
          return {
            ...prev,
            state: "building",
            error: null,
            txHash: null,
            completedAt: null,
          };

        case "RESET":
          submitLock.current = false;
          return initialState;

        default:
          return prev;
      }
    });
  }, []);

  const canSubmit = lifecycle.state === "idle" || lifecycle.state === "error";
  const isProcessing =
    lifecycle.state === "building" ||
    lifecycle.state === "awaiting-signature" ||
    lifecycle.state === "submitting" ||
    lifecycle.state === "confirming";

  return {
    lifecycle,
    transition,
    canSubmit,
    isProcessing,
    isSuccess: lifecycle.state === "success",
    isError: lifecycle.state === "error",
  };
}
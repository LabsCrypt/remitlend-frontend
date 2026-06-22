// src/app/hooks/__tests__/useConfirmedMutation.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useConfirmedMutation } from "../useConfirmedMutation";

const mockAction = jest.fn(() => Promise.resolve());

test("trigger opens dialog with summary and confirm calls action", async () => {
  const buildSummary = jest.fn(() => [{ label: "Amount", value: "100" }]);
  const { result } = renderHook(() =>
    useConfirmedMutation(mockAction, { title: "Confirm", buildSummary })
  );

  // Initially closed
  expect(result.current.dialogProps.isOpen).toBe(false);

  // Trigger with variables
  act(() => {
    result.current.trigger({ amount: 100 });
  });

  // Dialog should be open and summary set
  expect(result.current.dialogProps.isOpen).toBe(true);
  expect(buildSummary).toHaveBeenCalledWith({ amount: 100 });
  expect(result.current.dialogProps.summary).toEqual([{ label: "Amount", value: "100" }]);

  // Confirm should call the action and close dialog
  await act(async () => {
    await result.current.dialogProps.onConfirm();
  });

  expect(mockAction).toHaveBeenCalledWith({ amount: 100 });
  expect(result.current.dialogProps.isOpen).toBe(false);
});

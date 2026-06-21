import { useState, useRef } from "react";
import React from "react";

/**
 * Shared hook for 4-digit OTP input logic.
 * Handles state, refs, change/keydown/paste handlers, and auto-complete callback.
 *
 * @param onComplete - called automatically when all 4 digits are filled
 */
export function useOtp(onComplete?: (otp: string) => void) {
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""]);

  // One ref per box — fixed array, safe to call unconditionally
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtpValues = [...otpValues];
    newOtpValues[index] = cleanVal;
    setOtpValues(newOtpValues);

    const combinedOtp = newOtpValues.join("");
    setOtp(combinedOtp);

    // Auto-focus next box
    if (cleanVal !== "" && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-trigger callback when all 4 digits are filled
    if (combinedOtp.length === 4) {
      onComplete?.(combinedOtp);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        // Clear previous box and move focus back
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = "";
        setOtpValues(newOtpValues);
        setOtp(newOtpValues.join(""));
        otpRefs[index - 1].current?.focus();
      } else if (otpValues[index] !== "") {
        // Just clear current box
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
        setOtp(newOtpValues.join(""));
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const newOtpValues = pastedData.split("");
      setOtpValues(newOtpValues);
      const combinedOtp = newOtpValues.join("");
      setOtp(combinedOtp);
      onComplete?.(combinedOtp);
      otpRefs[3].current?.focus();
    }
  };

  /** Resets all boxes back to empty — call after OTP error or resend */
  const resetOtp = () => {
    setOtp("");
    setOtpValues(["", "", "", ""]);
    otpRefs[0].current?.focus();
  };

  return {
    otp,
    otpValues,
    otpRefs,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    resetOtp,
  };
}

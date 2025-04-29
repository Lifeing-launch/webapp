import React from "react";
import { Card, CardContent } from "../ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "@radix-ui/react-label";
import { SubmitButton } from "../form/submit-button";
import { verifyOtpAction } from "@/utils/supabase/actions";

const VerifyEmailForm = async () => {
  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <form className="flex flex-col gap-9">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Verify your email</h1>
              <p className="text-sm">
                We sent you a six digit confirmation code to email@email.com
                Please enter it below to confirm your email address.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-sm">
                Enter 6-digit code
              </Label>
              <InputOTP maxLength={6} id="otp" name="otp">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-sm">
              Didn&apos;t receive a code?{" "}
              <a href="#" className="underline">
                Send code again
              </a>
              .
            </div>

            <SubmitButton
              className="w-full"
              formAction={verifyOtpAction}
              pendingText="Verifying..."
            >
              {" "}
              Verify{" "}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailForm;

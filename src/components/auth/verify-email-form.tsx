import React from "react";
import { Card, CardContent } from "../ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "@radix-ui/react-label";
import { SubmitButton } from "../form/submit-button";
import { verifyOtpAction } from "@/utils/supabase/actions";
import { AuthFormProps } from "@/typing/interfaces";
import { FormMessage } from "./form-message";
import { redirect } from "next/navigation";
import { getSecureCookie, VERIFICATION_EMAIL_COOKIE } from "@/utils/cookies";

const VerifyEmailForm = async ({ searchParams }: AuthFormProps) => {
  // Check if the verification email cookie is set
  const email = await getSecureCookie(VERIFICATION_EMAIL_COOKIE);

  // Redirect to login if the cookie is missing
  if (!email) {
    redirect("/login");
  }

  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <form className="flex flex-col gap-9">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Verify your email</h1>
              <p className="text-sm">
                We sent you a six digit confirmation code to {email}. Please
                enter it below to confirm your email address.
              </p>
              <FormMessage message={searchParams} />
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

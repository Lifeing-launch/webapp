import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { CreditCard } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const breadcrumbs: Breadcrumb[] = [
  { label: "Profile", href: "/profile" },
  { label: "Cancel Subscription" },
];

const CancelPlansPage = () => {
  return (
    <PageTemplate
      breadcrumbs={breadcrumbs}
      headerIcon={<CreditCard />}
      title="Cancel Subscription"
    >
      <div className="max-w-lg flex flex-col gap-5">
        <section className="my-4">
          <h2 className="text-base mb-2 font-medium">
            We&apos;re sorry to see you go!
          </h2>
          <div className="text-muted-foreground text-xs">
            <p className="mb-5">
              Cancelling your subscription will result in loss of access to
              premium features at the end of your current billing cycle.
            </p>
            <p className="mb-5">
              This action will not delete your account, only end your current
              subscription. You can re-subscribe at any time.
            </p>
          </div>
        </section>
        <section>
          <Label htmlFor="reason" className="mb-3">
            Let us know why you&apos;re cancelling (Optional)
          </Label>
          <Textarea placeholder="Your feedback help us improve" id="reason" />
        </section>
        <section className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant={"ghost"}>
            <Link href="/subscription/manage"> Go back to my plans </Link>
          </Button>
          <Button> Confirm Cancellation </Button>
        </section>
      </div>
    </PageTemplate>
  );
};

export default CancelPlansPage;

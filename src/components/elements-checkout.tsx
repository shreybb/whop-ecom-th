import { useEffect, useRef, useState } from "react";

import { confirmCheckoutSession, createCheckoutSession } from "#/lib/server-fns";

const ELEMENTS_SRC = "https://js.whop.cloud/elements/amber/elements.js";
const ENVIRONMENT = "production";

type ElementsCheckoutProps = {
  planId: string;
  accountId?: string;
  returnUrl: string;
  eventId?: string;
};

type ElementAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
};

type AddressValue = {
  complete: boolean;
  address: ElementAddress;
};

type EmailValue = {
  email: string;
  complete: boolean;
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(src)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-whop-elements", "");
    script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(src)));
    document.head.append(script);
  });
}

export function ElementsCheckout({ planId, accountId, returnUrl, eventId }: ElementsCheckoutProps) {
  const brandingRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvcRef = useRef<HTMLDivElement>(null);
  const whopRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const cardFieldsRef = useRef<any>(null);
  const brandingElementRef = useRef<any>(null);
  const emailElementRef = useRef<any>(null);
  const addressElementRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailValue, setEmailValue] = useState<EmailValue>({ email: "", complete: false });
  const [addressValue, setAddressValue] = useState<AddressValue | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        await loadScript(ELEMENTS_SRC);
        if (destroyed) return;

        const session = await createCheckoutSession({
          data: { planId, returnUrl, eventId },
        });
        if (destroyed) return;
        sessionRef.current = session;

        const amount = session.amount;
        const sellerId = session.seller_id ?? accountId;
        if (!sellerId) throw new Error("This checkout could not find a seller account.");

        const whop = (window as any).WhopElements({ environment: ENVIRONMENT });
        whopRef.current = whop;
        const payments = whop.payments.create({
          accountId: sellerId,
          currency: session.currency || "usd",
          amount,
          paymentMethodConfiguration: session.payment_method_configuration,
          checkoutSession: {
            id: session.id,
            clientSecret: session.client_secret,
          },
          returnUrl,
          appearance: { theme: { appearance: "light" } },
        });
        paymentsRef.current = payments;

        const branding = payments.create("branding");
        brandingElementRef.current = branding;
        branding.mount(brandingRef.current);

        const emailElement = payments.create("email", {
          onChange: (payload: EmailValue) => setEmailValue(payload),
          onError: (event: { message?: string }) => setError(event.message ?? "Email could not load."),
        });
        emailElementRef.current = emailElement;
        emailElement.mount(emailRef.current);

        const addressElement = payments.create("address", {
          mode: "shipping",
          onChange: (payload: AddressValue) => setAddressValue(payload),
          onError: (event: { message?: string }) => setError(event.message ?? "Address could not load."),
        });
        addressElementRef.current = addressElement;
        addressElement.mount(addressRef.current);

        const cardFields = payments.create("cardFields", {
          onChange: (payload: { complete?: boolean }) => setCardComplete(Boolean(payload.complete)),
        });
        cardFieldsRef.current = cardFields;
        setMounted(true);
        cardFields.create("cardNumber").mount(cardNumberRef.current);
        cardFields.create("cardExpiry").mount(cardExpiryRef.current);
        cardFields.create("cardCvc").mount(cardCvcRef.current);
      } catch (failure) {
        if (destroyed) return;
        setError(failure instanceof Error ? failure.message : "This checkout could not be opened.");
      }
    })();

    return () => {
      destroyed = true;
      cardFieldsRef.current?.destroy?.();
      brandingElementRef.current?.destroy?.();
      emailElementRef.current?.destroy?.();
      addressElementRef.current?.destroy?.();
      paymentsRef.current?.destroy?.();
      cardFieldsRef.current = null;
      brandingElementRef.current = null;
      emailElementRef.current = null;
      addressElementRef.current = null;
      paymentsRef.current = null;
      sessionRef.current = null;
      for (const slot of [cardNumberRef, cardExpiryRef, cardCvcRef, emailRef, addressRef, brandingRef]) {
        if (slot.current) slot.current.innerHTML = "";
      }
      setMounted(false);
      setCardComplete(false);
    };
  }, [accountId, planId, returnUrl]);

  async function onCompletePurchase() {
    const session = sessionRef.current;
    if (!session || !addressValue) return;
    setSubmitting(true);
    setError(null);
    try {
      const { confirmationToken } = await paymentsRef.current.createConfirmationToken({
        billingDetails: {
          email: emailValue.email.trim(),
          name: addressValue.address.name?.trim(),
          address: {
            line1: addressValue.address.line1?.trim(),
            line2: addressValue.address.line2?.trim() || undefined,
            city: addressValue.address.city?.trim(),
            state: addressValue.address.state?.trim(),
            postal_code: addressValue.address.postal_code?.trim(),
            country: addressValue.address.country,
          },
        },
      });

      const result = await confirmCheckoutSession({
        data: {
          sessionId: session.id,
          clientSecret: session.client_secret,
          confirmationToken,
          quotedAt: session.quoted_at,
        },
      });

      if (result.last_confirm_error) {
        throw new Error(result.last_confirm_error.message ?? "Payment could not be completed.");
      }
      if (result.next_action?.type === "complete" && result.next_action.client_secret) {
        await whopRef.current.payments.handleNextAction({
          clientSecret: result.next_action.client_secret,
          returnUrl,
        });
      }
      if (result.next_action?.type === "redirect" && result.next_action.destination_url) {
        window.location.assign(result.next_action.destination_url);
        return;
      }
      window.location.assign(returnUrl);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your payment could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  const readyToPay =
    mounted &&
    emailValue.complete &&
    Boolean(addressValue?.complete) &&
    cardComplete &&
    !submitting;

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      {!mounted && !error ? <p className="py-8 text-center text-sm text-neutral-500">Loading checkout…</p> : null}
      <div hidden={!mounted}>
        <div className="min-h-14" ref={emailRef} />
        <div className="mt-4 min-h-16" ref={addressRef} />
        <div className="mt-6">
          <div className="min-h-12" ref={cardNumberRef} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="min-h-12" ref={cardExpiryRef} />
            <div className="min-h-12" ref={cardCvcRef} />
          </div>
        </div>
        <button
          type="button"
          className="mt-6 w-full bg-black py-3 text-sm text-white disabled:opacity-40"
          disabled={!readyToPay}
          onClick={onCompletePurchase}
        >
          {submitting ? "Working…" : "Pay now"}
        </button>
        <div className="mt-4 min-h-5" ref={brandingRef} />
      </div>
    </div>
  );
}

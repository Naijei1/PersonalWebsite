import { useEffect, useRef, useState, type FormEvent } from "react";
const endpoint =
  import.meta.env.VITE_DEMO_FORM_ENDPOINT ||
  "https://formsubmit.co/ajax/nj277@cornell.edu";
export function DemoRequest() {
  const [status, setStatus] = useState<
      "idle" | "sending" | "success" | "error"
    >("idle"),
    [email, setEmail] = useState("");
  const result = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (status === "success") result.current?.focus();
  }, [status]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget,
      data = new FormData(form);
    if (String(data.get("_honey") || "").trim()) return;
    const requesterEmail = String(data.get("email") || "").trim();
    setStatus("sending");
    abort.current = new AbortController();
    const timer = setTimeout(() => abort.current?.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email: requesterEmail,
          organization: String(data.get("organization") || "").trim(),
          space_type: data.get("space_type"),
          message: String(data.get("message") || "").trim(),
          _subject: "Gnarly — New demo request",
          _template: "table",
          _honey: "",
        }),
        signal: abort.current.signal,
      });
      const body = await response.json();
      if (
        !response.ok ||
        (body.success !== true && body.success !== "true") ||
        /activat|confirm your email/i.test(String(body.message || ""))
      )
        throw new Error("Request was not accepted");
      setEmail(requesterEmail);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  };
  return (
    <section
      className="demo-section section"
      id="request-demo"
      aria-labelledby="demo-title"
    >
      <div className="demo-intro">
        <h2 id="demo-title">
          Tell us about
          <br />
          <span>your building.</span>
        </h2>
        <p>
          Floors, entrances, and the rooms visitors ask for most. We’ll reply
          to set up a call.
        </p>
        <div className="demo-expectations">
          <h3>On the call</h3>
          <ul>
            <li>
              The recorded route above, step by step: mapper, web editor and
              AR navigator.
            </li>
            <li>
              How your floors, entrances and elevators would join into one
              map.
            </li>
            <li>What mapping a first route in your building would take.</li>
          </ul>
        </div>
      </div>
      {status === "success" ? (
        <div className="form-success" ref={result} tabIndex={-1} role="status">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="21" stroke="currentColor" />
            <path d="m14 24 7 7 14-14" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h3>You’re on our map.</h3>
          <p>
            Thanks for reaching out. We’ll follow up at <strong>{email}</strong>{" "}
            to arrange your demo.
          </p>
          <button
            className="text-link"
            type="button"
            onClick={() => setStatus("idle")}
          >
            Send another request
          </button>
        </div>
      ) : (
        <form
          className="demo-form"
          onSubmit={submit}
          aria-label="Request a Gnarly demo"
          aria-busy={status === "sending"}
        >
          <div className="form-row">
            <label htmlFor="demo-name">
              Full name
              <input
                id="demo-name"
                name="name"
                autoComplete="name"
                required
                maxLength={120}
              />
            </label>
            <label htmlFor="demo-email">
              Work email
              <input
                id="demo-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
          </div>
          <label htmlFor="demo-organization">
            Organization
            <input
              id="demo-organization"
              name="organization"
              autoComplete="organization"
              required
              maxLength={160}
            />
          </label>
          <label htmlFor="demo-space">
            What kind of space?
            <select
              aria-label="What kind of space?"
              id="demo-space"
              name="space_type"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select your space
              </option>
              <option>Offices & workplaces</option>
              <option>Campuses & education</option>
              <option>Healthcare</option>
              <option>Events & public venues</option>
              <option>Another kind of space</option>
            </select>
          </label>
          <label htmlFor="demo-message">
            Describe your building <span>(optional)</span>
            <textarea
              id="demo-message"
              name="message"
              rows={4}
              maxLength={3000}
              placeholder="How many floors, where visitors enter, and where they get lost."
            />
          </label>
          <div className="honey-field" aria-hidden="true">
            <label>
              Leave this field empty
              <input name="_honey" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {status === "error" && (
            <p className="form-error" role="alert">
              Your request couldn’t be sent. Your details are still here—please
              try again.
            </p>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending your request…" : "Request a demo"}
            <svg
              className="arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <p className="form-note">
            We’ll use these details to respond to your request. Submissions are
            processed by{" "}
            <a
              href="https://formsubmit.co/privacy.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              FormSubmit<span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </form>
      )}
    </section>
  );
}

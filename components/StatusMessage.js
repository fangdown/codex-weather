import { AlertTriangle, CloudSun, Loader2 } from "lucide-react";

export default function StatusMessage({ type = "empty", title, message }) {
  const Icon = type === "loading" ? Loader2 : type === "error" ? AlertTriangle : CloudSun;

  return (
    <section className={`status-message status-${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon className={type === "loading" ? "h-5 w-5 animate-spin" : "h-5 w-5"} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
      </div>
    </section>
  );
}

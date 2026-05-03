/**
 * Imperative text-prompt API. Replaces the native window.prompt() so the
 * dialog uses shadcn's Dialog component.
 *
 * Usage from any component:
 *   const value = await promptText({ title: "Custom title", value: existing });
 *   if (value === null) return; // user cancelled
 *
 * The dialog itself is mounted once in the editor route via <PromptHost/>.
 */

interface PromptOpts {
  title: string;
  description?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface PromptRequest extends Required<Omit<PromptOpts, "description">> {
  description: string | null;
  resolve: (value: string | null) => void;
}

class PromptHostState {
  current: PromptRequest | null = $state(null);

  ask(opts: PromptOpts): Promise<string | null> {
    return new Promise((resolve) => {
      this.current = {
        title: opts.title,
        description: opts.description ?? null,
        label: opts.label ?? "",
        value: opts.value ?? "",
        placeholder: opts.placeholder ?? "",
        confirmLabel: opts.confirmLabel ?? "Save",
        cancelLabel: opts.cancelLabel ?? "Cancel",
        resolve,
      };
    });
  }

  resolveCurrent(value: string | null): void {
    if (!this.current) return;
    const req = this.current;
    this.current = null;
    req.resolve(value);
  }
}

export const promptHost = new PromptHostState();

export function promptText(opts: PromptOpts): Promise<string | null> {
  return promptHost.ask(opts);
}

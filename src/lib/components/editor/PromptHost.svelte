<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { promptHost } from "$lib/editor/prompt.svelte";

  let value = $state("");
  let inputEl = $state<HTMLInputElement | null>(null);

  // Sync the local input value when a new prompt opens.
  let lastSeenRequest: typeof promptHost.current = null;
  $effect(() => {
    const req = promptHost.current;
    if (req !== lastSeenRequest) {
      lastSeenRequest = req;
      if (req) {
        value = req.value;
        // Focus the input after the dialog is mounted.
        queueMicrotask(() => inputEl?.select());
      }
    }
  });

  let open = $derived(promptHost.current !== null);

  function handleConfirm(): void {
    promptHost.resolveCurrent(value);
  }

  function handleCancel(): void {
    promptHost.resolveCurrent(null);
  }

  function handleOpenChange(next: boolean): void {
    if (!next && promptHost.current) {
      // Closed via outside-click or Esc.
      handleCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-md">
    {#if promptHost.current}
      <Dialog.Header>
        <Dialog.Title>{promptHost.current.title}</Dialog.Title>
        {#if promptHost.current.description}
          <Dialog.Description>{promptHost.current.description}</Dialog.Description>
        {/if}
      </Dialog.Header>

      <div class="flex flex-col gap-2 py-2">
        {#if promptHost.current.label}
          <Label for="prompt-input" class="text-xs">{promptHost.current.label}</Label>
        {/if}
        <Input
          id="prompt-input"
          bind:ref={inputEl}
          bind:value
          placeholder={promptHost.current.placeholder}
          onkeydown={handleKeydown}
          autocomplete="off"
        />
      </div>

      <Dialog.Footer>
        <Button variant="outline" size="sm" onclick={handleCancel}>
          {promptHost.current.cancelLabel}
        </Button>
        <Button variant="default" size="sm" onclick={handleConfirm}>
          {promptHost.current.confirmLabel}
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>

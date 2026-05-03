<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { Calendar } from "$lib/components/ui/calendar";
  import {
    today,
    getLocalTimeZone,
    parseDate,
    type DateValue,
    CalendarDate,
  } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";

  /**
   * Inline date picker. ISO yyyy-mm-dd in/out. null means "use today".
   *
   * Anatomy: shadcn Popover trigger button shows the current date label;
   * popover body has the shadcn Calendar.
   */
  let {
    value,
    onChange,
    label = "Date",
  }: {
    /** ISO yyyy-mm-dd, or null to mean "today at print time". */
    value: string | null;
    onChange: (next: string | null) => void;
    label?: string;
  } = $props();

  let open = $state(false);

  const tz = getLocalTimeZone();

  function toDateValue(iso: string | null): DateValue {
    if (!iso) return today(tz);
    try {
      return parseDate(iso);
    } catch {
      return today(tz);
    }
  }

  function fmt(d: DateValue): string {
    return d.toDate(tz).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  let currentValue = $derived(toDateValue(value));
  let displayLabel = $derived(value === null ? `${fmt(today(tz))} (today)` : fmt(currentValue));

  function handleSelect(d: DateValue | undefined): void {
    if (!d) return;
    if (d instanceof CalendarDate) {
      const iso = `${String(d.year).padStart(4, "0")}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
      onChange(iso);
    } else {
      const iso = `${String(d.year).padStart(4, "0")}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
      onChange(iso);
    }
    open = false;
  }

  function reset(): void {
    onChange(null);
    open = false;
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="sm" class="h-7 gap-1.5 px-2">
        <CalendarIcon class="size-3.5" />
        <span>{label}: {displayLabel}</span>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0" align="start">
    <Calendar type="single" value={currentValue} onValueChange={handleSelect} />
    {#if value !== null}
      <div class="border-foreground/15 border-t p-2">
        <Button variant="ghost" size="sm" class="w-full justify-start gap-2" onclick={reset}>
          <RotateCcw class="size-3.5" />
          Use today
        </Button>
      </div>
    {/if}
  </Popover.Content>
</Popover.Root>

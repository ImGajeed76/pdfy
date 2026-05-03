<script lang="ts" module>
  import { getContext, setContext } from "svelte";
  import type { VariantProps } from "tailwind-variants";
  import { toggleVariants } from "$lib/components/ui/toggle/index.js";

  type ToggleVariants = VariantProps<typeof toggleVariants>;

  interface ToggleGroupContext extends ToggleVariants {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }

  export function setToggleGroupCtx(props: ToggleGroupContext) {
    setContext("toggleGroup", props);
  }

  export function getToggleGroupCtx() {
    return getContext<Required<ToggleGroupContext>>("toggleGroup");
  }
</script>

<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    size = "default",
    spacing = 0,
    orientation = "horizontal",
    variant = "default",
    disallowDeselect = true,
    onValueChange,
    ...restProps
  }: ToggleGroupPrimitive.RootProps &
    ToggleVariants & {
      spacing?: number;
      orientation?: "horizontal" | "vertical";
      /** When true (default), clicking the active item is a no-op so the
          group always has at least one selection. Set false to allow empty. */
      disallowDeselect?: boolean;
    } = $props();

  setToggleGroupCtx({
    get variant() {
      return variant;
    },
    get size() {
      return size;
    },
    get spacing() {
      return spacing;
    },
    get orientation() {
      return orientation;
    },
  });

  // Intercept value changes so we can drop empty/empty-array updates when
  // disallowDeselect is on. We pass `value` one-way to the primitive (no
  // bind:) so we own the state — otherwise the bind syncs the deselected
  // value before our handler can reject it.
  function handleValueChange(next: string | string[]): void {
    if (disallowDeselect) {
      const isEmpty = Array.isArray(next) ? next.length === 0 : next === "";
      if (isEmpty) return;
    }
    value = next as typeof value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (onValueChange as ((v: typeof next) => void) | undefined)?.(next as any);
  }
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<ToggleGroupPrimitive.Root
  value={value as never}
  onValueChange={handleValueChange as never}
  bind:ref
  {orientation}
  data-slot="toggle-group"
  data-variant={variant}
  data-size={size}
  data-spacing={spacing}
  style={`--gap: ${spacing}`}
  class={cn(
    "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-vertical:flex-col data-vertical:items-stretch data-[size=sm]:rounded-[min(var(--radius-md),8px)]",
    className,
  )}
  {...restProps}
/>

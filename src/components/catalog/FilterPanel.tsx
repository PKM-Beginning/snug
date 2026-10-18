"use client";

import type { CategorySlug, Gender, Merchant, ProductFilters } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { DISCOUNT_OPTIONS, GENDER_OPTIONS, MERCHANT_OPTIONS, PRICE_OPTIONS, RATING_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/format";

interface Props {
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  hideCategory?: boolean;
  idPrefix: string;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({ filters, onChange, hideCategory, idPrefix }: Props) {
  const set = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-6">
      {!hideCategory && (
        <Group title="Category">
          {categories.map((c) => (
            <Check
              key={c.slug}
              id={`${idPrefix}-cat-${c.slug}`}
              label={c.shortName}
              checked={filters.categories.includes(c.slug)}
              onChange={() => set("categories", toggle<CategorySlug>(filters.categories, c.slug))}
            />
          ))}
        </Group>
      )}

      <Group title="Gender">
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <Pill
              key={g.value}
              active={filters.genders.includes(g.value)}
              onClick={() => set("genders", toggle<Gender>(filters.genders, g.value))}
            >
              {g.label}
            </Pill>
          ))}
        </div>
      </Group>

      <Group title="Price">
        {PRICE_OPTIONS.map((p) => (
          <Radio
            key={String(p.value)}
            name={`${idPrefix}-price`}
            id={`${idPrefix}-price-${p.value ?? "any"}`}
            label={p.label}
            checked={filters.maxPrice === p.value}
            onChange={() => set("maxPrice", p.value)}
          />
        ))}
      </Group>

      <Group title="Discount">
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((d) => (
            <Pill key={d} active={filters.minDiscount === d} onClick={() => set("minDiscount", d)}>
              {d === 0 ? "Any" : `${d}%+`}
            </Pill>
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <Pill key={r} active={filters.minRating === r} onClick={() => set("minRating", r)}>
              {r === 0 ? "Any" : `${r}★ & up`}
            </Pill>
          ))}
        </div>
      </Group>

      <Group title="Marketplace">
        {MERCHANT_OPTIONS.map((m) => (
          <Check
            key={m}
            id={`${idPrefix}-m-${m}`}
            label={m}
            checked={filters.merchants.includes(m)}
            onChange={() => set("merchants", toggle<Merchant>(filters.merchants, m))}
          />
        ))}
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-900/60">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-navy-900/30 accent-navy-900" />
      {label}
    </label>
  );
}

function Radio({ id, name, label, checked, onChange }: { id: string; name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input id={id} name={name} type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-navy-900" />
      {label}
    </label>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/15 bg-white hover:border-navy-900/40"
      )}
    >
      {children}
    </button>
  );
}

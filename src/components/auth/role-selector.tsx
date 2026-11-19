"use client"

import {
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { IUser } from "@/lib/types/all-types"

/** Only the roles a user is allowed to pick during sign-up. */
export type SignUpRole = Extract<IUser["role"], "customer" | "vendor">

const ROLE_OPTIONS: ReadonlyArray<{
  value: SignUpRole
  label: string
  description: string
}> = [
  {
    value: "customer",
    label: "Customer",
    description: "Browse the menu and place orders.",
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "Manage your menu and receive orders.",
  },
]

type RoleSelectorProps = {
  value: SignUpRole
  onValueChange: (role: SignUpRole) => void
}

export function RoleSelector({ value, onValueChange }: RoleSelectorProps) {
  return (
    <FieldSet>
      <FieldLegend>Account type</FieldLegend>
      <FieldDescription>Pick how you want to use Pizza Plaza.</FieldDescription>
      <RadioGroup
        name="role"
        value={value}
        onValueChange={onValueChange}
        className="grid gap-3 sm:grid-cols-2"
      >
        {ROLE_OPTIONS.map((option) => (
          <FieldLabel
            key={option.value}
            className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
          >
            <RadioGroupItem value={option.value} aria-label={option.label} />
            <FieldContent>
              <FieldTitle>{option.label}</FieldTitle>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </FieldLabel>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}

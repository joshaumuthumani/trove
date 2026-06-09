"use client";
/* Trove — Button. Renders a Next <Link> when `href` is set (usable from server
   components for navigation), otherwise a <button> with onClick. Ported from
   lib.jsx. */
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./icon";

type Variant = "default" | "accent" | "ghost" | "danger" | "ghostDanger";
type Size = "sm" | "md";

interface BaseProps {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export function Button({
  children,
  variant = "default",
  size = "md",
  icon,
  iconRight,
  onClick,
  disabled,
  type,
  className,
  title,
  href,
}: BaseProps & {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  href?: string;
}) {
  const classes = cx("btn", `btn--${variant}`, `btn--${size}`, className);
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 17} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes} title={title}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type || "button"} title={title} onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  );
}

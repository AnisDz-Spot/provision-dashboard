import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, src, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          name && getInitials(name)
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };


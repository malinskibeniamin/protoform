"use client";
import React, { createContext, useContext } from "react";

import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

type GroupPosition = "first" | "middle" | "last";

interface GroupContextValue {
  attached: boolean;
  position?: GroupPosition | undefined;
}

const GroupContext = createContext<GroupContextValue>({
  attached: false,
  position: undefined,
});

const useGroup = () => useContext(GroupContext);

function GroupItemContext({ attached, children, position }: GroupContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ attached, position }), [attached, position]);
  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

const Group = ({
  children,
  className,
  testId,
  attached = false,
}: {
  children: React.ReactNode;
  className?: string;
  attached?: boolean;
} & SharedProps) => {
  const childrenArray = React.Children.toArray(children).filter((child) => React.isValidElement(child));
  const childCount = childrenArray.length;

  const content = childrenArray.map((child, index) => {
    const getPosition = (): GroupPosition | undefined => {
      if (!attached || childCount === 1) {
        return;
      }
      if (index === 0) {
        return "first";
      }
      if (index === childCount - 1) {
        return "last";
      }
      return "middle";
    };

    const position = getPosition();
    const element = child as React.ReactElement;
    const key = element.key || `group-item-${index}`;

    return (
      <GroupItemContext attached={attached} key={key} position={position}>
        {child}
      </GroupItemContext>
    );
  });

  return (
    <div className={cn("flex w-full items-stretch", !attached && "items-end gap-1.5", className)} data-testid={testId}>
      {content}
    </div>
  );
};

export { Group, type GroupContextValue, type GroupPosition, useGroup };

import { ReactNode, cloneElement, isValidElement } from "react";
import { useVisualEditing } from "../contexts/VisualEditingContext";

interface EditableContentProps {
  collection: string;
  itemId: string | number;
  fields?: string | string[];
  mode?: 'drawer' | 'modal' | 'popover';
  children: ReactNode;
  className?: string;
}

export function EditableContent({ 
  collection, 
  itemId, 
  fields,
  mode = 'drawer',
  children, 
  className = "" 
}: EditableContentProps) {
  const { isEnabled, setAttr } = useVisualEditing();

  if (!isEnabled) {
    return <>{children}</>;
  }

  // Generate the data-directus attribute
  const directusAttr = setAttr({
    collection,
    item: itemId,
    fields,
    mode
  });

  // If children is a single React element, add the data-directus attribute to it
  if (isValidElement(children)) {
    return cloneElement(children as any, {
      'data-directus': directusAttr,
      className: `${(children.props as any).className || ''} ${className}`.trim()
    });
  }

  // Otherwise wrap in a div
  return (
    <div data-directus={directusAttr} className={className}>
      {children}
    </div>
  );
}


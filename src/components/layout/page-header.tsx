import { ReactNode } from "react";

interface IPageHeader {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: IPageHeader) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex shrink-0 items-center pt-3 py-4 px-4 border-b">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
